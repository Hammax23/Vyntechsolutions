import { NextRequest, NextResponse } from "next/server";
import { getCmsBlogPost, getCmsRelatedPosts } from "@/lib/cms/content";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const post = await getCmsBlogPost(params.slug);
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const related = await getCmsRelatedPosts(params.slug, 3);
  return NextResponse.json({ post, related });
}
