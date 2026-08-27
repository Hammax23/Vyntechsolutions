import type { Metadata } from "next";
import {
  getCmsGlobalSeo,
  getCmsPageSeo,
  getCmsBlogPost,
  getCmsService,
  getCmsIndustry,
  getCmsStaticPage,
  getCmsLegalPage,
  getCmsHomepage,
} from "@/lib/cms/content";
import { servicesData } from "@/data/servicesData";
import { industriesData } from "@/data/industriesData";
import { defaultSEO } from "@/lib/seo.config";
import { getStrapiMedia } from "@/lib/strapi";

const FALLBACK_SITE_URL = "https://vyntechsolutions.ca";
const FALLBACK_SITE_NAME = "VynTech Solutions";
const FALLBACK_OG = `${FALLBACK_SITE_URL}/og-image.png`;

export type SeoBits = {
  metaTitle?: string;
  metaDescription?: string;
  canonical?: string;
  indexable?: boolean;
  focusKeyword?: string;
  keywords?: string[];
  metaRobots?: string;
  /**
   * CMS shared.seo.metaViewport. Next.js 14 expects viewport via a separate
   * `export const viewport` / `generateViewport` (not Metadata.viewport).
   * We surface the value here and optionally mirror it under `other` so it is
   * available to callers; the framework default viewport tag remains authoritative.
   */
  metaViewport?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  structuredData?: unknown;
};

function mediaUrl(raw: unknown): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string") return getStrapiMedia(raw);
  if (typeof raw === "object") {
    const m = raw as { url?: string; data?: { attributes?: { url?: string }; url?: string } };
    const url = m.url || m.data?.url || m.data?.attributes?.url;
    return getStrapiMedia(url || null);
  }
  return undefined;
}

