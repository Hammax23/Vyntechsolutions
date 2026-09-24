/**
 * Clear canadaCitiesBlock on Strapi services except web-development + seo-digital-marketing.
 * Run from cms/: node ./scripts/clear-canada-cities-other-services.mjs
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

const ALLOW = new Set(["web-development", "seo-digital-marketing"]);

async function main() {
  const { createStrapi } = require("@strapi/strapi");
  console.log("Loading Strapi...");
  const strapi = await createStrapi({ distDir: "./dist" }).load();

  const list = await strapi.documents("api::service.service").findMany({
    limit: 100,
  });
  let cleared = 0;
  for (const row of list || []) {
    if (ALLOW.has(row.slug)) continue;
    await strapi.documents("api::service.service").update({
      documentId: row.documentId,
      data: {
        canadaCitiesBlock: null,
        canadaCities: null,
      },
      status: "published",
    });
    console.log("cleared", row.slug);
    cleared++;
  }

  try {
    await strapi.destroy();
  } catch {
    /* ignore */
  }
  console.log("Done. cleared", cleared);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
