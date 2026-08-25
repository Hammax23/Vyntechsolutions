import type { Metadata } from "next";
import { metadataFromPath } from "@/lib/cms/metadata";
import CmsStructuredData from "@/components/CmsStructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return metadataFromPath("/lets-talk-business", {
    title: "Let's Talk Business | VynTech Solutions",
    description: "Request a quote for web development, mobile apps, SEO, and digital solutions.",
  });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CmsStructuredData path="/lets-talk-business" />
      {children}
    </>
  );
}
