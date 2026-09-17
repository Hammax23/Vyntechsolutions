import type { Metadata } from "next";
import { getStructuredDataForPath, metadataForHome } from "@/lib/cms/metadata";
import { faqSchema } from "@/lib/seo.config";
import { loadHomeCmsBundle } from "@/lib/cms/home-bundle";
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
  const [structuredData, cms] = await Promise.all([
    getStructuredDataForPath("/"),
    loadHomeCmsBundle(),
  ]);

  const faqJsonLd =
    cms.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: cms.faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        }
      : faqSchema;

  const hp = cms.homepage;

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
      <HeroSection initialHomepage={hp} />
      <LogoCarousel initialHomepage={hp} initialLogos={cms.logos} />
      <OurServices
        initialHomepage={hp}
        initialServices={cms.services}
        initialRankingPromo={cms.googleRankingPromo}
      />
      <TechnologyStack initialHomepage={hp} />
      <TechnologyImpact initialHomepage={hp} />
      <IndustriesImpact initialHomepage={hp} initialIndustries={cms.industries} />
      <FeaturedInsights initialHomepage={hp} initialPosts={cms.posts} />
      <FAQ
        faqs={cms.faqs}
        eyebrow={hp?.faqEyebrow ? String(hp.faqEyebrow) : undefined}
        heading={hp?.faqHeading ? String(hp.faqHeading) : undefined}
        intro={hp?.faqIntro ? String(hp.faqIntro) : undefined}
      />
      <Footer />
    </main>
  );
}
