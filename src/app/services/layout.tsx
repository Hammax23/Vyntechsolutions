import type { Metadata } from "next";
import { metadataFromPath } from "@/lib/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataFromPath("/services", {
    title: "Our Services - Web Development, Mobile Apps & Digital Solutions",
    description:
      "Explore VynTech Solutions' comprehensive digital services: custom web development, mobile app development, UI/UX design, cloud solutions, AI/ML, and enterprise software.",
  });
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
