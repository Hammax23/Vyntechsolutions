import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireBlogAuth } from "@/lib/blogpost-admin";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

/** Store a cover image in the website database; served from /api/blog-image/[id]. */
export async function POST(request: NextRequest) {
  const { error } = requireBlogAuth();
  if (error) return error;
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Use JPG, PNG, WebP, GIF or AVIF" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });
  const img = await prisma.blogImage.create({
    data: { mime: file.type, data: Buffer.from(await file.arrayBuffer()) },
  });
  return NextResponse.json({ url: `/api/blog-image/${img.id}` });
}
