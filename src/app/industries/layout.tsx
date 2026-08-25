import type { Metadata } from "next";
import { metadataFromPath } from "@/lib/cms/metadata";
import CmsStructuredData from "@/components/CmsStructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return metadataFromPath("/industries", {
    title: "Industries We Serve | VynTech Solutions",
    description:
      "Industry-focused digital solutions for healthcare, finance, retail, education, and more across Canada.",
  });
}

export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CmsStructuredData path="/industries" />
      {children}
    </>
  );
}
