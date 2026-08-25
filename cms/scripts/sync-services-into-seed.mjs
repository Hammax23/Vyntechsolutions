/**
 * Copies CMS-facing fields from src/data/servicesData.ts into cms/data/seed.json services.
 * Run: node cms/scripts/sync-services-into-seed.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const seedPath = path.join(root, "cms", "data", "seed.json");
const tsPath = path.join(root, "src", "data", "servicesData.ts");

const src = fs.readFileSync(tsPath, "utf8");
const marker = "export const servicesData";
const idx = src.indexOf(marker);
if (idx < 0) throw new Error("servicesData export not found");
let body = src.slice(idx);
body = body.replace(/^export const servicesData[^=]*=\s*/, "");
body = body.replace(/;\s*$/, "");
// Evaluate as expression
const data = Function(`"use strict"; return (${body})`)();

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const keys = [
  "title",
  "subtitle",
  "description",
  "heroImage",
  "overview",
  "overviewTagline",
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
  "deliveryHeading",
  "deliveryDescription",
  "deliverySteps",
  "faqs",
];

let synced = 0;
for (const service of seed.services || []) {
  const local = data[service.slug];
  if (!local) continue;
  for (const key of keys) {
    if (local[key] !== undefined) service[key] = local[key];
  }
  synced += 1;
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log("Synced", synced, "services into seed.json");
