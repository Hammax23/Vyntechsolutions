/**
 * Upserts industries + services listing chrome into seed.json staticPages,
 * and ensures seed services have icon fields.
 *
 * Run: node cms/scripts/patch-listing-pages.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const seedPath = path.join(root, "cms", "data", "seed.json");

const SERVICE_ICON_BY_SLUG = {
  "web-development": "code",
  "mobile-app-development": "mobile",
  "cloud-solutions": "cloud",
  "ai-ml-solutions": "ai",
  "devops-cicd": "devops",
  "ui-ux-design": "design",
  "ecommerce-solutions": "ecommerce",
  "custom-software-development": "custom",
  "seo-digital-marketing": "marketing",
  "maintenance-support": "support",
  "tax-accounting": "tax",
};

const industriesListingDefaults = {
  heroHeading: "Discover Our Impact Across Industries",
  heroBody:
    "We deliver tailored technology solutions across diverse industries, helping businesses transform their operations, enhance customer experiences, and drive sustainable growth.",
  heroCtaLabel: "Explore Industries",
  gridHeading: "Industries We Serve",
  gridBody:
    "From healthcare to fintech, we bring deep domain expertise and cutting-edge technology to solve your industry's unique challenges.",
  learnMoreLabel: "Learn More",
  stats: [
    { value: "4+", label: "Countries Served" },
    { value: "50+", label: "Projects Delivered" },
    { value: "40+", label: "Happy Clients" },
    { value: "12+", label: "Years Experience" },
  ],
  ctaHeading: "Ready to Transform Your Industry?",
  ctaBody:
    "Let's discuss how our industry expertise and technology solutions can help drive your business forward.",
  ctaLabel: "Let's Talk Business",
  ctaHref: "/lets-talk-business",
};

const servicesListingDefaults = {
  heroEyebrow: "Our Expertise",
  heroHeading: "What We Do",
  heroBody:
    "Comprehensive technology services designed to transform your business. From strategy to execution, we deliver solutions that drive growth.",
  learnMoreLabel: "Learn More",
  whyChooseEyebrow: "Why Choose Us",
  whyChooseHeading: "Your Success Is Our Priority",
  whyChooseBody:
    "We don't just build technology, we build partnerships. Our team of experts works closely with you to understand your challenges and deliver solutions that exceed expectations.",
  whyChooseItems: [
    {
      title: "Expert Team",
      description: "A focused team across web, mobile, and cloud",
    },
    {
      title: "Proven Track Record",
      description: "50+ successful projects delivered",
    },
    {
      title: "Agile Approach",
      description: "Flexible methodologies adapted to your needs",
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock assistance for your peace of mind",
    },
  ],
  stats: [
    { value: "12+", label: "Years Experience" },
    { value: "50+", label: "Projects Delivered" },
    { value: "4+", label: "Countries Served" },
    { value: "40+", label: "Happy Clients" },
  ],
  secondaryCtaLabel: "Get in Touch",
  ctaHeading: "Ready to Transform Your Business?",
  ctaBody:
    "Let's discuss how our services can help you achieve your goals and drive real results.",
  ctaLabel: "Get in Touch",
  ctaHref: "/lets-talk-business",
};

function upsertStaticPage(seed, page) {
  seed.staticPages = seed.staticPages || [];
  const idx = seed.staticPages.findIndex((p) => p.slug === page.slug);
  if (idx >= 0) {
    const existing = seed.staticPages[idx];
    seed.staticPages[idx] = {
      ...existing,
      ...page,
      sections: {
        ...(existing.sections || {}),
        ...(page.sections || {}),
      },
    };
    return "updated";
  }
  seed.staticPages.push(page);
  return "created";
}

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));

const industriesResult = upsertStaticPage(seed, {
  title: "Industries",
  slug: "industries",
  heroHeading: industriesListingDefaults.heroHeading,
  heroBody: industriesListingDefaults.heroBody,
  sections: {
    heroCtaLabel: industriesListingDefaults.heroCtaLabel,
    gridHeading: industriesListingDefaults.gridHeading,
    gridBody: industriesListingDefaults.gridBody,
    learnMoreLabel: industriesListingDefaults.learnMoreLabel,
    stats: industriesListingDefaults.stats,
    ctaHeading: industriesListingDefaults.ctaHeading,
    ctaBody: industriesListingDefaults.ctaBody,
    ctaLabel: industriesListingDefaults.ctaLabel,
    ctaHref: industriesListingDefaults.ctaHref,
  },
});

const servicesResult = upsertStaticPage(seed, {
  title: "Services",
  slug: "services",
  heroHeading: servicesListingDefaults.heroHeading,
  heroBody: servicesListingDefaults.heroBody,
  sections: {
    heroEyebrow: servicesListingDefaults.heroEyebrow,
    learnMoreLabel: servicesListingDefaults.learnMoreLabel,
    whyChooseEyebrow: servicesListingDefaults.whyChooseEyebrow,
    whyChooseHeading: servicesListingDefaults.whyChooseHeading,
    whyChooseBody: servicesListingDefaults.whyChooseBody,
    whyChooseItems: servicesListingDefaults.whyChooseItems,
    stats: servicesListingDefaults.stats,
    secondaryCtaLabel: servicesListingDefaults.secondaryCtaLabel,
    ctaHeading: servicesListingDefaults.ctaHeading,
    ctaBody: servicesListingDefaults.ctaBody,
    ctaLabel: servicesListingDefaults.ctaLabel,
    ctaHref: servicesListingDefaults.ctaHref,
  },
});

let iconsPatched = 0;
for (const service of seed.services || []) {
  const slug = service.slug;
  const icon = SERVICE_ICON_BY_SLUG[slug];
  if (!icon) continue;
  if (service.icon !== icon) {
    service.icon = icon;
    iconsPatched += 1;
  }
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");

console.log(`staticPages industries: ${industriesResult}`);
console.log(`staticPages services: ${servicesResult}`);
console.log(`services icons patched: ${iconsPatched}`);
