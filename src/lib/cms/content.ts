import { blogPosts, getPostBySlug as getLocalPost, type BlogPost } from "@/data/blogData";
import { strapiFetch, unwrapList, unwrapSingle, type StrapiListResponse, type StrapiSingleResponse } from "@/lib/strapi";

/**
 * Deep-populate shared.seo (media + openGraph).
 * Use named keys only — mixing populate[0]=… with populate[seo]=… returns HTTP 400 in Strapi 5.
 */
const SEO_POPULATE: Record<string, string> = {
  "populate[seo][populate][metaImage]": "true",
  "populate[seo][populate][ogImage]": "true",
  "populate[seo][populate][openGraph][populate][ogImage]": "true",
};

const SERVICE_POPULATE: Record<string, string> = {
  "populate[features]": "true",
  "populate[process]": "true",
  "populate[stats]": "true",
  "populate[caseStudies]": "true",
  "populate[whyChooseUsCards]": "true",
  "populate[deliverySteps]": "true",
  "populate[faqs]": "true",
  ...SEO_POPULATE,
};

const INDUSTRY_POPULATE: Record<string, string> = {
  "populate[heroStats]": "true",
  "populate[challenges]": "true",
  "populate[services]": "true",
  "populate[hero]": "true",
  "populate[whyChooseUsCards]": "true",
  ...SEO_POPULATE,
};

export type CmsBlogPost = BlogPost & { featured?: boolean; seo?: Record<string, unknown> };

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
    image: String(
      entry.image ||
      (typeof entry.cover === "object" && entry.cover !== null
        ? (entry.cover as { url?: string }).url || ""
        : "")
    ),
    content: String(entry.content || ""),
    featured: Boolean(entry.featured),
    seo: (entry.seo as Record<string, unknown>) || undefined,
  };
}

export async function getCmsBlogPosts(): Promise<CmsBlogPost[]> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/blog-posts",
    query: {
      "populate[category]": "true",
      "populate[cover]": "true",
      ...SEO_POPULATE,
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
      "populate[category]": "true",
      "populate[cover]": "true",
      ...SEO_POPULATE,
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
  icon?: string;
  cardImage?: string;
  heroImage: string;
  heroVariant?: string;
  heroCtaLabel?: string;
  overview: string;
  overviewTagline?: string;
  featuresEyebrow?: string;
  features: { title: string; description: string; icon: string }[];
  technologies: string[];
  process: { step: string; description: string }[];
  stats: { value: string; label: string }[];
  caseStudies: { title: string; industry: string; result: string }[];
  seo?: Record<string, unknown>;
  whyChooseUsHeading?: string;
  whyChooseUsIntro?: string;
  whyChooseUsSubHeading?: string;
  whyChooseUsSubText?: string;
  whyChooseUsCards?: { icon: string; label: string }[];
  deliveryEyebrow?: string;
  deliveryHeading?: string;
  deliveryDescription?: string;
  deliverySteps?: { title: string; content: string }[];
  processHeading?: string;
  processDescription?: string;
  faqs?: { question: string; answer: string }[];
  ctaHeading?: string;
  ctaBody?: string;
  ctaButtonLabel?: string;
  showTechStack?: boolean;
  techStack?: Record<string, unknown>;
  pageSections?: Record<string, unknown>;
  canadaCities?: string[] | Record<string, unknown>;
};

