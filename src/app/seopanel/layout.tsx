import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO Panel",
  robots: { index: false, follow: false },
};

export default function SeoPanelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
