import { NextResponse } from "next/server";
import { getCmsBlogPosts } from "@/lib/cms/content";

export async function GET() {
  const posts = await getCmsBlogPosts();
  return NextResponse.json({ posts });
}