function splitKeywords(raw: unknown): string[] | undefined {
  if (Array.isArray(raw)) {
    const list = raw.map(String).map((s) => s.trim()).filter(Boolean);
    return list.length ? list : undefined;
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(/[,|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
}

/** Normalize shared.seo (+ nested openGraph / media) from Strapi. */
export function asSeo(raw: unknown): SeoBits {
  if (!raw || typeof raw !== "object") return {};
  const s = raw as Record<string, unknown>;
  const og =
    s.openGraph && typeof s.openGraph === "object"
      ? (s.openGraph as Record<string, unknown>)
      : {};

  const canonical =
    (typeof s.canonicalURL === "string" && s.canonicalURL.trim()) ||
    (typeof s.canonical === "string" && s.canonical.trim()) ||
    (typeof og.ogUrl === "string" && og.ogUrl.trim()) ||
    undefined;

  const keywords = splitKeywords(s.keywords);
  const focusKeyword =
    (typeof s.focusKeyword === "string" && s.focusKeyword.trim()) ||
    keywords?.[0] ||
    undefined;

  const imageUrl =
    mediaUrl(og.ogImage) ||
    mediaUrl(s.ogImage) ||
    mediaUrl(s.metaImage) ||
    undefined;

  return {
    metaTitle: typeof s.metaTitle === "string" ? s.metaTitle : undefined,
    metaDescription: typeof s.metaDescription === "string" ? s.metaDescription : undefined,
    canonical,
    indexable: typeof s.indexable === "boolean" ? s.indexable : undefined,
    focusKeyword,
    keywords,
    metaRobots: typeof s.metaRobots === "string" ? s.metaRobots : undefined,
    // See SeoBits.metaViewport — not mapped into Next Metadata.viewport (App Router).
    metaViewport: typeof s.metaViewport === "string" ? s.metaViewport : undefined,
    ogTitle: typeof og.ogTitle === "string" ? og.ogTitle : undefined,
    ogDescription: typeof og.ogDescription === "string" ? og.ogDescription : undefined,
    ogType: typeof og.ogType === "string" ? og.ogType : undefined,
    ogUrl: typeof og.ogUrl === "string" ? og.ogUrl : undefined,
    imageUrl,
    imageAlt:
      (typeof s.metaTitle === "string" && s.metaTitle) ||
      (typeof og.ogTitle === "string" && og.ogTitle) ||
      undefined,
    structuredData: s.structuredData,
  };
}

function resolveSiteUrl(globalSeo?: Record<string, unknown> | null): string {
  const raw = typeof globalSeo?.siteUrl === "string" ? globalSeo.siteUrl.trim() : "";
  return (raw || FALLBACK_SITE_URL).replace(/\/$/, "");
}

function resolveSiteName(globalSeo?: Record<string, unknown> | null): string {
  const raw = typeof globalSeo?.siteName === "string" ? globalSeo.siteName.trim() : "";
  return raw || FALLBACK_SITE_NAME;
}

function resolveCanonical(siteUrl: string, canonicalOrPath?: string, fallbackPath?: string): string | undefined {
  const value = (canonicalOrPath || fallbackPath || "").trim();
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${siteUrl}${value.startsWith("/") ? value : `/${value}`}`;
}

function parseMetaRobots(metaRobots?: string, indexable = true): Metadata["robots"] {
  if (metaRobots?.trim()) {
    const parts = metaRobots.toLowerCase().split(/[,\s]+/).filter(Boolean);
    const index = !parts.includes("noindex");
    const follow = !parts.includes("nofollow");
    return {
      index,
      follow,
      googleBot: {
        index,
        follow,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    };
  }
  return indexable
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      }
    : { index: false, follow: false };
}

function mergeKeywords(...lists: (string[] | undefined)[]): string[] | undefined {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const list of lists) {
    if (!list) continue;
    for (const item of list) {
      const key = item.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
  }
  return out.length ? out : undefined;
}

type BuildArgs = {
  title?: string;
  description?: string;
  path?: string;
  canonicalOverride?: string;
  indexable?: boolean;
  metaRobots?: string;
  metaViewport?: string;
  keywords?: string[];
  focusKeyword?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  imageUrl?: string;
  imageAlt?: string;
  siteUrl: string;
  siteName: string;
  locale?: string;
  twitterTitle?: string;
};

function buildMetadata(args: BuildArgs): Metadata {
  const {
    title,
    description,
    path,
    canonicalOverride,
    indexable = true,
    metaRobots,
    metaViewport,
    keywords,
    focusKeyword,
    ogTitle,
    ogDescription,
    ogType,
    imageUrl,
    imageAlt,
    siteUrl,
    siteName,
    locale = "en_CA",
    twitterTitle,
  } = args;

  const canonical = resolveCanonical(siteUrl, canonicalOverride, path);
  const finalKeywords = mergeKeywords(focusKeyword ? [focusKeyword] : undefined, keywords);
  const ogImage = imageUrl || FALLBACK_OG;
  const images = [
    {
      url: ogImage,
      width: 1200,
      height: 630,
      alt: imageAlt || title || siteName,
    },
  ];

  return {
    title: title || undefined,
    description: description || undefined,
    keywords: finalKeywords,
    alternates: canonical ? { canonical } : undefined,
    robots: parseMetaRobots(metaRobots, indexable),
    // metaViewport is not applied as Metadata.viewport (unsupported / separate API in Next 14).
    // Expose under `other` for debugging / future generateViewport wiring.
    other: metaViewport?.trim()
      ? { "cms-meta-viewport": metaViewport.trim() }
      : undefined,
    openGraph: {
      title: ogTitle || title || undefined,
      description: ogDescription || description || undefined,
      url: canonical,
      siteName,
      locale,
      type: (ogType as "website" | "article") || "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      // Prefer page OG/title; global twitterTitle is only a last-resort fallback.
      title: ogTitle || title || twitterTitle || undefined,
      description: ogDescription || description || undefined,
      images: [ogImage],
    },
  };
}

async function withGlobalDefaults(
  pageSeo: SeoBits,
  opts: {
    title?: string;
    description?: string;
    path: string;
    extraKeywords?: string[];
  }
): Promise<Metadata> {
  const globalSeo = await getCmsGlobalSeo();
  const siteUrl = resolveSiteUrl(globalSeo);
  const siteName = resolveSiteName(globalSeo);
  const locale =
    (typeof globalSeo?.locale === "string" && globalSeo.locale) || "en_CA";
  const globalKeywords = splitKeywords(globalSeo?.keywords);
  const defaultOg = mediaUrl(globalSeo?.defaultOgImage) || FALLBACK_OG;

  const title =
    pageSeo.metaTitle ||
    opts.title ||
    (typeof globalSeo?.defaultTitle === "string" ? globalSeo.defaultTitle : undefined);

  const description =
    pageSeo.metaDescription ||
    opts.description ||
    (typeof globalSeo?.defaultDescription === "string"
      ? globalSeo.defaultDescription
      : undefined);

  // Page-level social first; global OG/Twitter only fill gaps (never override page copy).
  const ogTitle = pageSeo.ogTitle || title;
  const ogDescription =
    pageSeo.ogDescription ||
    description ||
    (typeof globalSeo?.ogDescription === "string" ? globalSeo.ogDescription : undefined);
  const twitterTitleFallback =
    !pageSeo.ogTitle && !title && typeof globalSeo?.twitterTitle === "string"
      ? globalSeo.twitterTitle
      : undefined;

  return buildMetadata({
    title,
    description,
    path: opts.path,
    canonicalOverride: pageSeo.canonical,
    indexable: pageSeo.indexable !== false,
    metaRobots: pageSeo.metaRobots,
    metaViewport: pageSeo.metaViewport,
    keywords: mergeKeywords(pageSeo.keywords, opts.extraKeywords, globalKeywords),
    focusKeyword: pageSeo.focusKeyword,
    ogTitle,
    ogDescription,
    ogType: pageSeo.ogType,
    imageUrl: pageSeo.imageUrl || defaultOg,
    imageAlt: pageSeo.imageAlt || title || siteName,
    siteUrl,
    siteName,
    locale,
    twitterTitle: twitterTitleFallback,
  });
}

/** Hub / static routes driven by Page SEO collection. */
export async function metadataFromPath(
  path: string,
  fallback?: { title?: string; description?: string }
): Promise<Metadata> {
  const pageSeoEntry = await getCmsPageSeo(path);
  const seo = asSeo(pageSeoEntry?.seo);
  const h1 = typeof pageSeoEntry?.h1 === "string" ? pageSeoEntry.h1 : undefined;

  return withGlobalDefaults(seo, {
    title: seo.metaTitle || h1 || fallback?.title,
    description: seo.metaDescription || fallback?.description,
    path,
  });
}

export async function metadataForBlog(slug: string): Promise<Metadata> {
  const post = await getCmsBlogPost(slug);
  if (!post) return metadataFromPath(`/blog/${slug}`);
  const seo = asSeo((post as { seo?: unknown }).seo);
  return withGlobalDefaults(seo, {
    title: seo.metaTitle || post.title,
    description: seo.metaDescription || post.metaDescription || post.excerpt,
    path: `/blog/${slug}`,
    extraKeywords: Array.isArray(post.tags) ? post.tags.map(String) : undefined,
  });
}

export async function metadataForService(slug: string): Promise<Metadata> {
  const service = await getCmsService(slug, servicesData);
  if (!service) return metadataFromPath(`/services/${slug}`);
  const seo = asSeo(service.seo);
  return withGlobalDefaults(seo, {
    title: seo.metaTitle || `${service.title} | VynTech Solutions`,
    description: seo.metaDescription || service.description,
    path: `/services/${slug}`,
  });
}

export async function metadataForIndustry(slug: string): Promise<Metadata> {
  const industry = await getCmsIndustry(slug, industriesData);
  if (!industry) return metadataFromPath(`/industries/${slug}`);
  const seo = asSeo(industry.seo);
  return withGlobalDefaults(seo, {
    title: seo.metaTitle || `${industry.title} | VynTech Solutions`,
    description: seo.metaDescription || industry.description,
    path: `/industries/${slug}`,
  });
}

/** Prefer Page SEO path, then static-page.seo, then fallbacks. */
export async function metadataForStatic(slug: string, path: string): Promise<Metadata> {
  const [pageSeoEntry, page] = await Promise.all([getCmsPageSeo(path), getCmsStaticPage(slug)]);
  const fromPath = asSeo(pageSeoEntry?.seo);
  const fromEntity = asSeo(page?.seo);
  const seo: SeoBits = {
    ...fromEntity,
    ...Object.fromEntries(Object.entries(fromPath).filter(([, v]) => v !== undefined)),
  };
  const h1 = typeof pageSeoEntry?.h1 === "string" ? pageSeoEntry.h1 : undefined;

  return withGlobalDefaults(seo, {
    title:
      seo.metaTitle ||
      h1 ||
      (typeof page?.title === "string" ? String(page.title) : undefined),
    description:
      seo.metaDescription ||
      (typeof page?.heroBody === "string" ? String(page.heroBody) : undefined),
    path,
  });
}

/** Prefer Page SEO path, then legal-page.seo, then fallbacks. */
export async function metadataForLegal(slug: string, path: string): Promise<Metadata> {
  const [pageSeoEntry, page] = await Promise.all([getCmsPageSeo(path), getCmsLegalPage(slug)]);
  const fromPath = asSeo(pageSeoEntry?.seo);
  const fromEntity = asSeo(page?.seo);
  const seo: SeoBits = {
    ...fromEntity,
    ...Object.fromEntries(Object.entries(fromPath).filter(([, v]) => v !== undefined)),
  };
  const h1 = typeof pageSeoEntry?.h1 === "string" ? pageSeoEntry.h1 : undefined;

  return withGlobalDefaults(seo, {
    title:
      seo.metaTitle ||
      h1 ||
      (typeof page?.title === "string" ? String(page.title) : undefined),
    description:
      seo.metaDescription || `${page?.title || "Legal"} | VynTech Solutions`,
    path,
  });
}

/** Homepage: Page SEO `/` + homepage.seo + Global SEO defaults. */
export async function metadataForHome(): Promise<Metadata> {
  const [pageSeoEntry, homepage, globalSeo] = await Promise.all([
    getCmsPageSeo("/"),
    getCmsHomepage(),
    getCmsGlobalSeo(),
  ]);
  const fromPath = asSeo(pageSeoEntry?.seo);
  const fromHome = asSeo(homepage?.seo);
  const seo: SeoBits = {
    ...fromHome,
    ...Object.fromEntries(Object.entries(fromPath).filter(([, v]) => v !== undefined)),
  };
  const h1 = typeof pageSeoEntry?.h1 === "string" ? pageSeoEntry.h1 : undefined;

  const siteUrl = resolveSiteUrl(globalSeo);
  const siteName = resolveSiteName(globalSeo);
  const locale =
    (typeof globalSeo?.locale === "string" && globalSeo.locale) || "en_CA";
  const globalKeywords = splitKeywords(globalSeo?.keywords);
  const defaultOg = mediaUrl(globalSeo?.defaultOgImage) || FALLBACK_OG;
  const template =
    typeof globalSeo?.titleTemplate === "string"
      ? globalSeo.titleTemplate
      : "%s | VynTech Solutions";

  const title =
    seo.metaTitle ||
    h1 ||
    (typeof globalSeo?.defaultTitle === "string" ? globalSeo.defaultTitle : undefined);
  const description =
    seo.metaDescription ||
    (typeof globalSeo?.defaultDescription === "string"
      ? globalSeo.defaultDescription
      : undefined);

  const pageMeta = buildMetadata({
    title,
    description,
    path: "/",
    canonicalOverride: seo.canonical,
    indexable: seo.indexable !== false,
    metaRobots: seo.metaRobots,
    keywords: mergeKeywords(seo.keywords, globalKeywords),
    focusKeyword: seo.focusKeyword,
    ogTitle: seo.ogTitle || title,
    ogDescription:
      seo.ogDescription ||
      description ||
      (typeof globalSeo?.ogDescription === "string" ? globalSeo.ogDescription : undefined),
    ogType: seo.ogType,
    imageUrl: seo.imageUrl || defaultOg,
    imageAlt: seo.imageAlt || title || siteName,
    siteUrl,
    siteName,
    locale,
    twitterTitle:
      !seo.ogTitle && !title && typeof globalSeo?.twitterTitle === "string"
        ? globalSeo.twitterTitle
        : undefined,
  });

  return {
    ...defaultSEO,
    ...pageMeta,
    metadataBase: new URL(siteUrl),
    title: title
      ? { default: title, template }
      : defaultSEO.title,
    description: description || defaultSEO.description,
    keywords: pageMeta.keywords || defaultSEO.keywords,
  };
}

export async function rootMetadataFromCms(): Promise<Metadata> {
  // Home owns `/` metadata via metadataForHome when page.tsx exports generateMetadata.
  // Root layout still sets site-wide defaults for child routes.
  const globalSeo = await getCmsGlobalSeo();
  if (!globalSeo) return defaultSEO;

  const siteUrl = resolveSiteUrl(globalSeo);
  const siteName = resolveSiteName(globalSeo);
  const locale =
    (typeof globalSeo?.locale === "string" && globalSeo.locale) || "en_CA";
  const title =
    typeof globalSeo.defaultTitle === "string" ? globalSeo.defaultTitle : undefined;
  const description =
    typeof globalSeo.defaultDescription === "string"
      ? globalSeo.defaultDescription
      : undefined;
  const template =
    typeof globalSeo.titleTemplate === "string"
      ? globalSeo.titleTemplate
      : "%s | VynTech Solutions";
  const keywords = splitKeywords(globalSeo.keywords);
  const defaultOg = mediaUrl(globalSeo.defaultOgImage) || FALLBACK_OG;
  const ogDescription =
    typeof globalSeo.ogDescription === "string"
      ? globalSeo.ogDescription
      : description;
  const twitterTitle =
    typeof globalSeo.twitterTitle === "string" ? globalSeo.twitterTitle : title;

  const googleVerify =
    typeof globalSeo.googleSiteVerification === "string"
      ? globalSeo.googleSiteVerification
      : undefined;
  const bingVerify =
    typeof globalSeo.bingSiteVerification === "string"
      ? globalSeo.bingSiteVerification
      : undefined;

  return {
    ...defaultSEO,
    metadataBase: new URL(siteUrl),
    title: title ? { default: title, template } : defaultSEO.title,
    description: description || defaultSEO.description,
    keywords: keywords || defaultSEO.keywords,
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    publisher: siteName,
    alternates: {
      canonical: siteUrl,
      languages: {
        "en-CA": siteUrl,
      },
    },
    openGraph: {
      ...(defaultSEO.openGraph || {}),
      type: "website",
      locale,
      url: siteUrl,
      siteName,
      title: title || undefined,
      description: ogDescription || undefined,
      images: [
        {
          url: defaultOg,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      ...(defaultSEO.twitter || {}),
      card: "summary_large_image",
      title: twitterTitle || undefined,
      description: ogDescription || undefined,
      images: [defaultOg],
    },
    verification: {
      ...(defaultSEO.verification || {}),
      ...(googleVerify ? { google: googleVerify } : {}),
      ...(bingVerify ? { other: { "msvalidate.01": bingVerify } } : {}),
    },
  };
}

/** Expose CMS structuredData JSON for layout/page injection. */
export async function getStructuredDataForPath(path: string): Promise<unknown | null> {
  const pageSeo = await getCmsPageSeo(path);
  const seo = asSeo(pageSeo?.seo);
  return seo.structuredData ?? null;
}

export async function getStructuredDataForService(slug: string): Promise<unknown | null> {
  const service = await getCmsService(slug, servicesData);
  return asSeo(service?.seo).structuredData ?? null;
}

export async function getStructuredDataForIndustry(slug: string): Promise<unknown | null> {
  const industry = await getCmsIndustry(slug, industriesData);
  return asSeo(industry?.seo).structuredData ?? null;
}

export async function getStructuredDataForBlog(slug: string): Promise<unknown | null> {
  const post = await getCmsBlogPost(slug);
  return asSeo((post as { seo?: unknown } | null)?.seo).structuredData ?? null;
}
