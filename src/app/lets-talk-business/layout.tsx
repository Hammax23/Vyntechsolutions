import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Let's Build Together",
  description:
    "Ready to transform your digital presence? Contact VynTech Solutions for a free consultation. Get a quote for web development, mobile apps, or enterprise software solutions. Serving businesses across Canada.",
  keywords: [
    "contact VynTech Solutions",
    "web development quote Canada",
    "software development consultation",
    "digital agency contact Toronto",
    "get quote web development",
    "hire web developers Canada",
    "free consultation tech",
  ],
  openGraph: {
    title: "Contact VynTech Solutions - Let's Build Your Digital Future",
    description:
      "Get in touch for a free consultation. Transform your business with Canada's leading digital agency.",
    url: "https://vyntechsolutions.ca/lets-talk-business",
    type: "website",
  },
  alternates: {
    canonical: "https://vyntechsolutions.ca/lets-talk-business",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
