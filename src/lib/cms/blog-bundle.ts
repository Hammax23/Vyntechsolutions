import {
  getCmsBlogCategories,
  getCmsBlogPost,
  getCmsBlogPosts,
  getCmsNavigation,
  getCmsRelatedPosts,
  getCmsStaticPage,
  type CmsBlogPost,
} from "@/lib/cms/content";
import {
  blogDetailDefaults,
  blogListingDefaults,
  blogPosts,
  type BlogDetailChrome,
  type BlogListingChrome,
  type BlogPost,
} from "@/data/blogData";
import { DEFAULT_NAV_CHROME, mergeCopy } from "@/lib/ui-copy";

type NavChrome = typeof DEFAULT_NAV_CHROME;

function pick(...vals: unknown[]) {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v;
  }
  return undefined;
}

export function mergeBlogListingChrome(
  defaults: BlogListingChrome,
  page: Record<string, unknown> | null | undefined
): BlogListingChrome {
  if (!page) return defaults;
  const sections =
    page.sections && typeof page.sections === "object" && !Array.isArray(page.sections)
      ? (page.sections as Record<string, unknown>)
      : {};

  return {
    heroHeading: pick(page.heroHeading, sections.heroHeading) || defaults.heroHeading,
    heroBody: pick(page.heroBody, sections.heroBody) || defaults.heroBody,
    ctaHeading: pick(sections.ctaHeading, page.ctaHeading) || defaults.ctaHeading,
    ctaBody: pick(sections.ctaBody, page.ctaBody) || defaults.ctaBody,
    ctaLabel: pick(sections.ctaLabel, page.ctaLabel) || defaults.ctaLabel,
    featuredLabel:
      pick(sections.featuredLabel, page.featuredLabel) || defaults.featuredLabel,
    allCategoryLabel:
      pick(sections.allCategoryLabel, page.allCategoryLabel) || defaults.allCategoryLabel,
    emptyCategoryHeading:
      pick(sections.emptyCategoryHeading, page.emptyCategoryHeading) ||
      defaults.emptyCategoryHeading,
    emptyCategoryBody:
      pick(sections.emptyCategoryBody, page.emptyCategoryBody) ||
      defaults.emptyCategoryBody,
    emptyPostsMessage:
      pick(sections.emptyPostsMessage, page.emptyPostsMessage) ||
      defaults.emptyPostsMessage,
    breadcrumbLabel:
      pick(sections.breadcrumbLabel, page.breadcrumbLabel, page.title) ||
      defaults.breadcrumbLabel,
  };
}

export function mergeBlogDetailChrome(
  defaults: BlogDetailChrome,
  page: Record<string, unknown> | null | undefined
): BlogDetailChrome {
  if (!page) return defaults;
  const sections =
    page.sections && typeof page.sections === "object" && !Array.isArray(page.sections)
      ? (page.sections as Record<string, unknown>)
      : {};

  return {
    relatedHeading:
      pick(sections.relatedHeading, page.relatedHeading) || defaults.relatedHeading,
    ctaHeading:
      pick(sections.postCtaHeading, page.postCtaHeading, sections.ctaHeading) ||
      defaults.ctaHeading,
    ctaBody:
      pick(sections.postCtaBody, page.postCtaBody, sections.ctaBody) || defaults.ctaBody,
    ctaLabel:
      pick(sections.postCtaLabel, page.postCtaLabel, sections.ctaLabel) ||
      defaults.ctaLabel,
    notFoundHeading:
      pick(sections.notFoundHeading, page.notFoundHeading) || defaults.notFoundHeading,
    notFoundLink:
      pick(sections.notFoundLink, page.notFoundLink) || defaults.notFoundLink,
    breadcrumbLabel:
      pick(sections.breadcrumbLabel, page.breadcrumbLabel, page.title) ||
      defaults.breadcrumbLabel,
  };
}

export type BlogListingBundle = {
  posts: CmsBlogPost[];
  categories: string[];
  chrome: BlogListingChrome;
  navChrome: NavChrome;
};

export async function loadBlogListingBundle(): Promise<BlogListingBundle> {
  const [posts, categories, staticPage, navigation] = await Promise.all([
    getCmsBlogPosts().catch(() => blogPosts as CmsBlogPost[]),
    getCmsBlogCategories().catch(() => []),
    getCmsStaticPage("blog").catch(() => null),
    getCmsNavigation().catch(() => null),
  ]);

  const list = posts.length ? posts : (blogPosts as CmsBlogPost[]);
  const chrome = mergeBlogListingChrome(
    blogListingDefaults,
    (staticPage as Record<string, unknown> | null) || null
  );

  const fromCms = categories.map((c) => c.name).filter(Boolean);
  const fromPosts = Array.from(
    new Set(list.map((p) => p.category).filter(Boolean))
  );
  const categoryNames = fromCms.length ? fromCms : fromPosts;

  return {
    posts: list,
    categories: [chrome.allCategoryLabel, ...categoryNames],
    chrome,
    navChrome: mergeCopy(
      DEFAULT_NAV_CHROME,
      (navigation?.chrome as Partial<NavChrome> | undefined) || undefined
    ),
  };
}

export type BlogDetailBundle = {
  slug: string;
  post: BlogPost | null;
  related: BlogPost[];
  chrome: BlogDetailChrome;
  navChrome: NavChrome;
};

export async function loadBlogDetailBundle(slug: string): Promise<BlogDetailBundle> {
  const [post, related, staticPage, navigation] = await Promise.all([
    getCmsBlogPost(slug).catch(() => null),
    getCmsRelatedPosts(slug, 3).catch(() => []),
    getCmsStaticPage("blog").catch(() => null),
    getCmsNavigation().catch(() => null),
  ]);

  return {
    slug,
    post: (post as BlogPost | null) || null,
    related: related as BlogPost[],
    chrome: mergeBlogDetailChrome(
      blogDetailDefaults,
      (staticPage as Record<string, unknown> | null) || null
    ),
    navChrome: mergeCopy(
      DEFAULT_NAV_CHROME,
      (navigation?.chrome as Partial<NavChrome> | undefined) || undefined
    ),
  };
}
