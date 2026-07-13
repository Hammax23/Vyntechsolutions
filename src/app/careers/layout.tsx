import type { Metadata } from "next";
import { metadataFromPath } from "@/lib/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataFromPath("/careers", {
    title: "Careers | VynTech Solutions",
    description: "Join the VynTech Solutions team and build digital products for Canadian businesses.",
  });
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
