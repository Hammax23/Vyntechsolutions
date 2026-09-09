/**
 * Patch service seed: FAQ chrome + cityHero industries / contactCtaLabel.
 * Run: node cms/scripts/fix-service-sections.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const seedPath = path.join(root, "cms", "data", "seed.json");

const FAQ = {
  faqEyebrow: "FAQ",
  faqHeading: "Frequently asked questions",
  faqIntro:
    "Answers about how we work, timelines, and delivery. Still stuck? Chat with the team.",
};

const CITY_INDUSTRIES = [
  "healthcare",
  "ecommerce-retail",
  "real-estate",
  "hospitality-travel",
];

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
let n = 0;

for (const service of seed.services || []) {
  Object.assign(service, FAQ);
  if (service.cityHero && typeof service.cityHero === "object") {
    service.cityHero.industries = CITY_INDUSTRIES;
    service.cityHero.contactCtaLabel =
      service.cityHero.contactCtaLabel || "Contact Us";
  }
  n++;
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log(`Patched ${n} services with FAQ chrome + city industries`);
