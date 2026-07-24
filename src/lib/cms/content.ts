import { blogPosts, getPostBySlug as getLocalPost, type BlogPost } from "@/data/blogData";
import { strapiFetch, unwrapList, unwrapSingle, type StrapiListResponse, type StrapiSingleResponse } from "@/lib/strapi";

export type CmsBlogPost = BlogPost & { featured?: boolean };

function mapBlog(entry: Record<string, unknown>): CmsBlogPost {
  const categoryRel = entry.category as { name?: string } | string | null | undefined;
  const categoryName =
    typeof categoryRel === "string"
      ? categoryRel
      : categoryRel?.name || "Business";

  return {
    slug: String(entry.slug || ""),
    title: String(entry.title || ""),
    metaDescription: String(
      entry.metaDescription ||
      (entry.seo as { metaDescription?: string } | undefined)?.metaDescription ||
      ""
    ),
    excerpt: String(entry.excerpt || ""),
    category: categoryName,
    tags: Array.isArray(entry.tags) ? (entry.tags as string[]) : [],
    author: String(entry.author || "VynTech Solutions Team"),
    readTime: String(entry.readTime || "5 min"),
    image: String(entry.image || ""),
    content: String(entry.content || ""),
    featured: Boolean(entry.featured),
  };
}

export async function getCmsBlogPosts(): Promise<CmsBlogPost[]> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/blog-posts",
    query: {
      "populate[0]": "category",
      "populate[1]": "seo",
      "sort": "publishedAt:desc",
      "pagination[pageSize]": 100,
    },
    tags: ["strapi", "blog"],
  });

  const list = unwrapList(res).map(mapBlog).filter((p) => p.slug);
  return list.length ? list : blogPosts;
}

export async function getCmsBlogPost(slug: string): Promise<CmsBlogPost | null> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/blog-posts",
    query: {
      "filters[slug][$eq]": slug,
      "populate[0]": "category",
      "populate[1]": "seo",
      "pagination[pageSize]": 1,
    },
    tags: ["strapi", "blog", `blog-${slug}`],
  });

  const entry = unwrapList(res)[0];
  if (entry) return mapBlog(entry);
  return getLocalPost(slug) || null;
}

export async function getCmsRelatedPosts(slug: string, limit = 3): Promise<CmsBlogPost[]> {
  const all = await getCmsBlogPosts();
  const current = all.find((p) => p.slug === slug);
  if (!current) return all.slice(0, limit);
  return all
    .filter((p) => p.slug !== slug && p.category === current.category)
    .slice(0, limit)
    .concat(all.filter((p) => p.slug !== slug).slice(0, limit))
    .filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i)
    .slice(0, limit);
}

export type CmsService = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  overview: string;
  overviewTagline?: string;
  features: { title: string; description: string; icon: string }[];
  technologies: string[];
  process: { step: string; description: string }[];
  stats: { value: string; label: string }[];
  caseStudies: { title: string; industry: string; result: string }[];
  seo?: Record<string, unknown>;
  // Why Choose Us
  whyChooseUsHeading?: string;
  whyChooseUsIntro?: string;
  whyChooseUsSubHeading?: string;
  whyChooseUsSubText?: string;
  whyChooseUsCards?: { icon: string; label: string }[];
  // How We Deliver
  deliveryHeading?: string;
  deliveryDescription?: string;
  deliverySteps?: { title: string; content: string }[];
  processHeading?: string;
  processDescription?: string;
  faqs?: { question: string; answer: string }[];
};

function mapService(entry: Record<string, unknown>, fallbackSlug?: string): CmsService {
  return {
    slug: String(entry.slug || fallbackSlug || ""),
    title: String(entry.title || ""),
    subtitle: String(entry.subtitle || ""),
    description: String(entry.description || ""),
    heroImage: String(entry.heroImage || ""),
    overview: String(entry.overview || ""),
    overviewTagline: entry.overviewTagline ? String(entry.overviewTagline) : undefined,
    features: Array.isArray(entry.features) ? (entry.features as CmsService["features"]) : [],
    technologies: Array.isArray(entry.technologies) ? (entry.technologies as string[]) : [],
    processHeading: entry.processHeading ? String(entry.processHeading) : undefined,
    processDescription: entry.processDescription ? String(entry.processDescription) : undefined,
    process: Array.isArray(entry.process) ? (entry.process as CmsService["process"]) : [],
    stats: Array.isArray(entry.stats) ? (entry.stats as CmsService["stats"]) : [],
    caseStudies: Array.isArray(entry.caseStudies) ? (entry.caseStudies as CmsService["caseStudies"]) : [],
    seo: (entry.seo as Record<string, unknown>) || undefined,
    // Why Choose Us
    whyChooseUsHeading: entry.whyChooseUsHeading ? String(entry.whyChooseUsHeading) : undefined,
    whyChooseUsIntro: entry.whyChooseUsIntro ? String(entry.whyChooseUsIntro) : undefined,
    whyChooseUsSubHeading: entry.whyChooseUsSubHeading ? String(entry.whyChooseUsSubHeading) : undefined,
    whyChooseUsSubText: entry.whyChooseUsSubText ? String(entry.whyChooseUsSubText) : undefined,
    whyChooseUsCards: Array.isArray(entry.whyChooseUsCards)
      ? (entry.whyChooseUsCards as { icon: string; label: string }[])
      : undefined,
    // How We Deliver
    deliveryHeading: entry.deliveryHeading ? String(entry.deliveryHeading) : undefined,
    deliveryDescription: entry.deliveryDescription ? String(entry.deliveryDescription) : undefined,
    deliverySteps: Array.isArray(entry.deliverySteps)
      ? (entry.deliverySteps as { title: string; content: string }[])
      : undefined,
    // FAQs
    faqs: Array.isArray(entry.faqs)
      ? (entry.faqs as { question: string; answer: string }[])
      : undefined,
  };
}

