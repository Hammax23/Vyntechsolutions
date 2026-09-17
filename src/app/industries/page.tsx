import {
  loadIndustriesListingBundle,
} from "@/lib/cms/industry-bundle";
import IndustriesListingClient from "@/components/IndustriesListingClient";

export default async function IndustriesPage() {
  const bundle = await loadIndustriesListingBundle();

  return (
    <IndustriesListingClient
      initialList={bundle.industries}
      initialChrome={bundle.chrome}
      initialNavChrome={bundle.navChrome}
    />
  );
}
