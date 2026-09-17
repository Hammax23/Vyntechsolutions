import { loadAboutPageBundle } from "@/lib/cms/about-bundle";
import AboutPageClient from "@/components/AboutPageClient";

export default async function AboutPage() {
  const bundle = await loadAboutPageBundle();

  return (
    <AboutPageClient
      initialChrome={bundle.chrome}
      initialNavChrome={bundle.navChrome}
      initialHomepage={bundle.homepage}
    />
  );
}
