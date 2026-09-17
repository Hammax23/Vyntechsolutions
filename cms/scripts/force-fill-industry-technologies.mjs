/**
 * Force technologies (+ chrome headings if empty) from seed onto Strapi industries.
 * Run from cms/: node ./scripts/force-fill-industry-technologies.mjs
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
  const seed = JSON.parse(fs.readFileSync(path.join(root, "data", "seed.json"), "utf8"));
  const { createStrapi } = require("@strapi/strapi");
  console.log("Loading Strapi...");
  const strapi = await createStrapi({ distDir: "./dist" }).load();

  let updated = 0;
  for (const item of seed.industries || []) {
    if (!item.slug || !Array.isArray(item.technologies) || !item.technologies.length) {
      console.warn("skip", item.slug, "- no technologies in seed");
      continue;
    }
    const existing = await strapi.documents("api::industry.industry").findFirst({
      filters: { slug: item.slug },
    });
    if (!existing) {
      console.warn("missing industry", item.slug);
      continue;
    }

    const data = {
      technologies: item.technologies,
      technologiesHeading: item.technologiesHeading || existing.technologiesHeading || "Technologies We Use",
      solutionsEyebrow: item.solutionsEyebrow || existing.solutionsEyebrow,
      challengesHeading: item.challengesHeading || existing.challengesHeading,
      servicesHeading: item.servicesHeading || existing.servicesHeading,
      highlights: Array.isArray(item.highlights) && item.highlights.length ? item.highlights : existing.highlights,
    };

    await strapi.documents("api::industry.industry").update({
      documentId: existing.documentId,
      data,
      status: "draft",
    });
    await strapi.documents("api::industry.industry").publish({
      documentId: existing.documentId,
    });
    console.log("filled technologies:", item.slug, item.technologies.length);
    updated++;
  }

  try {
    await strapi.destroy();
  } catch {
    /* ignore pool timeout on shutdown */
  }
  console.log("Done. industries:", updated);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
