import type { Metadata } from "next";
import { VynRankAuthProvider } from "@/components/vynrank/VynRankAuthContext";
import "./vynrank.css";

export const metadata: Metadata = {
  title: "VynRank SEO Desk",
  robots: { index: false, follow: false },
};

export default function VynRankLayout({ children }: { children: React.ReactNode }) {
  return <VynRankAuthProvider>{children}</VynRankAuthProvider>;
}
