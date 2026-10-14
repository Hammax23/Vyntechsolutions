import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Post Panel",
  robots: { index: false, follow: false },
};

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
