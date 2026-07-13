import { MetadataRoute } from "next";
import { getCmsBlogPosts, getCmsServices, getCmsIndustries } from "@/lib/cms/content";
import { servicesData } from "@/data/servicesData";
import { industriesData } from "@/data/industriesData";
import { blogPosts } from "@/data/blogData";

const siteUrl = "https://vyntechsolutions.ca";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  const [services, industries, posts] = await Promise.all([
    getCmsServices(servicesData),
    getCmsIndustries(industriesData),
    getCmsBlogPosts(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: currentDate, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/services`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/industries`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/blog`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/careers`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/lets-talk-business`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/privacy-policy`, lastModified: currentDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms-and-conditions`, lastModified: currentDate, changeFrequency: "yearly", priority: 0.3 },
  ];

  const serviceUrls = (services.length ? services : Object.keys(servicesData).map((slug) => ({ slug }))).map(
    (s) => ({
      url: `${siteUrl}/services/${s.slug}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })
  );

  const industryUrls = (industries.length ? industries : Object.keys(industriesData).map((slug) => ({ slug }))).map(
    (i) => ({
      url: `${siteUrl}/industries/${i.slug}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })
  );

  const blogUrls = (posts.length ? posts : blogPosts).map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...serviceUrls, ...industryUrls, ...blogUrls];
}
