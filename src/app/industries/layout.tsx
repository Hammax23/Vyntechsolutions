import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industries We Serve - Specialized Digital Solutions",
  description:
    "Specialized digital solutions for healthcare, fintech, retail, real estate, education, and more. Industry-specific expertise delivering tailored web and software solutions for Canadian businesses.",
  keywords: [
    "healthcare software Canada",
    "fintech development Toronto",
    "retail ecommerce solutions",
    "real estate software",
    "education technology Canada",
    "industry specific software",
    "enterprise solutions",
    "Canadian industry solutions",
  ],
  openGraph: {
    title: "Industries We Serve - VynTech Solutions | Specialized Digital Solutions",
    description:
      "Industry-specific digital solutions for healthcare, fintech, retail, and more. Tailored expertise for Canadian businesses.",
    url: "https://vyntechsolutions.ca/industries",
    type: "website",
  },
  alternates: {
    canonical: "https://vyntechsolutions.ca/industries",
  },
};

export default function IndustriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
