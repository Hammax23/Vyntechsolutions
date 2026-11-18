/**
 * Seed custom-software heroGraphicItems presets into Strapi.
 * Usage (from cms/): node ./scripts/patch-hero-graphic-presets.mjs
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

const ITEMS = [
  { preset: "browser", label: "Web UI" },
  { preset: "gear", label: "Automation" },
  { preset: "robot", label: "AI Assist" },
  { preset: "laptop", label: "Apps" },
  { preset: "document", label: "Workflows" },
  { preset: "monitor", label: "Dashboards" },
];

async function main() {
  const { createStrapi } = require("@strapi/strapi");
  console.log("Loading Strapi...");
  const strapi = await createStrapi({ distDir: "./dist" }).load();

  const existing = await strapi.documents("api::service.service").findFirst({
    filters: { slug: "custom-software-development" },
    status: "published",
    populate: { heroGraphicItems: { populate: ["image"] } },
  });
  if (!existing) {
    console.error("custom-software-development not found");
    await strapi.destroy();
    process.exit(1);
  }

  const hasItems = Array.isArray(existing.heroGraphicItems) && existing.heroGraphicItems.length > 0;
  if (hasItems) {
    console.log("heroGraphicItems already set:", existing.heroGraphicItems.length);
  } else {
    await strapi.documents("api::service.service").update({
      documentId: existing.documentId,
      data: { heroGraphicItems: ITEMS },
      status: "published",
    });
    console.log("Seeded heroGraphicItems:", ITEMS.length);
  }

  await strapi.destroy();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
