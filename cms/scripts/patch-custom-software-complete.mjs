/**
 * Ensure custom-software-development has every CMS text field filled from seed
 * (heroBadgeLabel, caseStudies, chrome). Media uploads stay Admin-only.
 *
 * Usage (from cms/):
 *   node ./scripts/patch-custom-software-complete.mjs
 */
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

process.chdir(root);

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

function empty(val) {
  if (val === null || val === undefined || val === "") return true;
  if (Array.isArray(val) && val.length === 0) return true;
  return false;
}

const TEXT_KEYS = [
  "heroBadgeLabel",
  "heroCtaLabel",
  "overviewHeading",
  "featuresEyebrow",
  "processHeading",
  "processDescription",
  "caseStudiesHeading",
  "whyChooseUsHeading",
  "whyChooseUsIntro",
  "whyChooseUsSubHeading",
  "whyChooseUsSubText",
  "deliveryEyebrow",
  "deliveryHeading",
  "deliveryDescription",
  "faqEyebrow",
  "faqHeading",
  "faqIntro",
  "ctaHeading",
  "ctaBody",
  "ctaButtonLabel",
];

async function main() {
  const seed = JSON.parse(fs.readFileSync(path.join(root, "data", "seed.json"), "utf8"));
  const seedSvc = (seed.services || []).find((s) => s.slug === "custom-software-development");
  if (!seedSvc) {
    console.error("custom-software-development missing from seed.json");
    process.exit(1);
  }

  const { createStrapi } = require("@strapi/strapi");
  console.log("Loading Strapi (no HTTP listen)...");
  const strapi = await createStrapi({ distDir: "./dist" }).load();

  const existing = await strapi.documents("api::service.service").findFirst({
    filters: { slug: "custom-software-development" },
    status: "published",
    populate: {
      caseStudies: true,
      whyChooseUsCards: true,
      deliverySteps: true,
      faqs: true,
      features: true,
      stats: true,
      process: true,
    },
  });

  if (!existing) {
    console.error("Service not found in Strapi");
    await strapi.destroy();
    process.exit(1);
  }

  const patch = {};
  for (const key of TEXT_KEYS) {
    if (empty(existing[key]) && seedSvc[key] != null && seedSvc[key] !== "") {
      patch[key] = seedSvc[key];
    }
  }
  if (!existing.heroBadgeLabel) {
    patch.heroBadgeLabel = seedSvc.heroBadgeLabel || seedSvc.title || "Custom Software Development";
  }
  if (empty(existing.caseStudies) && Array.isArray(seedSvc.caseStudies) && seedSvc.caseStudies.length) {
    patch.caseStudies = seedSvc.caseStudies.map(({ title, industry, result }) => ({
      title,
      industry,
      result,
    }));
  }
  if (empty(existing.caseStudiesHeading)) {
    patch.caseStudiesHeading = seedSvc.caseStudiesHeading || "Case Studies";
  }

  // Also fill heroBadgeLabel on every other service if empty
  const all = await strapi.documents("api::service.service").findMany({
    status: "published",
    pagination: { pageSize: 100 },
  });
  let others = 0;
  for (const svc of all || []) {
    if (svc.slug === "custom-software-development") continue;
    if (svc.heroBadgeLabel) continue;
    await strapi.documents("api::service.service").update({
      documentId: svc.documentId,
      data: { heroBadgeLabel: svc.title || svc.slug },
      status: "published",
    });
    others += 1;
    console.log(`heroBadgeLabel → ${svc.slug}`);
  }

  if (Object.keys(patch).length) {
    await strapi.documents("api::service.service").update({
      documentId: existing.documentId,
      data: patch,
      status: "published",
    });
    console.log("custom-software-development patched:", Object.keys(patch).join(", "));
  } else {
    console.log("custom-software-development already complete for text fields.");
  }

  console.log(`Done. Other services heroBadgeLabel filled: ${others}`);
  await strapi.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
