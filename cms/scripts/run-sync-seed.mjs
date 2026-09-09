/**
 * One-shot: fill EMPTY Strapi fields from data/seed.json (industries + rest).
 * Does not need a full Strapi restart of the develop server.
 *
 * Usage (from cms/):
 *   node ./scripts/run-sync-seed.mjs
 */
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

process.chdir(root);

// Strapi develop loads .env; this one-shot script must load it manually.
const envPath = path.join(root, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
process.env.CMS_SYNC_SEED = "false";
process.env.CMS_AUTO_SEED = "false";

function isEmpty(val) {
  if (val === null || val === undefined || val === "") return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0) return true;
  return false;
}

function mergeMissing(existing, seedData) {
  const out = {};
  for (const [key, value] of Object.entries(seedData)) {
    if (["id", "documentId", "createdAt", "updatedAt", "publishedAt", "locale"].includes(key)) {
      continue;
    }
    // Never push media relations from seed JSON (URLs / objects break Document API)
    if (key === "hero" || key === "image" || key === "ogImage" || key === "logo") continue;
    if (isEmpty(existing[key])) out[key] = value;
  }
  return out;
}

  const INDUSTRY_POPULATE = {
    heroStats: true,
    challenges: true,
    services: true,
    whyChooseUsCards: true,
    faqs: true,
    seo: true,
  };

async function main() {
  const seedPath = path.join(root, "data", "seed.json");
  if (!fs.existsSync(seedPath)) {
    console.error("Missing data/seed.json");
    process.exit(1);
  }
  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));

  const { createStrapi } = require("@strapi/strapi");
  console.log("Loading Strapi (no HTTP listen)...");
  const strapi = await createStrapi({ distDir: "./dist" }).load();

  let updated = 0;
  let skipped = 0;

  for (const item of seed.industries || []) {
    const slug = item.slug;
    if (!slug) continue;
    try {
      const existing = await strapi.documents("api::industry.industry").findFirst({
        filters: { slug },
        populate: INDUSTRY_POPULATE,
      });
      if (!existing) {
        await strapi.documents("api::industry.industry").create({
          data: item,
          status: "published",
        });
        console.log(`created industry ${slug}`);
        updated++;
        continue;
      }
      const FORCE_INDUSTRY = [
        "servicesHeading",
        "heroImageUrl",
        "faqEyebrow",
        "faqHeading",
        "faqIntro",
        "faqs",
      ];
      const patch = mergeMissing(existing, item);
      for (const key of FORCE_INDUSTRY) {
        if (item[key] !== undefined) patch[key] = item[key];
      }
      delete patch.hero;
      if (!Object.keys(patch).length) {
        console.log(`skip industry ${slug} (no empty fields)`);
        skipped++;
        continue;
      }
      await strapi.documents("api::industry.industry").update({
        documentId: existing.documentId,
        data: patch,
        status: "published",
      });
      console.log(`updated industry ${slug}:`, Object.keys(patch).join(", "));
      updated++;
    } catch (err) {
      console.warn(`FAILED industry ${slug}:`, err?.message || err);
    }
  }

  // Services: fill empty + force FAQ chrome / cityHero industries
  const SERVICE_POPULATE = {
    whyChooseUsCards: true,
    features: true,
    process: true,
    stats: true,
    faqs: true,
    caseStudies: true,
    cityHero: true,
    engagementStrategies: true,
    cityFaqs: true,
    techStackBlock: { populate: { categories: { populate: ["items"] } } },
    canadaCitiesBlock: true,
  };

  for (const item of seed.services || []) {
    const slug = item.slug;
    if (!slug) continue;
    try {
      const existing = await strapi.documents("api::service.service").findFirst({
        filters: { slug },
        populate: SERVICE_POPULATE,
      });
      if (!existing) {
        await strapi.documents("api::service.service").create({
          data: item,
          status: "published",
        });
        console.log(`created service ${slug}`);
        updated++;
        continue;
      }
      const patch = mergeMissing(existing, item);
      for (const key of ["faqEyebrow", "faqHeading", "faqIntro"]) {
        if (item[key] !== undefined) patch[key] = item[key];
      }
      if (item.slug === "ai-ml-solutions") {
        if (item.subtitle) patch.subtitle = item.subtitle;
        if (item.overview) patch.overview = item.overview;
      }
      if (item.cityHero && typeof item.cityHero === "object") {
        const existingHero =
          existing.cityHero && typeof existing.cityHero === "object"
            ? existing.cityHero
            : {};
        patch.cityHero = {
          ...existingHero,
          ...item.cityHero,
          industries:
            item.cityHero.industries ||
            existingHero.industries || [
              "healthcare",
              "ecommerce-retail",
              "real-estate",
              "hospitality-travel",
            ],
          contactCtaLabel:
            item.cityHero.contactCtaLabel ||
            existingHero.contactCtaLabel ||
            "Contact Us",
        };
      }
      delete patch.hero;
      // Don't re-push giant blocks unless empty (already in DB)
      if (existing.techStackBlock?.categories?.length) delete patch.techStackBlock;
      if (existing.seoPackagesBlock?.packages?.length) delete patch.seoPackagesBlock;
      if (existing.mobileTabsBlock?.tabs?.length) delete patch.mobileTabsBlock;
      if (existing.pageSections && Object.keys(existing.pageSections).length) {
        delete patch.pageSections;
      }
      if (!Object.keys(patch).length) {
        skipped++;
        continue;
      }
      await strapi.documents("api::service.service").update({
        documentId: existing.documentId,
        data: patch,
        status: "published",
      });
      console.log(
        `updated service ${slug}:`,
        Object.keys(patch).slice(0, 14).join(", "),
        Object.keys(patch).length > 14 ? "..." : ""
      );
      updated++;
    } catch (err) {
      console.warn(`FAILED service ${slug}:`, err?.message || err);
    }
  }

  const industriesStatic = (seed.staticPages || []).find((p) => p.slug === "industries");
  if (industriesStatic) {
    try {
      const existing = await strapi.documents("api::static-page.static-page").findFirst({
        filters: { slug: "industries" },
      });
      if (existing) {
        const patch = mergeMissing(existing, industriesStatic);
        // Always refresh listing sections chrome from seed when keys added
        if (industriesStatic.sections) patch.sections = industriesStatic.sections;
        if (industriesStatic.heroHeading) patch.heroHeading = industriesStatic.heroHeading;
        if (industriesStatic.heroBody) patch.heroBody = industriesStatic.heroBody;
        delete patch.heroimage;
        if (Object.keys(patch).length) {
          await strapi.documents("api::static-page.static-page").update({
            documentId: existing.documentId,
            data: patch,
            status: "published",
          });
          console.log("updated static-page industries:", Object.keys(patch).join(", "));
          updated++;
        }
      } else {
        await strapi.documents("api::static-page.static-page").create({
          data: industriesStatic,
          status: "published",
        });
        console.log("created static-page industries");
        updated++;
      }
    } catch (err) {
      console.warn("FAILED static-page industries:", err?.message || err);
    }
  }

  try {
    await strapi.destroy();
  } catch {
    // pool abort on destroy is harmless after successful sync
  }
  console.log(`Done. updated=${updated} skipped=${skipped}`);
  console.log("Refresh Strapi Admin.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
