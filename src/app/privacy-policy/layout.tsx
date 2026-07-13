import type { Metadata } from "next";
import { metadataForLegal } from "@/lib/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForLegal("privacy-policy", "/privacy-policy");
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
