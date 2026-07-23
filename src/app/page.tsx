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


export default function Home() {
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
      <FAQ />
      <Footer />
    </main>
  );
}
