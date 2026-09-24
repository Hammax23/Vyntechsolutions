/**
 * Keep canadaCitiesBlock only on web-development + seo-digital-marketing.
 * Clears the block on every other service in seed.json.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(root, "cms/data/seed.json");
const ALLOW = new Set(["web-development", "seo-digital-marketing"]);

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
let cleared = 0;
for (const s of seed.services || []) {
  if (ALLOW.has(s.slug)) continue;
  let changed = false;
  if (s.canadaCitiesBlock) {
    delete s.canadaCitiesBlock;
    changed = true;
  }
  if (s.canadaCities) {
    delete s.canadaCities;
    changed = true;
  }
  if (s.pageSections?.canadaCities) {
    delete s.pageSections.canadaCities;
    changed = true;
  }
  if (changed) cleared++;
}
fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log("cleared canada cities from", cleared, "services; kept", [...ALLOW].join(", "));
