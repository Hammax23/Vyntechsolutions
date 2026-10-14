import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cleanInput, requireBlogAuth, revalidateBlog } from "@/lib/blogpost-admin";
import { blogPosts } from "@/data/blogData";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = requireBlogAuth();
  if (error) return error;
  const posts = await prisma.blogPostEntry.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, slug: true, category: true, featured: true, published: true, updatedAt: true },
  });
  const used = await prisma.blogPostEntry.findMany({ select: { category: true }, distinct: ["category"] });
  const categories = Array.from(
    new Set([...blogPosts.map((p) => p.category), ...used.map((u) => u.category)].filter(Boolean))
  ).sort();
  return NextResponse.json({ posts, categories });
}

export async function POST(request: NextRequest) {
  const { error } = requireBlogAuth();
  if (error) return error;
  const body = await request.json().catch(() => ({}));
  const parsed = cleanInput(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const exists = await prisma.blogPostEntry.findUnique({ where: { slug: parsed.data.slug } });
  if (exists) return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
  const publish = body.publish === true;
  const post = await prisma.blogPostEntry.create({
    data: { ...parsed.data, published: publish, publishedAt: publish ? new Date() : null },
  });
  revalidateBlog(post.slug);
  return NextResponse.json({ post }, { status: 201 });
}
