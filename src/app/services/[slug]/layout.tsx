import type { Metadata } from "next";
import { metadataForService } from "@/lib/cms/metadata";
import CmsStructuredData from "@/components/CmsStructuredData";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  return metadataForService(params.slug);
}

export default function ServiceSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  return (
    <>
      <CmsStructuredData serviceSlug={params.slug} />
      {children}
    </>
  );
}
