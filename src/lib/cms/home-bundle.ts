import {
  getCmsBlogPosts,
  getCmsClientLogos,
  getCmsFaqs,
  getCmsHomepage,
  getCmsIndustries,
  getCmsPromos,
  getCmsServices,
} from "@/lib/cms/content";
import { servicesData } from "@/data/servicesData";
import { industriesData } from "@/data/industriesData";

/** Server-fetched payload so homepage paints Strapi content on first HTML (no fallback flash). */
export type HomeCmsBundle = {
  homepage: Record<string, unknown> | null;
  faqs: { question: string; answer: string }[];
  services: { slug: string; title: string; description: string; cardImage?: string }[];
  industries: Record<string, unknown>[];
  posts: { slug: string; title: string; category?: string; image?: string }[];
  logos: Record<string, unknown>[];
  googleRankingPromo: Record<string, unknown> | null;
};

export async function loadHomeCmsBundle(): Promise<HomeCmsBundle> {
  const [homepage, faqs, services, industries, posts, logos, rankingPromos] =
    await Promise.all([
      getCmsHomepage().catch(() => null),
      getCmsFaqs("home").catch(() => []),
      getCmsServices(servicesData).catch(() => []),
      getCmsIndustries(industriesData).catch(() => []),
      getCmsBlogPosts().catch(() => []),
      getCmsClientLogos().catch(() => []),
      getCmsPromos("google-ranking").catch(() => []),
    ]);

  return {
    homepage,
    faqs: faqs.map((f) => ({ question: f.question, answer: f.answer })),
    services: services.map((s) => ({
      slug: s.slug,
      title: s.title,
      description: s.description,
      cardImage: s.cardImage,
    })),
    industries: industries as unknown as Record<string, unknown>[],
    posts: posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      category: p.category,
      image: p.image,
    })),
    logos,
    googleRankingPromo: rankingPromos[0] || null,
  };
}
