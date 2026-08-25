import type { Metadata } from "next";
import { metadataForLegal } from "@/lib/cms/metadata";
import CmsStructuredData from "@/components/CmsStructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForLegal("terms-and-conditions", "/terms-and-conditions");
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CmsStructuredData path="/terms-and-conditions" />
      {children}
    </>
  );
}
