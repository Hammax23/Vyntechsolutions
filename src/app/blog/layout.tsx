import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Insights & Industry Trends",
  description:
    "Stay updated with the latest in web development, digital trends, technology insights, and best practices from VynTech Solutions' expert team in Canada. Tips for businesses in Toronto, Vancouver, Montreal & nationwide.",
  keywords: [
    "web development blog",
    "tech insights Canada",
    "digital transformation tips",
    "software development trends",
    "Canadian tech news",
    "business technology blog",
    "web design tips",
    "mobile app trends",
  ],
  openGraph: {
    title: "VynTech Solutions Blog - Digital Insights & Technology Trends",
    description:
      "Expert insights on web development, digital transformation, and technology trends for Canadian businesses.",
    url: "https://vyntechsolutions.ca/blog",
    type: "website",
  },
  alternates: {
    canonical: "https://vyntechsolutions.ca/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