function mapService(entry: Record<string, unknown>, fallbackSlug?: string, localFallback?: CmsService): CmsService {
  const isPopulated = (val: unknown) => val !== null && val !== undefined && val !== "";
  const isArrayPopulated = (val: unknown) => Array.isArray(val) && val.length > 0;
  const isObjectPopulated = (val: unknown) =>
    val !== null && typeof val === "object" && !Array.isArray(val) && Object.keys(val as object).length > 0;

  return {
    slug: String(entry.slug || fallbackSlug || ""),
    title: isPopulated(entry.title) ? String(entry.title) : (localFallback?.title || ""),
    subtitle: isPopulated(entry.subtitle) ? String(entry.subtitle) : (localFallback?.subtitle || ""),
    description: isPopulated(entry.description) ? String(entry.description) : (localFallback?.description || ""),
    icon: isPopulated(entry.icon) ? String(entry.icon) : localFallback?.icon,
    cardImage: isPopulated(entry.cardImage) ? String(entry.cardImage) : localFallback?.cardImage,
    heroImage: isPopulated(entry.heroImage) ? String(entry.heroImage) : (localFallback?.heroImage || ""),
    heroVariant: isPopulated(entry.heroVariant) ? String(entry.heroVariant) : localFallback?.heroVariant,
    heroCtaLabel: isPopulated(entry.heroCtaLabel) ? String(entry.heroCtaLabel) : localFallback?.heroCtaLabel,
    overview: isPopulated(entry.overview) ? String(entry.overview) : (localFallback?.overview || ""),
    overviewTagline: isPopulated(entry.overviewTagline) ? String(entry.overviewTagline) : localFallback?.overviewTagline,
    featuresEyebrow: isPopulated(entry.featuresEyebrow) ? String(entry.featuresEyebrow) : localFallback?.featuresEyebrow,
    features: isArrayPopulated(entry.features) ? (entry.features as CmsService["features"]) : (localFallback?.features || []),
    technologies: isArrayPopulated(entry.technologies) ? (entry.technologies as string[]) : (localFallback?.technologies || []),
    processHeading: isPopulated(entry.processHeading) ? String(entry.processHeading) : localFallback?.processHeading,
    processDescription: isPopulated(entry.processDescription) ? String(entry.processDescription) : localFallback?.processDescription,
    process: isArrayPopulated(entry.process) ? (entry.process as CmsService["process"]) : (localFallback?.process || []),
    stats: isArrayPopulated(entry.stats) ? (entry.stats as CmsService["stats"]) : (localFallback?.stats || []),
    caseStudies: isArrayPopulated(entry.caseStudies) ? (entry.caseStudies as CmsService["caseStudies"]) : (localFallback?.caseStudies || []),
    seo: (entry.seo as Record<string, unknown>) || localFallback?.seo,
    whyChooseUsHeading: isPopulated(entry.whyChooseUsHeading) ? String(entry.whyChooseUsHeading) : localFallback?.whyChooseUsHeading,
    whyChooseUsIntro: isPopulated(entry.whyChooseUsIntro) ? String(entry.whyChooseUsIntro) : localFallback?.whyChooseUsIntro,
    whyChooseUsSubHeading: isPopulated(entry.whyChooseUsSubHeading) ? String(entry.whyChooseUsSubHeading) : localFallback?.whyChooseUsSubHeading,
    whyChooseUsSubText: isPopulated(entry.whyChooseUsSubText) ? String(entry.whyChooseUsSubText) : localFallback?.whyChooseUsSubText,
    whyChooseUsCards: isArrayPopulated(entry.whyChooseUsCards)
      ? (entry.whyChooseUsCards as { icon: string; label: string }[])
      : localFallback?.whyChooseUsCards,
    deliveryEyebrow: isPopulated(entry.deliveryEyebrow) ? String(entry.deliveryEyebrow) : localFallback?.deliveryEyebrow,
    deliveryHeading: isPopulated(entry.deliveryHeading) ? String(entry.deliveryHeading) : localFallback?.deliveryHeading,
    deliveryDescription: isPopulated(entry.deliveryDescription) ? String(entry.deliveryDescription) : localFallback?.deliveryDescription,
    deliverySteps: isArrayPopulated(entry.deliverySteps)
      ? (entry.deliverySteps as { title: string; content: string }[])
      : localFallback?.deliverySteps,
    faqs: isArrayPopulated(entry.faqs)
      ? (entry.faqs as { question: string; answer: string }[])
      : localFallback?.faqs,
    ctaHeading: isPopulated(entry.ctaHeading) ? String(entry.ctaHeading) : localFallback?.ctaHeading,
    ctaBody: isPopulated(entry.ctaBody) ? String(entry.ctaBody) : localFallback?.ctaBody,
    ctaButtonLabel: isPopulated(entry.ctaButtonLabel) ? String(entry.ctaButtonLabel) : localFallback?.ctaButtonLabel,
    showTechStack:
      typeof entry.showTechStack === "boolean"
        ? entry.showTechStack
        : localFallback?.showTechStack,
    techStack: isObjectPopulated(entry.techStack)
      ? (entry.techStack as Record<string, unknown>)
      : (localFallback?.techStack as Record<string, unknown> | undefined),
    pageSections: isObjectPopulated(entry.pageSections)
      ? (entry.pageSections as Record<string, unknown>)
      : (localFallback?.pageSections as Record<string, unknown> | undefined),
    canadaCities: isArrayPopulated(entry.canadaCities) || isObjectPopulated(entry.canadaCities)
      ? (entry.canadaCities as CmsService["canadaCities"])
      : localFallback?.canadaCities,
  };
}

