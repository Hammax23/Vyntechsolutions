import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cleanInput, requireBlogAuth, revalidateBlog } from "@/lib/blogpost-admin";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { error } = requireBlogAuth();
  if (error) return error;
  const post = await prisma.blogPostEntry.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

/** `publish: true` goes live, `unpublish: true` takes it offline, otherwise the publish state is unchanged. */
export async function PUT(request: NextRequest, { params }: Ctx) {
  const { error } = requireBlogAuth();
  if (error) return error;
  const body = await request.json().catch(() => ({}));
  const parsed = cleanInput(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const current = await prisma.blogPostEntry.findUnique({ where: { id: params.id } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (parsed.data.slug !== current.slug) {
    const clash = await prisma.blogPostEntry.findUnique({ where: { slug: parsed.data.slug } });
    if (clash) return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
  }
  const published = body.publish === true ? true : body.unpublish === true ? false : current.published;
  const post = await prisma.blogPostEntry.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      published,
      publishedAt: published ? current.publishedAt ?? new Date() : null,
    },
  });
  revalidateBlog(post.slug, current.slug);
  return NextResponse.json({ post });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { error } = requireBlogAuth();
  if (error) return error;
  const current = await prisma.blogPostEntry.findUnique({ where: { id: params.id } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.blogPostEntry.delete({ where: { id: params.id } });
  revalidateBlog(current.slug);
  return NextResponse.json({ success: true });
}
