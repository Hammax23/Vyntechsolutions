import type { Metadata } from "next";
import { servicesData } from "@/data/servicesData";

const SITE_URL = "https://vyntechsolutions.ca";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; city: string };
}): Promise<Metadata> {
  const service = servicesData[params.slug as keyof typeof servicesData];
  const formattedCity = params.city
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const path = `/services/${params.slug}/${params.city}`;
  const canonical = `${SITE_URL}${path}`;

  if (!service) {
    return {
      title: "Service Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${service.title} Services in ${formattedCity} | VynTech Solutions`;
  const description = `Leading ${service.title.toLowerCase()} services in ${formattedCity}. We help businesses grow with custom digital solutions tailored to the local market.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${service.title} in ${formattedCity} | VynTech Solutions`,
      description: `Get top-tier ${service.title.toLowerCase()} services in ${formattedCity}.`,
      url: canonical,
      siteName: "VynTech Solutions",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function CityServiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
