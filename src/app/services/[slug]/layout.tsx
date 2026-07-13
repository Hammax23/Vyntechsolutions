import type { Metadata } from "next";
import { metadataForService } from "@/lib/cms/metadata";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  return metadataForService(params.slug);
}

export default function ServiceSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