export async function getCmsServices(fallback: Record<string, Omit<CmsService, "slug">>): Promise<CmsService[]> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/services",
    query: {
      "populate[0]": "features",
      "populate[1]": "process",
      "populate[2]": "stats",
      "populate[3]": "caseStudies",
      "populate[4]": "seo",
      "sort": "order:asc",
      "pagination[pageSize]": 100,
    },
    tags: ["strapi", "services"],
  });

  const list = unwrapList(res).map((e) => mapService(e));
  if (list.length) return list;

  return Object.entries(fallback).map(([slug, data]) => ({ slug, ...data }));
}

export async function getCmsService(
  slug: string,
  fallback: Record<string, Omit<CmsService, "slug">>
): Promise<CmsService | null> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/services",
    query: {
      "filters[slug][$eq]": slug,
      "populate[0]": "features",
      "populate[1]": "process",
      "populate[2]": "stats",
      "populate[3]": "caseStudies",
      "populate[4]": "seo",
      "populate[5]": "whyChooseUsCards",
      "populate[6]": "deliverySteps",
      "populate[7]": "faqs",
      "pagination[pageSize]": 1,
    },
    tags: ["strapi", "services", `service-${slug}`],
  });

  const entry = unwrapList(res)[0];
  if (entry) return mapService(entry, slug);
  const local = fallback[slug];
  return local ? { slug, ...local } : null;
}

export type CmsIndustry = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  heroImage?: string;
  heroStats: { value: string; label: string }[];
  challenges: { title: string; description: string }[];
  services: { title: string; description: string }[];
  technologies: string[];
  highlights?: string[];
  seo?: Record<string, unknown>;
};

function mapIndustry(entry: Record<string, unknown>, fallbackSlug?: string): CmsIndustry {
  return {
    slug: String(entry.slug || fallbackSlug || ""),
    title: String(entry.title || ""),
    subtitle: String(entry.subtitle || ""),
    description: String(entry.description || ""),
    heroImage: typeof entry.hero === "object" && entry.hero !== null ? String((entry.hero as any).url || "") : String(entry.hero || ""),
    heroStats: Array.isArray(entry.heroStats) ? (entry.heroStats as CmsIndustry["heroStats"]) : [],
    challenges: Array.isArray(entry.challenges)
      ? (entry.challenges as CmsIndustry["challenges"])
      : [],
    services: Array.isArray(entry.services) ? (entry.services as CmsIndustry["services"]) : [],
    technologies: Array.isArray(entry.technologies) ? (entry.technologies as string[]) : [],
    highlights: Array.isArray(entry.highlights) ? (entry.highlights as string[]) : undefined,
    seo: (entry.seo as Record<string, unknown>) || undefined,
  };
}

export async function getCmsIndustries(
  fallback: Record<string, Omit<CmsIndustry, "slug">>
): Promise<CmsIndustry[]> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/industries",
    query: {
      "populate[0]": "heroStats",
      "populate[1]": "challenges",
      "populate[2]": "services",
      "populate[3]": "seo",
      "populate[4]": "hero",
      "sort": "order:asc",
      "pagination[pageSize]": 100,
    },
    tags: ["strapi", "industries"],
  });

  const list = unwrapList(res).map((e) => mapIndustry(e));
  if (list.length) return list;
  return Object.entries(fallback).map(([slug, data]) => ({ slug, ...data }));
}

export async function getCmsIndustry(
  slug: string,
  fallback: Record<string, Omit<CmsIndustry, "slug">>
): Promise<CmsIndustry | null> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/industries",
    query: {
      "filters[slug][$eq]": slug,
      "populate[0]": "heroStats",
      "populate[1]": "challenges",
      "populate[2]": "services",
      "populate[3]": "seo",
      "populate[4]": "hero",
      "pagination[pageSize]": 1,
    },
    tags: ["strapi", "industries", `industry-${slug}`],
  });

  const entry = unwrapList(res)[0];
  if (entry) return mapIndustry(entry, slug);
  const local = fallback[slug];
  return local ? { slug, ...local } : null;
}

