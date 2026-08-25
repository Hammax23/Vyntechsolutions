import type { Metadata } from "next";
import { metadataForStatic } from "@/lib/cms/metadata";
import CmsStructuredData from "@/components/CmsStructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForStatic("careers", "/careers");
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CmsStructuredData path="/careers" />
      {children}
    </>
  );
}
