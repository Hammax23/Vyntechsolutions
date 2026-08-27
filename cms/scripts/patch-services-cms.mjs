/**
 * Merges pageSections, techStack, chrome fields, heroVariant, showTechStack
 * (and tax whyChooseUs) into cms/data/seed.json services[].
 *
 * Prerequisites:
 *   cms/data/service-page-sections.json  (from servicePageSections.ts)
 *
 * Generate JSON first if missing:
 *   npx tsx -e "import { writeFileSync } from 'fs'; import { servicePageSectionsBySlug, defaultServiceChrome, defaultTechStack } from './src/data/servicePageSections.ts'; writeFileSync('./cms/data/service-page-sections.json', JSON.stringify({ servicePageSectionsBySlug, defaultServiceChrome, defaultTechStack }, null, 2))"
 *
 * Run: node cms/scripts/patch-services-cms.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const seedPath = path.join(root, "cms", "data", "seed.json");
const sectionsPath = path.join(root, "cms", "data", "service-page-sections.json");

if (!fs.existsSync(sectionsPath)) {
  console.error("Missing", sectionsPath);
  console.error("Generate it with npx tsx from src/data/servicePageSections.ts first.");
  process.exit(1);
}

const {
  servicePageSectionsBySlug,
  defaultServiceChrome,
  defaultTechStack,
} = JSON.parse(fs.readFileSync(sectionsPath, "utf8"));

const HERO_VARIANT_BY_SLUG = {
  "web-development": "browser",
  "mobile-app-development": "mobile",
  "cloud-solutions": "cloud",
  "devops-cicd": "devops",
  "ai-ml-solutions": "aiml",
  "ui-ux-design": "uiux",
  "ecommerce-solutions": "ecommerce",
  "custom-software-development": "custom",
  "seo-digital-marketing": "seo",
  "maintenance-support": "maintenance",
  "tax-accounting": "tax",
};

const DEFAULT_OVERVIEW_TAGLINE =
  "We focus on understanding your business goals first, then build solutions that actually solve problems, not just look good on paper. Every project gets dedicated attention, clear communication, and a team that takes ownership of delivering results on time.";

const TAX_WHY_CHOOSE = {
  whyChooseUsHeading: "Why choose us",
  whyChooseUsIntro:
    "Managing taxes and accounting isn't just about numbers, it's about making confident financial decisions. At VynTech Solutions, our certified accounting professionals provide accurate, transparent, and deadline-driven financial services tailored for Canadian businesses of every size.",
  whyChooseUsSubHeading: "Precision you can trust",
  whyChooseUsSubText:
    "From personal income tax to corporate filings and CRA compliance, we handle the complexity so you can focus on growing your business. Every engagement is backed by transparency, accuracy, and proactive year-round support.",
  whyChooseUsCards: [
    { icon: "shield", label: "CRA Compliant\nFilings" },
    { icon: "users", label: "Certified\nAccountants" },
    { icon: "clock", label: "On-Time\nDeadlines" },
    { icon: "trend", label: "Maximum Tax\nSavings" },
    { icon: "chart", label: "Transparent\nPricing" },
    { icon: "check", label: "Year-Round\nSupport" },
  ],
};

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
let patched = 0;

for (const service of seed.services || []) {
  const slug = service.slug;
  if (!slug) continue;

  const pageSections = servicePageSectionsBySlug[slug] || service.pageSections || {};
  const showTechStack =
    slug !== "tax-accounting" && slug !== "seo-digital-marketing";

  Object.assign(service, {
    heroVariant: HERO_VARIANT_BY_SLUG[slug] || "browser",
    heroCtaLabel: defaultServiceChrome.heroCtaLabel,
    featuresEyebrow: defaultServiceChrome.featuresEyebrow,
    ctaHeading: defaultServiceChrome.ctaHeading,
    ctaBody: defaultServiceChrome.ctaBody,
    ctaButtonLabel: defaultServiceChrome.ctaButtonLabel,
    deliveryEyebrow: defaultServiceChrome.deliveryEyebrow,
    overviewTagline: service.overviewTagline || DEFAULT_OVERVIEW_TAGLINE,
    showTechStack,
    pageSections,
    techStack: pageSections.techStack || (showTechStack ? defaultTechStack : undefined),
    canadaCities: pageSections.canadaCities || service.canadaCities,
  });

  if (slug === "tax-accounting") {
    Object.assign(service, TAX_WHY_CHOOSE);
  }

  // Drop undefined keys so seed stays clean
  for (const key of Object.keys(service)) {
    if (service[key] === undefined) delete service[key];
  }

  patched += 1;
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log(`Patched ${patched} services in seed.json with CMS page sections + chrome fields`);
