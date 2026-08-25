import type { Metadata } from "next";
import { metadataFromPath } from "@/lib/cms/metadata";
import CmsStructuredData from "@/components/CmsStructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return metadataFromPath("/blog", {
    title: "Blog | VynTech Solutions",
    description:
      "Practical insights on software development, technology decisions, and building digital products.",
  });
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CmsStructuredData path="/blog" />
      {children}
    </>
  );
}
