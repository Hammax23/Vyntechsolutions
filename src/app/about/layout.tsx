import type { Metadata } from "next";
import { metadataForStatic } from "@/lib/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForStatic("about", "/about");
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
