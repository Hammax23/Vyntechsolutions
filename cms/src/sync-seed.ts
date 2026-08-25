/**
 * Upserts seed.json into an already-populated Strapi (fills empty fields / creates missing entries).
 * Does NOT wipe user edits: for existing entries, only writes keys that are currently empty.
 *
 * Usage (from cms/):
 *   CMS_SYNC_SEED=true npm run develop
 * Or once:
 *   CMS_SYNC_SEED=true node -e "require('dotenv').config(); ..."  (prefer restart develop with env)
 *
 * Prefer: set CMS_SYNC_SEED=true once in cms/.env, restart Strapi, then remove the flag.
 */
import type { Core } from "@strapi/strapi";
import fs from "fs";
import path from "path";

function isEmpty(val: unknown): boolean {
  if (val === null || val === undefined || val === "") return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (typeof val === "object" && !Array.isArray(val) && Object.keys(val as object).length === 0) return true;
  return false;
}

function mergeMissing(existing: Record<string, unknown>, seedData: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(seedData)) {
    if (key === "id" || key === "documentId" || key === "createdAt" || key === "updatedAt" || key === "publishedAt") {
      continue;
    }
    if (isEmpty(existing[key])) {
      out[key] = value;
    }
  }
  return out;
}

/** Content keys we intentionally refresh from seed so the live site matches the repo copy. */
const SERVICE_FORCE_KEYS = [
  "title",
  "subtitle",
  "description",
  "overview",
  "overviewTagline",
  "features",
  "technologies",
  "process",
  "processHeading",
  "processDescription",
  "stats",
  "caseStudies",
  "whyChooseUsHeading",
  "whyChooseUsIntro",
  "whyChooseUsSubHeading",
  "whyChooseUsSubText",
  "whyChooseUsCards",
  "deliveryHeading",
  "deliveryDescription",
  "deliverySteps",
  "faqs",
];

const HOMEPAGE_FORCE_KEYS = [
  "heroSlides",
  "heroCtaLabel",
  "heroWords",
  "servicesHeading",
  "servicesSubheading",
  "servicesBody",
  "impactEyebrow",
  "impactHeading",
  "impactBody",
  "impactStats",
  "impactCtaLabel",
  "impactCtaHref",
  "insightsHeading",
  "industriesHeading",
  "industriesSubheading",
  "faqEyebrow",
  "faqHeading",
  "faqIntro",
  "techStackEyebrow",
  "techStackHeading",
  "techStackBody",
  "techStack",
];

function mergeForced(
  existing: Record<string, unknown>,
  seedData: Record<string, unknown>,
  forceKeys: string[]
) {
  const out = mergeMissing(existing, seedData);
  for (const key of forceKeys) {
    if (seedData[key] !== undefined) out[key] = seedData[key];
  }
  return out;
}

