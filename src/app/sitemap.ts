import { MetadataRoute } from "next";
import { getCmsBlogPosts, getCmsServices, getCmsIndustries } from "@/lib/cms/content";
import { servicesData } from "@/data/servicesData";
import { industriesData } from "@/data/industriesData";
import { blogPosts } from "@/data/blogData";
import { servicePageSectionsBySlug } from "@/data/servicePageSections";
import { SITE_URL } from "@/lib/company";

const siteUrl = SITE_URL.replace(/\/$/, "");

function cityToSlug(city: string) {
  return city
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function uniqByUrl(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  return entries.filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
}

function collectCitiesForService(
  slug: string,
  cmsCities?: string[] | null
): string[] {
  const local = servicePageSectionsBySlug[slug];
  const fromSections = [
    ...(local?.canadaCities?.cities || []),
    ...(local?.localSeo?.cities || []),
  ];
  const fromServiceData = (() => {
    const raw = servicesData[slug]?.canadaCities;
    if (Array.isArray(raw)) return raw.map(String);
    if (raw && typeof raw === "object" && Array.isArray((raw as { cities?: string[] }).cities)) {
      return (raw as { cities: string[] }).cities;
    }
    return [] as string[];
  })();

  return [...new Set([...(cmsCities || []), ...fromSections, ...fromServiceData].map(String).filter(Boolean))];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  const [cmsServices, cmsIndustries, cmsPosts] = await Promise.all([
    getCmsServices(servicesData).catch(() => [] as Awaited<ReturnType<typeof getCmsServices>>),
    getCmsIndustries(industriesData).catch(() => [] as Awaited<ReturnType<typeof getCmsIndustries>>),
    getCmsBlogPosts().catch(() => [] as Awaited<ReturnType<typeof getCmsBlogPosts>>),
  ]);

  // Merge CMS + local so nothing is missing if one source is incomplete
  const serviceSlugs = [
    ...new Set([
      ...cmsServices.map((s) => s.slug).filter(Boolean),
      ...Object.keys(servicesData),
    ]),
  ];

  const industrySlugs = [
    ...new Set([
      ...cmsIndustries.map((i) => i.slug).filter(Boolean),
      ...Object.keys(industriesData),
    ]),
  ];

  const posts = (() => {
    const map = new Map<string, { slug: string }>();
    for (const p of blogPosts) map.set(p.slug, p);
    for (const p of cmsPosts) if (p.slug) map.set(p.slug, p);
    return [...map.values()];
  })();

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: currentDate, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/services`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/industries`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/blog`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/careers`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/lets-talk-business`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/api-docs`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/privacy-policy`, lastModified: currentDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms-and-conditions`, lastModified: currentDate, changeFrequency: "yearly", priority: 0.3 },
  ];

  const serviceUrls: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${siteUrl}/services/${slug}`,
    lastModified: currentDate,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const industryUrls: MetadataRoute.Sitemap = industrySlugs.map((slug) => ({
    url: `${siteUrl}/industries/${slug}`,
    lastModified: currentDate,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogUrls: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: currentDate,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const cmsCitiesBySlug = new Map(
    cmsServices.map((s) => [
      s.slug,
      s.canadaCitiesBlock?.cities?.length
        ? s.canadaCitiesBlock.cities
        : undefined,
    ])
  );

  const cityUrls: MetadataRoute.Sitemap = [];
  for (const slug of serviceSlugs) {
    const cities = collectCitiesForService(slug, cmsCitiesBySlug.get(slug));
    for (const city of cities) {
      const citySlug = cityToSlug(city);
      if (!citySlug) continue;
      cityUrls.push({
        url: `${siteUrl}/services/${slug}/${citySlug}`,
        lastModified: currentDate,
        changeFrequency: "monthly",
        priority: 0.65,
      });
    }
  }

  // Public pages only — exclude /admin, /workflow, /quote/*, /verify/*
  return uniqByUrl([
    ...staticPages,
    ...serviceUrls,
    ...industryUrls,
    ...blogUrls,
    ...cityUrls,
  ]);
}
