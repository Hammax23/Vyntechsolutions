/**
 * Truncate seed SEO metaDescription fields to Strapi's 160-char limit.
 * Run: node cms/scripts/fix-seed-seo.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, "..", "data", "seed.json");
const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));

function trimSeo(obj) {
  if (!obj?.seo?.metaDescription) return;
  const d = String(obj.seo.metaDescription);
  if (d.length > 160) obj.seo.metaDescription = d.slice(0, 157).trimEnd() + "...";
}

trimSeo(seed.homepage);
for (const list of [
  seed.services,
  seed.industries,
  seed.staticPages,
  seed.legalPages,
  seed.blogPosts,
  seed.pageSeos,
]) {
  for (const item of list || []) trimSeo(item);
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log("Trimmed seed SEO metaDescriptions to <=160 chars");
