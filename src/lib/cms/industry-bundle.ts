import {
  getCmsIndustries,
  getCmsIndustry,
  getCmsNavigation,
  getCmsStaticPage,
} from "@/lib/cms/content";
import {
  industriesData,
  industriesListingDefaults,
  type IndustriesListingDefaults,
  type IndustryData,
} from "@/data/industriesData";
import { faqsForIndustry } from "@/data/industryFaqs";
import { DEFAULT_NAV_CHROME, mergeCopy } from "@/lib/ui-copy";

function withIndustryFaqs(
  slug: string,
  industry: IndustryData | null
): IndustryData | null {
  if (!industry) return null;
  if (industry.faqs?.length) return industry;
  const faqs = faqsForIndustry(slug);
  return faqs.length ? { ...industry, faqs } : industry;
}

type NavChrome = typeof DEFAULT_NAV_CHROME;

export type IndustryDetailBundle = {
  slug: string;
  industry: IndustryData | null;
  navChrome: NavChrome;
};

export async function loadIndustryDetailBundle(slug: string): Promise<IndustryDetailBundle> {
  const [industry, navigation] = await Promise.all([
    getCmsIndustry(slug, industriesData).catch(() => null),
    getCmsNavigation().catch(() => null),
  ]);

  const resolved =
    (industry as IndustryData | null) || industriesData[slug] || null;

  return {
    slug,
    industry: withIndustryFaqs(slug, resolved),
    navChrome: mergeCopy(
      DEFAULT_NAV_CHROME,
      (navigation?.chrome as Partial<NavChrome> | undefined) || undefined
    ),
  };
}

export function mergeIndustriesListingChrome(
  defaults: IndustriesListingDefaults,
  page: Record<string, unknown> | null | undefined
): IndustriesListingDefaults {
  if (!page) return defaults;
  const sections =
    page.sections && typeof page.sections === "object" && !Array.isArray(page.sections)
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
    : Array.isArray(page.stats)
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

  return {
    heroHeading: pick(page.heroHeading, sections.heroHeading) || defaults.heroHeading,
    heroBody: pick(page.heroBody, sections.heroBody) || defaults.heroBody,
    heroCtaLabel: pick(page.heroCtaLabel, sections.heroCtaLabel) || defaults.heroCtaLabel,
    gridHeading: pick(sections.gridHeading, page.gridHeading) || defaults.gridHeading,
    gridBody: pick(sections.gridBody, page.gridBody) || defaults.gridBody,
    learnMoreLabel:
      pick(sections.learnMoreLabel, page.learnMoreLabel) || defaults.learnMoreLabel,
    stats,
    ctaHeading: pick(sections.ctaHeading, page.ctaHeading) || defaults.ctaHeading,
    ctaBody: pick(sections.ctaBody, page.ctaBody) || defaults.ctaBody,
    ctaLabel: pick(sections.ctaLabel, page.ctaLabel) || defaults.ctaLabel,
    ctaHref: pick(sections.ctaHref, page.ctaHref) || defaults.ctaHref,
    notFoundHeading:
      pick(sections.notFoundHeading, page.notFoundHeading) || defaults.notFoundHeading,
    notFoundLinkLabel:
      pick(sections.notFoundLinkLabel, page.notFoundLinkLabel) || defaults.notFoundLinkLabel,
  };
}

export type ListingIndustryCard = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  highlights: string[];
  cardImage?: string;
};

export type IndustriesListingBundle = {
  industries: ListingIndustryCard[];
  chrome: IndustriesListingDefaults;
  navChrome: NavChrome;
};

export async function loadIndustriesListingBundle(): Promise<IndustriesListingBundle> {
  const [industries, staticPage, navigation] = await Promise.all([
    getCmsIndustries(industriesData).catch(() => []),
    getCmsStaticPage("industries").catch(() => null),
    getCmsNavigation().catch(() => null),
  ]);

  const listSource =
    industries.length > 0
      ? industries
      : Object.entries(industriesData).map(([slug, data]) => ({ slug, ...data }));

  const industriesCards: ListingIndustryCard[] = listSource
    .map((industry) => {
      const slug = String(industry.slug || "");
      const fallback = industriesData[slug];
      const fromHighlights = Array.isArray(industry.highlights)
        ? industry.highlights.map(String).filter(Boolean)
        : [];
      const fromServices = Array.isArray(industry.services)
        ? industry.services
            .map((s) => String((s as { title?: string })?.title || ""))
            .filter(Boolean)
        : [];
      const highlights =
        fromHighlights.length > 0
          ? fromHighlights
          : fromServices.length > 0
            ? fromServices
            : fallback?.highlights || [];

      return {
        slug,
        title: String(industry.title || fallback?.title || ""),
        description: String(industry.description || fallback?.description || ""),
        icon: String(industry.icon || fallback?.icon || "healthcare"),
        highlights,
        cardImage: industry.cardImage || fallback?.cardImage,
      };
    })
    .filter((i) => i.slug);

  return {
    industries: industriesCards,
    chrome: mergeIndustriesListingChrome(
      industriesListingDefaults,
      (staticPage as Record<string, unknown> | null) || null
    ),
    navChrome: mergeCopy(
      DEFAULT_NAV_CHROME,
      (navigation?.chrome as Partial<NavChrome> | undefined) || undefined
    ),
  };
}
