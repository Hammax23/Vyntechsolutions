import { notFound } from "next/navigation";
import { loadServiceDetailBundle } from "@/lib/cms/service-bundle";
import ServiceDetailClient from "@/components/ServiceDetailClient";

export default async function ServicePage({
  params,
}: {
  params: { slug: string };
}) {
  const bundle = await loadServiceDetailBundle(params.slug);
  if (!bundle.service) notFound();

  return (
    <ServiceDetailClient
      slug={bundle.slug}
      initialService={bundle.service}
      initialNavChrome={bundle.navChrome}
    />
  );
}
