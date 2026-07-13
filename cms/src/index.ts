import type { Core } from "@strapi/strapi";
import fs from "fs";
import path from "path";

const PUBLIC_ACTIONS = [
  "api::global-seo.global-seo.find",
  "api::page-seo.page-seo.find",
  "api::page-seo.page-seo.findOne",
  "api::faq.faq.find",
  "api::faq.faq.findOne",
  "api::service.service.find",
  "api::service.service.findOne",
  "api::industry.industry.find",
  "api::industry.industry.findOne",
  "api::blog-post.blog-post.find",
  "api::blog-post.blog-post.findOne",
  "api::blog-category.blog-category.find",
  "api::blog-category.blog-category.findOne",
  "api::homepage.homepage.find",
  "api::static-page.static-page.find",
  "api::static-page.static-page.findOne",
  "api::legal-page.legal-page.find",
  "api::legal-page.legal-page.findOne",
  "api::navigation.navigation.find",
  "api::promo.promo.find",
  "api::promo.promo.findOne",
  "api::form-config.form-config.find",
  "api::job-opening.job-opening.find",
  "api::job-opening.job-opening.findOne",
  "api::organization-profile.organization-profile.find",
  "api::client-logo.client-logo.find",
  "api::client-logo.client-logo.findOne",
];

async function enablePublicPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db.query("plugin::users-permissions.role").findOne({
    where: { type: "public" },
  });
  if (!publicRole) return;

  for (const action of PUBLIC_ACTIONS) {
    const existing = await strapi.db.query("plugin::users-permissions.permission").findOne({
      where: { action, role: publicRole.id },
    });
    if (!existing) {
      await strapi.db.query("plugin::users-permissions.permission").create({
        data: { action, role: publicRole.id },
      });
    }
  }
}

async function seedIfEmpty(strapi: Core.Strapi) {
  const seedPath = path.join(process.cwd(), "data", "seed.json");
  if (!fs.existsSync(seedPath)) {
    strapi.log.info("No seed.json found — skip auto-seed");
    return;
  }

  const existingServices = await strapi.db.query("api::service.service").count();
  if (existingServices > 0) {
    strapi.log.info("CMS already has services — skip auto-seed");
    return;
  }

  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  strapi.log.info("Seeding CMS from data/seed.json...");

  if (seed.globalSeo) {
    await strapi.documents("api::global-seo.global-seo").create({
      data: seed.globalSeo,
      status: "published",
    });
  }

  for (const page of seed.pageSeos || []) {
    await strapi.documents("api::page-seo.page-seo").create({
      data: page,
      status: "published",
    });
  }

  for (const faq of seed.faqs || []) {
    await strapi.documents("api::faq.faq").create({
      data: faq,
      status: "published",
    });
  }

  const categoryIds: Record<string, string> = {};
  for (const cat of seed.categories || []) {
    const created = await strapi.documents("api::blog-category.blog-category").create({
      data: cat,
      status: "published",
    });
    categoryIds[cat.name] = created.documentId;
  }

  for (const post of seed.blogPosts || []) {
    const { categoryName, ...rest } = post;
    await strapi.documents("api::blog-post.blog-post").create({
      data: {
        ...rest,
        category: categoryName ? categoryIds[categoryName] : undefined,
      },
      status: "published",
    });
  }

  for (const service of seed.services || []) {
    await strapi.documents("api::service.service").create({
      data: service,
      status: "published",
    });
  }

  for (const industry of seed.industries || []) {
    await strapi.documents("api::industry.industry").create({
      data: industry,
      status: "published",
    });
  }

  if (seed.homepage) {
    await strapi.documents("api::homepage.homepage").create({
      data: seed.homepage,
      status: "published",
    });
  }

  if (seed.navigation) {
    await strapi.documents("api::navigation.navigation").create({
      data: seed.navigation,
      status: "published",
    });
  }

  for (const promo of seed.promos || []) {
    await strapi.documents("api::promo.promo").create({
      data: promo,
      status: "published",
    });
  }

  if (seed.formConfig) {
    await strapi.documents("api::form-config.form-config").create({
      data: seed.formConfig,
      status: "published",
    });
  }

  if (seed.organizationProfile) {
    await strapi.documents("api::organization-profile.organization-profile").create({
      data: seed.organizationProfile,
      status: "published",
    });
  }

  for (const page of seed.staticPages || []) {
    await strapi.documents("api::static-page.static-page").create({
      data: page,
      status: "published",
    });
  }

  for (const page of seed.legalPages || []) {
    await strapi.documents("api::legal-page.legal-page").create({
      data: page,
      status: "published",
    });
  }

  for (const logo of seed.clientLogos || []) {
    await strapi.documents("api::client-logo.client-logo").create({
      data: logo,
      status: "published",
    });
  }

  strapi.log.info("CMS seed complete");
}

export default {
  register() {},
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      await enablePublicPermissions(strapi);
      strapi.log.info("Public read permissions enabled for CMS content types");
    } catch (err) {
      strapi.log.warn(`Could not set public permissions: ${err}`);
    }

    try {
      await seedIfEmpty(strapi);
    } catch (err) {
      strapi.log.warn(`CMS seed failed: ${err}`);
    }
  },
};
