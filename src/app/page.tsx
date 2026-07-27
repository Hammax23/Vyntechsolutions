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
import { getCmsFaqs } from "@/lib/cms/content";


export default async function Home() {
  const allFaqs = await getCmsFaqs();
  // We can filter faqs if needed, for example to show 'global' or 'home' faqs.
  const homeFaqs = allFaqs.filter(faq => faq.page === 'global' || faq.page === 'home');

  return (
    <main>
      <Navbar />
      <HeroSection />
      <LogoCarousel />
      <OurServices />
      <TechnologyImpact />
      
      <TechnologyStack />
      <FeaturedInsights />
      <IndustriesImpact />
      <FAQ faqs={homeFaqs} />
      <Footer />
    </main>
  );
}