export async function getCmsServices(fallback: Record<string, Omit<CmsService, "slug">>): Promise<CmsService[]> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/services",
    query: {
      // Strapi 5: Content API returns published by default; be explicit.
      status: "published",
      ...SERVICE_POPULATE,
      "sort": "order:asc",
      "pagination[pageSize]": 100,
    },
    tags: ["strapi", "services"],
  });

  const list = unwrapList(res).map((e) => {
    const slug = String(e.slug || "");
    const local = fallback[slug];
    return mapService(e, slug, local ? { slug, ...local } : undefined);
  });
  if (list.length) return list;

  return Object.entries(fallback).map(([slug, data]) => ({ slug, ...data }));
}

export async function getCmsService(
  slug: string,
  fallback: Record<string, Omit<CmsService, "slug">>
): Promise<{ service: CmsService; source: "strapi" | "local-fallback" } | null> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/services",
    query: {
      status: "published",
      "filters[slug][$eq]": slug,
      ...SERVICE_POPULATE,
      "pagination[pageSize]": 1,
    },
    tags: ["strapi", "services", `service-${slug}`],
  });

  const entry = unwrapList(res)[0];
  const local = fallback[slug];
  if (entry) {
    return {
      service: mapService(entry, slug, local ? { slug, ...local } : undefined),
      source: "strapi",
    };
  }
  if (local) return { service: { slug, ...local }, source: "local-fallback" };
  return null;
}

export type CmsIndustry = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon?: string;
  cardImage?: string;
  heroImage?: string;
  solutionsEyebrow?: string;
  challengesHeading?: string;
  servicesHeading?: string;
  technologiesHeading?: string;
  heroCtaLabel?: string;
  heroStats: { value: string; label: string }[];
  challenges: { title: string; description: string; icon?: string }[];
  services: { title: string; description: string; icon?: string }[];
  technologies: string[];
  highlights?: string[];
  whyChooseUsHeading?: string;
  whyChooseUsIntro?: string;
  whyChooseUsSubHeading?: string;
  whyChooseUsSubText?: string;
  whyChooseUsCards?: { icon: string; label: string }[];
  ctaHeading?: string;
  ctaBody?: string;
  ctaButtonLabel?: string;
  seo?: Record<string, unknown>;
};

function mapIndustry(
  entry: Record<string, unknown>,
  fallbackSlug?: string,
  localFallback?: Omit<CmsIndustry, "slug">
): CmsIndustry {
  const isPopulated = (val: unknown) => val !== null && val !== undefined && val !== "";
  const heroObj = entry.hero && typeof entry.hero === "object" ? (entry.hero as { url?: string }) : null;
  const heroUrl =
    heroObj?.url ||
    (isPopulated(entry.heroImageUrl) ? String(entry.heroImageUrl) : "") ||
    (isPopulated(entry.hero) && typeof entry.hero === "string" ? String(entry.hero) : "");

  return {
    slug: String(entry.slug || fallbackSlug || ""),
    title: isPopulated(entry.title) ? String(entry.title) : (localFallback?.title || ""),
    subtitle: isPopulated(entry.subtitle) ? String(entry.subtitle) : (localFallback?.subtitle || ""),
    description: isPopulated(entry.description) ? String(entry.description) : (localFallback?.description || ""),
    icon: isPopulated(entry.icon) ? String(entry.icon) : localFallback?.icon,
    cardImage: isPopulated(entry.cardImage) ? String(entry.cardImage) : localFallback?.cardImage,
    heroImage: heroUrl || localFallback?.heroImage || "",
    solutionsEyebrow: isPopulated(entry.solutionsEyebrow) ? String(entry.solutionsEyebrow) : localFallback?.solutionsEyebrow,
    challengesHeading: isPopulated(entry.challengesHeading) ? String(entry.challengesHeading) : localFallback?.challengesHeading,
    servicesHeading: isPopulated(entry.servicesHeading) ? String(entry.servicesHeading) : localFallback?.servicesHeading,
    technologiesHeading: isPopulated(entry.technologiesHeading) ? String(entry.technologiesHeading) : localFallback?.technologiesHeading,
    heroCtaLabel: isPopulated(entry.heroCtaLabel) ? String(entry.heroCtaLabel) : localFallback?.heroCtaLabel,
    heroStats: Array.isArray(entry.heroStats) && entry.heroStats.length
      ? (entry.heroStats as CmsIndustry["heroStats"])
      : (localFallback?.heroStats || []),
    challenges: Array.isArray(entry.challenges) && entry.challenges.length
      ? (entry.challenges as CmsIndustry["challenges"])
      : (localFallback?.challenges || []),
    services: Array.isArray(entry.services) && entry.services.length
      ? (entry.services as CmsIndustry["services"])
      : (localFallback?.services || []),
    technologies: Array.isArray(entry.technologies) && entry.technologies.length
      ? (entry.technologies as string[])
      : (localFallback?.technologies || []),
    highlights: Array.isArray(entry.highlights) && entry.highlights.length
      ? (entry.highlights as string[])
      : localFallback?.highlights,
    whyChooseUsHeading: isPopulated(entry.whyChooseUsHeading) ? String(entry.whyChooseUsHeading) : localFallback?.whyChooseUsHeading,
    whyChooseUsIntro: isPopulated(entry.whyChooseUsIntro) ? String(entry.whyChooseUsIntro) : localFallback?.whyChooseUsIntro,
    whyChooseUsSubHeading: isPopulated(entry.whyChooseUsSubHeading) ? String(entry.whyChooseUsSubHeading) : localFallback?.whyChooseUsSubHeading,
    whyChooseUsSubText: isPopulated(entry.whyChooseUsSubText) ? String(entry.whyChooseUsSubText) : localFallback?.whyChooseUsSubText,
    whyChooseUsCards: Array.isArray(entry.whyChooseUsCards) && entry.whyChooseUsCards.length
      ? (entry.whyChooseUsCards as CmsIndustry["whyChooseUsCards"])
      : localFallback?.whyChooseUsCards,
    ctaHeading: isPopulated(entry.ctaHeading) ? String(entry.ctaHeading) : localFallback?.ctaHeading,
    ctaBody: isPopulated(entry.ctaBody) ? String(entry.ctaBody) : localFallback?.ctaBody,
    ctaButtonLabel: isPopulated(entry.ctaButtonLabel) ? String(entry.ctaButtonLabel) : localFallback?.ctaButtonLabel,
    seo: (entry.seo as Record<string, unknown>) || localFallback?.seo,
  };
}

