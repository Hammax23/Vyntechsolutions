import type { Metadata } from "next";
import { metadataForIndustry } from "@/lib/cms/metadata";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  return metadataForIndustry(params.slug);
}

export default function IndustrySlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
