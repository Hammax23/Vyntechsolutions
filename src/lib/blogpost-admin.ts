import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/** Self-contained auth for the /blogpost panel (BLOGPOST_EMAIL / BLOGPOST_PASSWORD in .env). */
const COOKIE = "blogpost_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

function secret() {
  return `blogpost:${process.env.BLOGPOST_PASSWORD || ""}:${process.env.WORKFLOW_SECRET || ""}`;
}

function sign(body: string) {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function blogpostConfigured() {
  return Boolean(process.env.BLOGPOST_EMAIL && process.env.BLOGPOST_PASSWORD);
}

export function checkBlogpostCredentials(email: string, password: string) {
  if (!blogpostConfigured()) return false;
  const okEmail = safeEqual(email.trim().toLowerCase(), String(process.env.BLOGPOST_EMAIL).trim().toLowerCase());
  const okPass = safeEqual(password, String(process.env.BLOGPOST_PASSWORD));
  return okEmail && okPass;
}

export function setBlogpostCookie(email: string) {
  const body = Buffer.from(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC })).toString("base64url");
  cookies().set(COOKIE, `${body}.${sign(body)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export function clearBlogpostCookie() {
  cookies().set(COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export function getBlogpostSession(): { email: string } | null {
  const token = cookies().get(COOKIE)?.value;
  if (!token || !blogpostConfigured()) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig || !safeEqual(sig, sign(body))) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString());
    if (!p.exp || p.exp < Math.floor(Date.now() / 1000)) return null;
    return { email: String(p.email) };
  } catch {
    return null;
  }
}

export function requireBlogAuth() {
  const session = getBlogpostSession();
  if (!session) return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { session, error: null };
}

/** Refresh the public blog immediately after any change. */
export function revalidateBlog(slug?: string | null, oldSlug?: string | null) {
  revalidateTag("blog");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  for (const s of [slug, oldSlug]) {
    if (!s) continue;
    revalidateTag(`blog-${s}`);
    revalidatePath(`/blog/${s}`);
  }
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function cleanInput(raw: Record<string, unknown>) {
  const title = String(raw.title || "").trim();
  if (!title) return { error: "Title is required" } as const;
  const slug = slugify(String(raw.slug || title));
  if (!slug) return { error: "Slug is required" } as const;
  const str = (k: string, d = "") => (raw[k] === undefined || raw[k] === null ? d : String(raw[k]).trim());
  return {
    data: {
      title,
      slug,
      category: str("category") || "Business",
      excerpt: str("excerpt"),
      content: String(raw.content ?? ""),
      metaDescription: str("metaDescription"),
      tags: str("tags"),
      author: str("author") || "VynTech Solutions Team",
      readTime: str("readTime") || "5 min",
      image: str("image"),
      featured: Boolean(raw.featured),
    },
  } as const;
}