export async function getCmsIndustries(
  fallback: Record<string, Omit<CmsIndustry, "slug">>
): Promise<CmsIndustry[]> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/industries",
    query: {
      status: "published",
      ...INDUSTRY_POPULATE,
      "sort": "order:asc",
      "pagination[pageSize]": 100,
    },
    tags: ["strapi", "industries"],
  });

  const list = unwrapList(res).map((e) => {
    const slug = String(e.slug || "");
    return mapIndustry(e, slug, fallback[slug]);
  });
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
      status: "published",
      ...INDUSTRY_POPULATE,
      "pagination[pageSize]": 1,
    },
    tags: ["strapi", "industries", `industry-${slug}`],
  });

  const entry = unwrapList(res)[0];
  if (entry) return mapIndustry(entry, slug, fallback[slug]);
  const local = fallback[slug];
  return local ? { slug, ...local } : null;
}

export type CmsFaq = { question: string; answer: string; order: number; page?: string };

async function fetchCmsFaqs(page?: string): Promise<CmsFaq[]> {
  const query: Record<string, string | number> = {
    sort: "order:asc",
    "pagination[pageSize]": 50,
  };
  if (page) query["filters[page][$eq]"] = page;

  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/faqs",
    query,
    tags: ["strapi", "faqs", page ? `faqs-${page}` : "faqs-all"],
  });

  return unwrapList(res).map((e) => ({
    question: String(e.question || ""),
    answer: String(e.answer || ""),
    order: Number(e.order || 0),
    page: String(e.page || "global"),
  }));
}

export async function getCmsFaqs(page?: string): Promise<CmsFaq[]> {
  const list = await fetchCmsFaqs(page);
  // If a page filter returned nothing, fall back once without page (non-recursive).
  if (page && !list.length) {
    return fetchCmsFaqs();
  }
  return list;
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
      ...SEO_POPULATE,
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
      "populate[heroSlides]": "true",
      "populate[impactStats]": "true",
      ...SEO_POPULATE,
    },
    tags: ["strapi", "homepage"],
  });
  return unwrapSingle(res);
}

export async function getCmsBlogCategories(): Promise<{ name: string; slug?: string }[]> {
  const res = await strapiFetch<StrapiListResponse<Record<string, unknown>>>({
    path: "/api/blog-categories",
    query: {
      sort: "name:asc",
      "pagination[pageSize]": 50,
    },
    tags: ["strapi", "blog-categories"],
  });
  return unwrapList(res)
    .map((e) => ({
      name: String(e.name || ""),
      slug: e.slug ? String(e.slug) : undefined,
    }))
    .filter((c) => c.name);
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
      "populate[heroimage]": "true",
      ...SEO_POPULATE,
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
      ...SEO_POPULATE,
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
