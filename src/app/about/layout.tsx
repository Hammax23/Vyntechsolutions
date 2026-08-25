import type { Metadata } from "next";
import { metadataForStatic } from "@/lib/cms/metadata";
import CmsStructuredData from "@/components/CmsStructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForStatic("about", "/about");
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CmsStructuredData path="/about" />
      {children}
    </>
  );
}
