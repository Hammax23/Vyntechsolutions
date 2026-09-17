import {
  getCmsHomepage,
  getCmsNavigation,
  getCmsPageSeo,
  getCmsStaticPage,
} from "@/lib/cms/content";
import {
  aboutPageDefaults,
  type AboutPageChrome,
} from "@/data/aboutPageDefaults";
import { DEFAULT_NAV_CHROME, mergeCopy } from "@/lib/ui-copy";
import { getStrapiMedia } from "@/lib/strapi";

type NavChrome = typeof DEFAULT_NAV_CHROME;

function pick(...vals: unknown[]) {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v;
  }
  return undefined;
}

function resolveHeroImage(page: Record<string, unknown> | null): string | null {
  if (!page) return null;
  const heroImg =
    (page.heroimage as Record<string, unknown> | null) ||
    (page.heroImage as Record<string, unknown> | null) ||
    null;
  let url = "";
  if (heroImg && typeof heroImg === "object") {
    if (typeof heroImg.url === "string") url = heroImg.url;
    else {
      const data = heroImg.data as Record<string, unknown> | undefined;
      const attrs = data?.attributes as { url?: string } | undefined;
      url = String(attrs?.url || data?.url || "");
    }
  }
  if (!url) return null;
  return getStrapiMedia(url) || url;
}

export function mergeAboutChrome(
  defaults: AboutPageChrome,
  page: Record<string, unknown> | null | undefined,
  pageSeo?: Record<string, unknown> | null
): AboutPageChrome {
  if (!page && !pageSeo) return defaults;
  const sections =
    page?.sections && typeof page.sections === "object" && !Array.isArray(page.sections)
      ? (page.sections as Record<string, unknown>)
      : {};

  const seoH1 =
    typeof pageSeo?.h1 === "string" && pageSeo.h1.trim() ? String(pageSeo.h1) : undefined;

  const missionStats = Array.isArray(sections.missionStats)
    ? (sections.missionStats as AboutPageChrome["missionStats"])
    : defaults.missionStats;
  const values = Array.isArray(sections.values)
    ? (sections.values as AboutPageChrome["values"])
    : defaults.values;
  const process = Array.isArray(sections.process)
    ? (sections.process as AboutPageChrome["process"])
    : defaults.process;

  const bodyRaw = page?.body != null ? String(page.body).trim() : "";

  return {
    heroHeading:
      pick(page?.heroHeading, sections.heroHeading, seoH1) || defaults.heroHeading,
    heroBody: pick(page?.heroBody, sections.heroBody) || defaults.heroBody,
    bodyHtml: bodyRaw || defaults.bodyHtml,
    heroImageUrl: resolveHeroImage(page || null) || defaults.heroImageUrl,
    breadcrumbLabel:
      pick(sections.breadcrumbLabel, page?.title) || defaults.breadcrumbLabel,
    missionEyebrow:
      pick(sections.missionEyebrow) || defaults.missionEyebrow,
    missionHeading:
      pick(sections.missionHeading) || defaults.missionHeading,
    missionBody: pick(sections.missionBody) || defaults.missionBody,
    missionBody2: pick(sections.missionBody2) || defaults.missionBody2,
    heroCtaLabel: pick(sections.heroCtaLabel) || defaults.heroCtaLabel,
    missionCtaLabel:
      pick(sections.missionCtaLabel) || defaults.missionCtaLabel,
    missionStats: missionStats.length ? missionStats : defaults.missionStats,
    valuesEyebrow: pick(sections.valuesEyebrow) || defaults.valuesEyebrow,
    valuesHeading: pick(sections.valuesHeading) || defaults.valuesHeading,
    values: values.length ? values : defaults.values,
    processEyebrow: pick(sections.processEyebrow) || defaults.processEyebrow,
    processHeading: pick(sections.processHeading) || defaults.processHeading,
    processIntro: pick(sections.processIntro) || defaults.processIntro,
    process: process.length ? process : defaults.process,
    ctaHeading: pick(sections.ctaHeading) || defaults.ctaHeading,
    ctaBody: pick(sections.ctaBody) || defaults.ctaBody,
    ctaButtonLabel: pick(sections.ctaButtonLabel) || defaults.ctaButtonLabel,
    ctaEmail: pick(sections.ctaEmail) || defaults.ctaEmail,
    ctaEmailLabel: pick(sections.ctaEmailLabel) || defaults.ctaEmailLabel,
  };
}

export type AboutPageBundle = {
  chrome: AboutPageChrome;
  navChrome: NavChrome;
  homepage: Record<string, unknown> | null;
};

export async function loadAboutPageBundle(): Promise<AboutPageBundle> {
  const [staticPage, pageSeo, navigation, homepage] = await Promise.all([
    getCmsStaticPage("about").catch(() => null),
    getCmsPageSeo("/about").catch(() => null),
    getCmsNavigation().catch(() => null),
    getCmsHomepage().catch(() => null),
  ]);

  return {
    chrome: mergeAboutChrome(
      aboutPageDefaults,
      (staticPage as Record<string, unknown> | null) || null,
      (pageSeo as Record<string, unknown> | null) || null
    ),
    navChrome: mergeCopy(
      DEFAULT_NAV_CHROME,
      (navigation?.chrome as Partial<NavChrome> | undefined) || undefined
    ),
    homepage,
  };
}
