import type { Metadata } from "next";
import { metadataForLegal } from "@/lib/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForLegal("terms-and-conditions", "/terms-and-conditions");
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
