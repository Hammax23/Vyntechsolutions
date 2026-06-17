import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers - Join Our Team",
  description:
    "Join Canada's fastest-growing digital agency. Explore exciting career opportunities in web development, mobile development, UI/UX design, and technology at VynTech Solutions. Remote-friendly positions available.",
  keywords: [
    "tech jobs Canada",
    "web developer jobs Toronto",
    "software engineer careers",
    "remote tech jobs Canada",
    "digital agency careers",
    "UI/UX designer jobs",
  ],
  openGraph: {
    title: "Careers at VynTech Solutions - Join Canada's Leading Digital Agency",
    description:
      "Build your career with us. Exciting opportunities in web development, design, and technology.",
    url: "https://vyntechsolutions.ca/careers",
    type: "website",
  },
  alternates: {
    canonical: "https://vyntechsolutions.ca/careers",
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
