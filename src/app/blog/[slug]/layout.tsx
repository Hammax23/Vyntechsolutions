import type { Metadata } from "next";
import { metadataForBlog } from "@/lib/cms/metadata";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  return metadataForBlog(params.slug);
}

export default function BlogSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
