/**
 * Fill new CMS-editable hero fields on all services (heroBadgeLabel).
 * Does not touch media (upload those in Admin).
 *
 * Usage (from cms/):
 *   node ./scripts/patch-service-hero-cms-fields.mjs
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

async function main() {
  const { createStrapi } = require("@strapi/strapi");
  console.log("Loading Strapi (no HTTP listen)...");
  const strapi = await createStrapi({ distDir: "./dist" }).load();

  const list = await strapi.documents("api::service.service").findMany({
    status: "published",
    pagination: { pageSize: 100 },
  });

  let updated = 0;
  for (const svc of list || []) {
    const slug = svc.slug;
    if (!slug) continue;
    const patch = {};
    if (!svc.heroBadgeLabel) {
      patch.heroBadgeLabel = svc.title || slug;
    }
    if (!Object.keys(patch).length) continue;
    await strapi.documents("api::service.service").update({
      documentId: svc.documentId,
      data: patch,
      status: "published",
    });
    console.log(`updated ${slug}:`, Object.keys(patch).join(", "));
    updated += 1;
  }

  console.log(`Done. Updated ${updated} services.`);
  await strapi.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