export type CmsFaq = { question: string; answer: string; order: number; page?: string };

export async function getCmsFaqs(): Promise<CmsFaq[]> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/faqs",
    query: {
      sort: "order:asc",
      "pagination[pageSize]": 50,
    },
    tags: ["strapi", "faqs"],
  });

  return unwrapList(res).map((e) => ({
    question: String(e.question || ""),
    answer: String(e.answer || ""),
    order: Number(e.order || 0),
    page: String(e.page || "global"),
  }));
}

export async function getCmsGlobalSeo(): Promise<Record<string, unknown> | null> {
  const res = await strapiFetch<StrapiSingleResponse<Record<string, unknown>>>({
    path: "/api/global-seo",
    query: { "populate[0]": "defaultOgImage" },
    tags: ["strapi", "global-seo"],
  });
  return unwrapSingle(res);
}

export async function getCmsPageSeo(path: string): Promise<Record<string, unknown> | null> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/page-seos",
    query: {
      "filters[path][$eq]": path,
      "populate[0]": "seo",
      "pagination[pageSize]": 1,
    },
    tags: ["strapi", "page-seo", `page-seo-${path}`],
  });
  return unwrapList(res)[0] || null;
}

export async function getCmsHomepage(): Promise<Record<string, unknown> | null> {
  const res = await strapiFetch<StrapiSingleResponse<Record<string, unknown>>>({
    path: "/api/homepage",
    query: {
      "populate[0]": "heroSlides",
      "populate[1]": "impactStats",
      "populate[2]": "seo",
    },
    tags: ["strapi", "homepage"],
  });
  return unwrapSingle(res);
}

export async function getCmsNavigation(): Promise<Record<string, unknown> | null> {
  const res = await strapiFetch<StrapiSingleResponse<Record<string, unknown>>>({
    path: "/api/navigation",
    query: {
      "populate[primaryLinks]": "*",
      "populate[footerGroups][populate]": "links",
      "populate[socialLinks]": "*",
      "populate[legalLinks]": "*",
    },
    tags: ["strapi", "navigation"],
  });
  return unwrapSingle(res);
}

export async function getCmsStaticPage(slug: string): Promise<Record<string, unknown> | null> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/static-pages",
    query: {
      "filters[slug][$eq]": slug,
      "populate[0]": "seo",
      "populate[1]": "heroimage",
      "pagination[pageSize]": 1,
    },
    tags: ["strapi", "static-page", slug],
  });
  return unwrapList(res)[0] || null;
}

export async function getCmsLegalPage(slug: string): Promise<Record<string, unknown> | null> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/legal-pages",
    query: {
      "filters[slug][$eq]": slug,
      "populate[0]": "seo",
      "pagination[pageSize]": 1,
    },
    tags: ["strapi", "legal-page", slug],
  });
  return unwrapList(res)[0] || null;
}

export async function getCmsPromos(slot?: string): Promise<Record<string, unknown>[]> {
  const query: Record<string, string | number> = {
    "filters[active][$eq]": "true",
    sort: "priority:desc",
    "pagination[pageSize]": 20,
  };
  if (slot) query["filters[slot][$eq]"] = slot;

  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/promos",
    query,
    tags: ["strapi", "promos"],
  });
  return unwrapList(res);
}

export async function getCmsFormConfig(): Promise<Record<string, unknown> | null> {
  const res = await strapiFetch<StrapiSingleResponse<Record<string, unknown>>>({
    path: "/api/form-config",
    tags: ["strapi", "form-config"],
  });
  return unwrapSingle(res);
}

export async function getCmsJobOpenings(): Promise<Record<string, unknown>[]> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/job-openings",
    query: {
      "filters[isActive][$eq]": "true",
      sort: "createdAt:desc",
      "pagination[pageSize]": 50,
    },
    tags: ["strapi", "jobs"],
  });
  return unwrapList(res);
}

export async function getCmsClientLogos(): Promise<Record<string, unknown>[]> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/client-logos",
    query: {
      sort: "order:asc",
      "pagination[pageSize]": 50,
      "populate[0]": "logo",
    },
    tags: ["strapi", "client-logos"],
  });
  return unwrapList(res);
}

export async function getCmsOrganizationProfile(): Promise<Record<string, unknown> | null> {
  const res = await strapiFetch<StrapiSingleResponse<Record<string, unknown>>>({
    path: "/api/organization-profile",
    tags: ["strapi", "org-profile"],
  });
  return unwrapSingle(res);
}
