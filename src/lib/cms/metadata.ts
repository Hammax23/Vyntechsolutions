import type { Metadata } from "next";
import {
  getCmsGlobalSeo,
  getCmsPageSeo,
  getCmsBlogPost,
  getCmsService,
  getCmsIndustry,
  getCmsStaticPage,
  getCmsLegalPage,
} from "@/lib/cms/content";
import { servicesData } from "@/data/servicesData";
import { industriesData } from "@/data/industriesData";
import { defaultSEO } from "@/lib/seo.config";

const SITE_URL = "https://vyntechsolutions.ca";

type SeoBits = {
  metaTitle?: string;
  metaDescription?: string;
  canonical?: string;
  indexable?: boolean;
  focusKeyword?: string;
};

function asSeo(raw: unknown): SeoBits {
  if (!raw || typeof raw !== "object") return {};
  const s = raw as Record<string, unknown>;
  return {
    metaTitle: typeof s.metaTitle === "string" ? s.metaTitle : undefined,
    metaDescription: typeof s.metaDescription === "string" ? s.metaDescription : undefined,
    canonical: typeof s.canonical === "string" ? s.canonical : undefined,
    indexable: typeof s.indexable === "boolean" ? s.indexable : undefined,
    focusKeyword: typeof s.focusKeyword === "string" ? s.focusKeyword : undefined,
  };
}

function buildMetadata({
  title,
  description,
  path,
  indexable = true,
  keywords,
}: {
  title?: string;
  description?: string;
  path?: string;
  indexable?: boolean;
  keywords?: string[];
}): Metadata {
  const canonical = path ? `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}` : undefined;
  return {
    title: title || undefined,
    description: description || undefined,
    keywords: keywords?.length ? keywords : undefined,
    alternates: canonical ? { canonical } : undefined,
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: title || undefined,
      description: description || undefined,
      url: canonical,
      siteName: "VynTech Solutions",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title || undefined,
      description: description || undefined,
    },
  };
}

export async function metadataFromPath(path: string, fallback?: { title?: string; description?: string }): Promise<Metadata> {
  const [globalSeo, pageSeo] = await Promise.all([getCmsGlobalSeo(), getCmsPageSeo(path)]);
  const g = globalSeo || {};
  const page = pageSeo || {};
  const seo = asSeo(page.seo);

  const title =
    seo.metaTitle ||
    (typeof page.h1 === "string" ? page.h1 : undefined) ||
    fallback?.title ||
    (typeof g.defaultTitle === "string" ? g.defaultTitle : undefined);

  const description =
    seo.metaDescription ||
    fallback?.description ||
    (typeof g.defaultDescription === "string" ? g.defaultDescription : undefined);

  const keywords = Array.isArray(g.keywords) ? (g.keywords as string[]) : undefined;

  return buildMetadata({
    title,
    description,
    path: seo.canonical || path,
    indexable: seo.indexable !== false,
    keywords,
  });
}

export async function metadataForBlog(slug: string): Promise<Metadata> {
  const post = await getCmsBlogPost(slug);
  if (!post) return metadataFromPath(`/blog/${slug}`);
  const seo = asSeo((post as { seo?: unknown }).seo);
  return buildMetadata({
    title: seo.metaTitle || post.title,
    description: seo.metaDescription || post.metaDescription || post.excerpt,
    path: seo.canonical || `/blog/${slug}`,
    indexable: seo.indexable !== false,
  });
}

export async function metadataForService(slug: string): Promise<Metadata> {
  const service = await getCmsService(slug, servicesData);
  if (!service) return metadataFromPath(`/services/${slug}`);
  const seo = asSeo(service.seo);
  return buildMetadata({
    title: seo.metaTitle || `${service.title} | VynTech Solutions`,
    description: seo.metaDescription || service.description,
    path: seo.canonical || `/services/${slug}`,
    indexable: seo.indexable !== false,
  });
}

export async function metadataForIndustry(slug: string): Promise<Metadata> {
  const industry = await getCmsIndustry(slug, industriesData);
  if (!industry) return metadataFromPath(`/industries/${slug}`);
  const seo = asSeo(industry.seo);
  return buildMetadata({
    title: seo.metaTitle || `${industry.title} | VynTech Solutions`,
    description: seo.metaDescription || industry.description,
    path: seo.canonical || `/industries/${slug}`,
    indexable: seo.indexable !== false,
  });
}

export async function metadataForStatic(slug: string, path: string): Promise<Metadata> {
  const page = await getCmsStaticPage(slug);
  const seo = asSeo(page?.seo);
  return buildMetadata({
    title: seo.metaTitle || (typeof page?.title === "string" ? String(page.title) : undefined),
    description: seo.metaDescription || (typeof page?.heroBody === "string" ? String(page.heroBody) : undefined),
    path: seo.canonical || path,
    indexable: seo.indexable !== false,
  });
}

export async function metadataForLegal(slug: string, path: string): Promise<Metadata> {
  const page = await getCmsLegalPage(slug);
  const seo = asSeo(page?.seo);
  return buildMetadata({
    title: seo.metaTitle || (typeof page?.title === "string" ? String(page.title) : undefined),
    description: seo.metaDescription || `${page?.title || "Legal"} | VynTech Solutions`,
    path: seo.canonical || path,
    indexable: seo.indexable !== false,
  });
}

export async function rootMetadataFromCms(): Promise<Metadata> {
  const globalSeo = await getCmsGlobalSeo();
  if (!globalSeo) return defaultSEO;

  const title = typeof globalSeo.defaultTitle === "string" ? globalSeo.defaultTitle : undefined;
  const description =
    typeof globalSeo.defaultDescription === "string" ? globalSeo.defaultDescription : undefined;
  const template =
    typeof globalSeo.titleTemplate === "string" ? globalSeo.titleTemplate : "%s | VynTech Solutions";
  const keywords = Array.isArray(globalSeo.keywords) ? (globalSeo.keywords as string[]) : undefined;

  return {
    ...defaultSEO,
    title: title
      ? { default: title, template }
      : defaultSEO.title,
    description: description || defaultSEO.description,
    keywords: keywords || defaultSEO.keywords,
  };
}
