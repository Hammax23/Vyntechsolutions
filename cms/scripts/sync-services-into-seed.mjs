/**
 * Copies CMS-facing fields from src/data/servicesData.ts into cms/data/seed.json services.
 * Run: npx tsx cms/scripts/sync-services-into-seed.mjs
 * (or: node --import tsx cms/scripts/sync-services-into-seed.mjs)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const seedPath = path.join(root, "cms", "data", "seed.json");
const servicesModule = path.join(root, "src", "data", "servicesData.ts");

const { servicesData } = await import(pathToFileURL(servicesModule).href);

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const keys = [
  "title",
  "subtitle",
  "description",
  "icon",
  "cardImage",
  "heroImage",
  "heroVariant",
  "heroCtaLabel",
  "overview",
  "overviewTagline",
  "featuresEyebrow",
  "features",
  "technologies",
  "process",
  "processHeading",
  "processDescription",
  "stats",
  "caseStudies",
  "whyChooseUsHeading",
  "whyChooseUsIntro",
  "whyChooseUsSubHeading",
  "whyChooseUsSubText",
  "whyChooseUsCards",
  "deliveryEyebrow",
  "deliveryHeading",
  "deliveryDescription",
  "deliverySteps",
  "faqs",
  "ctaHeading",
  "ctaBody",
  "ctaButtonLabel",
  "showTechStack",
  "techStack",
  "pageSections",
  "canadaCities",
];

let synced = 0;
for (const service of seed.services || []) {
  const local = servicesData[service.slug];
  if (!local) continue;
  for (const key of keys) {
    if (local[key] !== undefined) service[key] = local[key];
  }
  synced += 1;
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log("Synced", synced, "services into seed.json");
