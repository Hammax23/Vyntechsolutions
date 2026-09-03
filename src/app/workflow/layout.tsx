import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workflow",
  robots: { index: false, follow: false },
};

export default function WorkflowLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
