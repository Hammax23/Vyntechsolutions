import {
  servicesData,
  servicesListingDefaults,
  type ServicesListingDefaults,
  type ServiceData,
} from "@/data/servicesData";
import { loadServicesListingBundle } from "@/lib/cms/service-bundle";
import { getCmsPageSeo } from "@/lib/cms/content";
import ServicesListingClient from "@/components/ServicesListingClient";

type ListingService = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  cardImage?: string;
};

function mergeListingChrome(
  defaults: ServicesListingDefaults,
  page: Record<string, unknown> | null | undefined,
  promo?: {
    heading?: string;
    body?: string;
    ctaLabel?: string;
    ctaHref?: string;
  } | null
): ServicesListingDefaults {
  if (!page && !promo) return defaults;

  const sections =
    page?.sections && typeof page.sections === "object" && !Array.isArray(page.sections)
      ? (page.sections as Record<string, unknown>)
      : {};

  const pick = (...vals: unknown[]) => {
    for (const v of vals) {
      if (typeof v === "string" && v.trim()) return v;
    }
    return undefined;
  };

  const statsRaw = Array.isArray(sections.stats)
    ? sections.stats
    : Array.isArray(page?.stats)
      ? page.stats
      : null;

  const stats =
    statsRaw && statsRaw.length
      ? statsRaw
          .map((s) => {
            const row = s as { value?: string; label?: string };
            return {
              value: String(row?.value || ""),
              label: String(row?.label || ""),
            };
          })
          .filter((s) => s.value || s.label)
      : defaults.stats;

  const whyChooseRaw = Array.isArray(sections.whyChooseItems)
    ? sections.whyChooseItems
    : null;

  const whyChooseItems =
    whyChooseRaw && whyChooseRaw.length
      ? whyChooseRaw
          .map((item) => {
            const row = item as { title?: string; description?: string };
            return {
              title: String(row?.title || ""),
              description: String(row?.description || ""),
            };
          })
          .filter((item) => item.title || item.description)
      : defaults.whyChooseItems;

  return {
    heroEyebrow:
      pick(sections.heroEyebrow, page?.heroEyebrow) || defaults.heroEyebrow,
    heroHeading:
      pick(page?.heroHeading, sections.heroHeading) || defaults.heroHeading,
    heroBody: pick(page?.heroBody, sections.heroBody) || defaults.heroBody,
    learnMoreLabel:
      pick(sections.learnMoreLabel, page?.learnMoreLabel) ||
      defaults.learnMoreLabel,
    whyChooseEyebrow:
      pick(sections.whyChooseEyebrow, page?.whyChooseEyebrow) ||
      defaults.whyChooseEyebrow,
    whyChooseHeading:
      pick(sections.whyChooseHeading, page?.whyChooseHeading) ||
      defaults.whyChooseHeading,
    whyChooseBody:
      pick(sections.whyChooseBody, page?.whyChooseBody) ||
      defaults.whyChooseBody,
    whyChooseItems,
    stats,
    secondaryCtaLabel:
      pick(sections.secondaryCtaLabel, page?.secondaryCtaLabel) ||
      defaults.secondaryCtaLabel,
    ctaHeading:
      pick(promo?.heading, sections.ctaHeading, page?.ctaHeading) ||
      defaults.ctaHeading,
    ctaBody:
      pick(promo?.body, sections.ctaBody, page?.ctaBody) || defaults.ctaBody,
    ctaLabel:
      pick(promo?.ctaLabel, sections.ctaLabel, page?.ctaLabel) ||
      defaults.ctaLabel,
    ctaHref:
      pick(promo?.ctaHref, sections.ctaHref, page?.ctaHref) || defaults.ctaHref,
  };
}

export default async function ServicesPage() {
  const [bundle, pageSeo] = await Promise.all([
    loadServicesListingBundle(),
    getCmsPageSeo("/services").catch(() => null),
  ]);

  const page = bundle.staticPage as Record<string, unknown> | null;
  const promo = bundle.promo as
    | { heading?: string; body?: string; ctaLabel?: string; ctaHref?: string }
    | null;
  const sections =
    page?.sections && typeof page.sections === "object" && !Array.isArray(page.sections)
      ? (page.sections as Record<string, unknown>)
      : {};
  const cmsHero =
    (typeof page?.heroHeading === "string" && page.heroHeading.trim()) ||
    (typeof sections.heroHeading === "string" && sections.heroHeading.trim()) ||
    "";
  const seoH1 = typeof pageSeo?.h1 === "string" ? String(pageSeo.h1).trim() : "";

  const chrome = mergeListingChrome(servicesListingDefaults, page, promo);
  const initialChrome =
    !cmsHero && seoH1 ? { ...chrome, heroHeading: seoH1 } : chrome;

  const fallbackBySlug = new Map(
    Object.entries(servicesData).map(([slug, data]) => [slug, data])
  );

  const initialList: ListingService[] = (bundle.services.length
    ? bundle.services
    : Object.entries(servicesData).map(([slug, data]) => ({ slug, ...data }))
  ).map((s) => {
    const slug = String(s.slug || "");
    const fallback = fallbackBySlug.get(slug);
    const features = Array.isArray(s.features)
      ? s.features
          .map((f) =>
            typeof f === "string"
              ? f
              : String((f as { title?: string })?.title || "")
          )
          .filter(Boolean)
      : (fallback?.features || []).map((f) => f.title);
    return {
      slug,
      title: String(s.title || fallback?.title || ""),
      description: String(s.description || fallback?.description || ""),
      icon: String(s.icon || fallback?.icon || "code"),
      features: features.length
        ? features
        : (fallback?.features || []).map((f) => f.title),
      cardImage: s.cardImage || fallback?.cardImage,
    };
  }).filter((s) => s.slug);

  return (
    <ServicesListingClient
      initialList={initialList}
      initialChrome={initialChrome}
      initialNavChrome={bundle.navChrome}
    />
  );
}
