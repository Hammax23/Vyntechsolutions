import type { Metadata } from "next";
import { metadataForIndustry } from "@/lib/cms/metadata";
import CmsStructuredData from "@/components/CmsStructuredData";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  return metadataForIndustry(params.slug);
}

export default function IndustrySlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  return (
    <>
      <CmsStructuredData industrySlug={params.slug} />
      {children}
    </>
  );
}
