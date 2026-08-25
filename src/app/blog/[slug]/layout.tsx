import type { Metadata } from "next";
import { metadataForBlog } from "@/lib/cms/metadata";
import CmsStructuredData from "@/components/CmsStructuredData";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  return metadataForBlog(params.slug);
}

export default function BlogSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  return (
    <>
      <CmsStructuredData blogSlug={params.slug} />
      {children}
    </>
  );
}
