/**
 * Fill EVERY specialty block on EVERY service so Admin never shows "No entry yet".
 * Frontend must slug-gate which blocks render.
 * Run from cms/: node ./scripts/fill-all-service-specialty-blocks.mjs
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

const BLOCK_KEYS = [
  "devopsGridBlock",
  "ecommerceServicesBlock",
  "uiuxEngagementsBlock",
  "customSoftwareServicesBlock",
  "coreCapabilitiesBlock",
  "mobileTabsBlock",
  "cloudIncludedBlock",
  "aiMlGridBlock",
  "seoPackagesBlock",
  "localSeoBlock",
];

const OWNER_SLUG = {
  devopsGridBlock: "devops-cicd",
  ecommerceServicesBlock: "ecommerce-solutions",
  uiuxEngagementsBlock: "ui-ux-design",
  customSoftwareServicesBlock: "custom-software-development",
  coreCapabilitiesBlock: "custom-software-development",
  mobileTabsBlock: "mobile-app-development",
  cloudIncludedBlock: "cloud-solutions",
  aiMlGridBlock: "ai-ml-solutions",
  seoPackagesBlock: "seo-digital-marketing",
  localSeoBlock: "seo-digital-marketing",
};

function stripMeta(obj) {
  if (Array.isArray(obj)) return obj.map(stripMeta);
  if (!obj || typeof obj !== "object") return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (["id", "documentId", "createdAt", "updatedAt", "publishedAt", "locale"].includes(k)) {
      continue;
    }
    out[k] = stripMeta(v);
  }
  return out;
}

async function main() {
  const seed = JSON.parse(fs.readFileSync(path.join(root, "data", "seed.json"), "utf8"));
  const bySlug = Object.fromEntries((seed.services || []).map((s) => [s.slug, s]));

  const templates = {};
  for (const key of BLOCK_KEYS) {
    const owner = bySlug[OWNER_SLUG[key]];
    if (!owner?.[key]) {
      console.warn("missing template", key, "from", OWNER_SLUG[key]);
      continue;
    }
    templates[key] = stripMeta(owner[key]);
    // Prefer mobile core capabilities for the mobile-owned template when filling all;
    // custom-software keeps its own via per-slug override below.
  }
  // Mobile-specific core capabilities template
  const mobileCore = bySlug["mobile-app-development"]?.coreCapabilitiesBlock;
  const customCore = bySlug["custom-software-development"]?.coreCapabilitiesBlock;

  const { createStrapi } = require("@strapi/strapi");
  console.log("Loading Strapi...");
  const strapi = await createStrapi({ distDir: "./dist" }).load();

  let updated = 0;
  for (const item of seed.services || []) {
    const existing = await strapi.documents("api::service.service").findFirst({
      filters: { slug: item.slug },
    });
    if (!existing) {
      console.warn("missing", item.slug);
      continue;
    }

    const data = { ...templates };
    if (item.slug === "mobile-app-development" && mobileCore) {
      data.coreCapabilitiesBlock = stripMeta(mobileCore);
    } else if (item.slug === "custom-software-development" && customCore) {
      data.coreCapabilitiesBlock = stripMeta(customCore);
    }
    // Prefer each service's own seed block when present
    for (const key of BLOCK_KEYS) {
      if (item[key]) data[key] = stripMeta(item[key]);
    }

    await strapi.documents("api::service.service").update({
      documentId: existing.documentId,
      data,
      status: "draft",
    });
    await strapi.documents("api::service.service").publish({
      documentId: existing.documentId,
    });
    console.log("filled all specialty blocks:", item.slug);
    updated++;
  }

  try {
    await strapi.destroy();
  } catch {
    /* pool timeout on shutdown is ok */
  }
  console.log("Done. services:", updated);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
