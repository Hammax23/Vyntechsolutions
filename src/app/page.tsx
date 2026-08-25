import type { Metadata } from "next";
import { getCmsFaqs } from "@/lib/cms/content";
import { getStructuredDataForPath, metadataForHome } from "@/lib/cms/metadata";
import { faqSchema } from "@/lib/seo.config";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LogoCarousel from "@/components/LogoCarousel";
import OurServices from "@/components/OurServices";
import IndustriesImpact from "@/components/IndustriesImpact";
import TechnologyImpact from "@/components/TechnologyImpact";
import TechnologyStack from "@/components/TechnologyStack";
import FeaturedInsights from "@/components/FeaturedInsights";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForHome();
}

export default async function Home() {
  const [structuredData, cmsFaqs] = await Promise.all([
    getStructuredDataForPath("/"),
    getCmsFaqs("home"),
  ]);

  const faqJsonLd =
    cmsFaqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: cmsFaqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        }
      : faqSchema;

  return (
    <main>
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <HeroSection />
      <LogoCarousel />
      <OurServices />
      <TechnologyStack />
      <TechnologyImpact />
      <IndustriesImpact />
      <FeaturedInsights />
      <FAQ />
      <Footer />
    </main>
  );
}
