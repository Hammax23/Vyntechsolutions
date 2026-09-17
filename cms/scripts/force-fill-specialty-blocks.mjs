/**
 * Force-write specialty blocks onto the correct services (overwrite Admin empties).
 * Run from cms/: node ./scripts/force-fill-specialty-blocks.mjs
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

/** slug -> which seed keys to force onto that service */
const FORCE_BY_SLUG = {
  "devops-cicd": ["devopsGridBlock"],
  "ecommerce-solutions": ["ecommerceServicesBlock"],
  "ui-ux-design": ["uiuxEngagementsBlock"],
  "custom-software-development": ["customSoftwareServicesBlock", "coreCapabilitiesBlock"],
  "mobile-app-development": ["mobileTabsBlock", "coreCapabilitiesBlock"],
  "cloud-solutions": ["cloudIncludedBlock"],
  "ai-ml-solutions": ["aiMlGridBlock"],
  "seo-digital-marketing": ["seoPackagesBlock", "localSeoBlock"],
};

const POPULATE = {
  devopsGridBlock: { populate: ["items"] },
  ecommerceServicesBlock: { populate: ["items"] },
  uiuxEngagementsBlock: { populate: ["items"] },
  customSoftwareServicesBlock: { populate: ["items"] },
  coreCapabilitiesBlock: { populate: ["items"] },
  mobileTabsBlock: { populate: { tabs: { populate: ["points"] } } },
  cloudIncludedBlock: { populate: ["items"] },
  aiMlGridBlock: { populate: ["items"] },
  seoPackagesBlock: { populate: ["packages"] },
  localSeoBlock: { populate: ["stats"] },
};

function stripMeta(obj) {
  if (Array.isArray(obj)) return obj.map(stripMeta);
  if (!obj || typeof obj !== "object") return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (["id", "documentId", "createdAt", "updatedAt", "publishedAt", "locale"].includes(k)) continue;
    out[k] = stripMeta(v);
  }
  return out;
}

async function main() {
  const seed = JSON.parse(fs.readFileSync(path.join(root, "data", "seed.json"), "utf8"));
  const { createStrapi } = require("@strapi/strapi");
  console.log("Loading Strapi...");
  const strapi = await createStrapi({ distDir: "./dist" }).load();

  let updated = 0;
  for (const item of seed.services || []) {
    const keys = FORCE_BY_SLUG[item.slug];
    if (!keys?.length) continue;

    const existing = await strapi.documents("api::service.service").findFirst({
      filters: { slug: item.slug },
      populate: POPULATE,
    });
    if (!existing) {
      console.warn("missing service", item.slug);
      continue;
    }

    const data = {};
    for (const key of keys) {
      if (!item[key]) {
        console.warn(item.slug, "seed missing", key);
        continue;
      }
      data[key] = stripMeta(item[key]);
    }
    if (!Object.keys(data).length) continue;

    // Wipe then write so Admin "No entry yet" relations refresh
    const wipe = {};
    for (const key of Object.keys(data)) wipe[key] = null;
    await strapi.documents("api::service.service").update({
      documentId: existing.documentId,
      data: wipe,
      status: "published",
    });
    await strapi.documents("api::service.service").update({
      documentId: existing.documentId,
      data,
      status: "published",
    });
    // Keep draft in sync for Content Manager
    await strapi.documents("api::service.service").update({
      documentId: existing.documentId,
      data,
      status: "draft",
    });
    await strapi.documents("api::service.service").publish({
      documentId: existing.documentId,
    });

    console.log("forced", item.slug, Object.keys(data).join(", "));
    updated++;
  }

  await strapi.destroy();
  console.log("Done. services updated:", updated);
  console.log("Hard-refresh Strapi Admin (Ctrl+Shift+R) and open the matching service.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
