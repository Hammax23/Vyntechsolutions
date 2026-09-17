import { notFound } from "next/navigation";
import { loadIndustryDetailBundle } from "@/lib/cms/industry-bundle";
import IndustryDetailClient from "@/components/IndustryDetailClient";

export default async function IndustryPage({
  params,
}: {
  params: { slug: string };
}) {
  const bundle = await loadIndustryDetailBundle(params.slug);
  if (!bundle.industry) notFound();

  return (
    <IndustryDetailClient
      slug={bundle.slug}
      initialIndustry={bundle.industry}
      initialNavChrome={bundle.navChrome}
    />
  );
}
