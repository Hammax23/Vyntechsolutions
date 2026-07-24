import type { Metadata } from "next";
import { servicesData } from "@/data/servicesData";

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

  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  return {
    title: `${service.title} Services in ${formattedCity} | VynTech Solutions`,
    description: `Leading ${service.title.toLowerCase()} services in ${formattedCity}. We help businesses grow with custom digital solutions tailored to the local market.`,
    alternates: {
      canonical: `https://vyntechsolutions.com/services/${params.slug}/${params.city}`,
    },
    openGraph: {
      title: `${service.title} in ${formattedCity} | VynTech Solutions`,
      description: `Get top-tier ${service.title.toLowerCase()} services in ${formattedCity}.`,
      url: `https://vyntechsolutions.com/services/${params.slug}/${params.city}`,
      siteName: "VynTech Solutions",
      type: "website",
    },
  };
}

export default function CityServiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
