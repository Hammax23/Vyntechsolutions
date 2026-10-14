import { NextRequest, NextResponse } from "next/server";
import {
  blogpostConfigured,
  checkBlogpostCredentials,
  clearBlogpostCookie,
  getBlogpostSession,
  setBlogpostCookie,
} from "@/lib/blogpost-admin";

export const dynamic = "force-dynamic";

const attempts = new Map<string, { n: number; until: number }>();

export async function GET() {
  return NextResponse.json({ user: getBlogpostSession(), configured: blogpostConfigured() });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (body.step === "logout") {
    clearBlogpostCookie();
    return NextResponse.json({ success: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rec = attempts.get(ip);
  if (rec && rec.n >= 5 && rec.until > Date.now()) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  if (!blogpostConfigured()) {
    return NextResponse.json({ error: "BLOGPOST_EMAIL / BLOGPOST_PASSWORD are not set" }, { status: 500 });
  }

  const email = String(body.email || "");
  if (!checkBlogpostCredentials(email, String(body.password || ""))) {
    attempts.set(ip, { n: (rec && rec.until > Date.now() ? rec.n : 0) + 1, until: Date.now() + 15 * 60 * 1000 });
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  attempts.delete(ip);
  setBlogpostCookie(email.trim().toLowerCase());
  return NextResponse.json({ success: true, user: { email: email.trim().toLowerCase() } });
}
