/**
 * Fix industry section fields in seed.json + industriesData.ts
 * - servicesHeading → "Solutions We Deliver" (was wrongly copied from subtitle)
 * - heroImageUrl → cardImage (hero section needs image URL)
 * - static-page industries → notFound chrome keys
 *
 * Run: node cms/scripts/fix-industry-sections.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const seedPath = path.join(root, "cms", "data", "seed.json");
const dataPath = path.join(root, "src", "data", "industriesData.ts");

const SERVICES_HEADING = "Solutions We Deliver";

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
let n = 0;
for (const industry of seed.industries || []) {
  industry.servicesHeading = SERVICES_HEADING;
  if (industry.cardImage && !industry.heroImageUrl) {
    industry.heroImageUrl = industry.cardImage;
  }
  n++;
}

const industriesPage = (seed.staticPages || []).find((p) => p.slug === "industries");
if (industriesPage) {
  industriesPage.sections = {
    ...(industriesPage.sections || {}),
    notFoundHeading: "Industry Not Found",
    notFoundLinkLabel: "View All Industries",
  };
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log(`Seed: fixed ${n} industries + industries static-page notFound`);

let ts = fs.readFileSync(dataPath, "utf8");
// Replace every servicesHeading that equals the preceding subtitle pattern by setting a constant
ts = ts.replace(
  /servicesHeading:\s*"[^"]*"/g,
  `servicesHeading: "${SERVICES_HEADING}"`
);
// Ensure heroImage is present after cardImage lines when missing
ts = ts.replace(
  /(cardImage:\s*"([^"]+)",)\n(?!\s*heroImage:)/g,
  `$1\n    heroImage: "$2",\n`
);
fs.writeFileSync(dataPath, ts);
console.log("Updated src/data/industriesData.ts");
