import type { Metadata } from "next";
import { metadataFromPath } from "@/lib/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataFromPath("/blog", {
    title: "Blog | VynTech Solutions",
    description:
      "Practical insights on software development, technology decisions, and building digital products.",
  });
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
