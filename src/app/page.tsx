import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LogoCarousel from "@/components/LogoCarousel";
import OurServices from "@/components/OurServices";
import IndustriesImpact from "@/components/IndustriesImpact";
import TechnologyImpact from "@/components/TechnologyImpact";
import TechnologyStack from "@/components/TechnologyStack";
import HowWeWork from "@/components/HowWeWork";
import FeaturedInsights from "@/components/FeaturedInsights";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { getCmsFaqs } from "@/lib/cms/content";


export default async function Home() {
  const allFaqs = await getCmsFaqs();
  const homeFaqs = allFaqs.filter(faq => faq.page === 'global' || faq.page === 'home');

  return (
    <main>
      <Navbar />
      <HeroSection />
      <LogoCarousel />
      <OurServices />
      <TechnologyImpact />
      <IndustriesImpact />
      <TechnologyStack />
      <HowWeWork />
      <FeaturedInsights />
      <FAQ faqs={homeFaqs} />
      <Footer />
    </main>
  );
}