export async function syncSeedIfRequested(strapi: Core.Strapi) {
  if (process.env.CMS_SYNC_SEED !== "true") return;

  const seedPath = path.join(process.cwd(), "data", "seed.json");
  if (!fs.existsSync(seedPath)) {
    strapi.log.warn("CMS_SYNC_SEED set but data/seed.json missing");
    return;
  }

  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  strapi.log.info("CMS_SYNC_SEED=true — merging missing fields from seed.json...");

  async function upsertSingle(
    uid: any,
    data: Record<string, unknown> | undefined,
    forceKeys: string[] = []
  ) {
    if (!data) return;
    try {
      const existing = await strapi.documents(uid).findFirst({});
      if (!existing) {
        await strapi.documents(uid).create({ data, status: "published" });
        return;
      }
      const patch = forceKeys.length
        ? mergeForced(existing as Record<string, unknown>, data, forceKeys)
        : mergeMissing(existing as Record<string, unknown>, data);
      if (Object.keys(patch).length) {
        await strapi.documents(uid).update({
          documentId: existing.documentId,
          data: patch,
          status: "published",
        });
      }
    } catch (err) {
      strapi.log.warn(`CMS sync skipped ${uid}: ${err}`);
    }
  }

  async function upsertCollection(
    uid: any,
    items: Record<string, unknown>[] | undefined,
    slugField = "slug",
    forceKeys: string[] = []
  ) {
    if (!items?.length) return;
    for (const item of items) {
      const slug = item[slugField];
      if (!slug) continue;
      try {
        const existing = await strapi.documents(uid).findFirst({
          filters: { [slugField]: slug } as any,
        });
        if (!existing) {
          await strapi.documents(uid).create({ data: item, status: "published" });
          continue;
        }
        const patch = forceKeys.length
          ? mergeForced(existing as Record<string, unknown>, item, forceKeys)
          : mergeMissing(existing as Record<string, unknown>, item);
        if (Object.keys(patch).length) {
          await strapi.documents(uid).update({
            documentId: existing.documentId,
            data: patch,
            status: "published",
          });
        }
      } catch (err) {
        strapi.log.warn(`CMS sync skipped ${uid} ${slugField}=${slug}: ${err}`);
      }
    }
  }

  await upsertSingle("api::global-seo.global-seo", seed.globalSeo);
  await upsertSingle("api::homepage.homepage", seed.homepage, HOMEPAGE_FORCE_KEYS);
  await upsertSingle("api::navigation.navigation", seed.navigation, [
    "footerGroups",
    "legalLinks",
    "socialLinks",
    "primaryLinks",
  ]);
  await upsertSingle("api::form-config.form-config", seed.formConfig);
  await upsertSingle("api::organization-profile.organization-profile", seed.organizationProfile, [
    "address",
    "tagline",
    "phone",
    "email",
    "name",
  ]);

  await upsertCollection("api::faq.faq", seed.faqs, "question");
  await upsertCollection("api::service.service", seed.services, "slug", SERVICE_FORCE_KEYS);
  await upsertCollection("api::industry.industry", seed.industries);
  await upsertCollection("api::static-page.static-page", seed.staticPages, "slug", [
    "heroHeading",
    "heroBody",
    "sections",
    "body",
    "title",
  ]);
  await upsertCollection("api::legal-page.legal-page", seed.legalPages, "slug", [
    "title",
    "lastUpdated",
    "body",
  ]);
  await upsertCollection("api::page-seo.page-seo", seed.pageSeos, "path");
  await upsertCollection("api::promo.promo", seed.promos, "name");
  await upsertCollection("api::client-logo.client-logo", seed.clientLogos, "name");
  await upsertCollection("api::job-opening.job-opening", seed.jobOpenings, "title", [
    "department",
    "location",
    "type",
    "experience",
    "salary",
    "description",
    "requirements",
    "responsibilities",
    "benefits",
    "isActive",
  ]);

  // Blog categories + posts (match by name / slug)
  const categoryIds: Record<string, string> = {};
  for (const cat of seed.categories || []) {
    if (!cat?.name) continue;
    try {
      const existing = await strapi.documents("api::blog-category.blog-category").findFirst({
        filters: { name: cat.name } as any,
      });
      if (!existing) {
        const created = await strapi.documents("api::blog-category.blog-category").create({
          data: cat,
          status: "published",
        });
        categoryIds[cat.name] = created.documentId;
      } else {
        const patch = mergeMissing(existing as Record<string, unknown>, cat);
        if (Object.keys(patch).length) {
          await strapi.documents("api::blog-category.blog-category").update({
            documentId: existing.documentId,
            data: patch,
            status: "published",
          });
        }
        categoryIds[cat.name] = existing.documentId;
      }
    } catch (err) {
      strapi.log.warn(`CMS sync skipped blog-category ${cat.name}: ${err}`);
    }
  }

  for (const post of seed.blogPosts || []) {
    if (!post?.slug) continue;
    try {
      const { categoryName, ...rest } = post;
      const data = {
        ...rest,
        ...(categoryName && categoryIds[categoryName]
          ? { category: categoryIds[categoryName] }
          : {}),
      };
      const existing = await strapi.documents("api::blog-post.blog-post").findFirst({
        filters: { slug: post.slug } as any,
      });
      if (!existing) {
        await strapi.documents("api::blog-post.blog-post").create({
          data,
          status: "published",
        });
        continue;
      }
      const patch = mergeMissing(existing as Record<string, unknown>, data);
      if (Object.keys(patch).length) {
        await strapi.documents("api::blog-post.blog-post").update({
          documentId: existing.documentId,
          data: patch,
          status: "published",
        });
      }
    } catch (err) {
      strapi.log.warn(`CMS sync skipped blog-post ${post.slug}: ${err}`);
    }
  }

  strapi.log.info(
    "CMS seed sync complete. Remove CMS_SYNC_SEED=true from env so future edits are not re-filled from seed."
  );
}
