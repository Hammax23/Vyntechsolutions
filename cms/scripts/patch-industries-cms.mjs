/**
 * Patches cms/data/seed.json industries + footer nav hrefs with CMS marketing fields.
 * Run: node cms/scripts/patch-industries-cms.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const seedPath = path.join(root, "cms", "data", "seed.json");

const WHY_CARDS = [
  { icon: "chart", label: "Result Driven\nApproach" },
  { icon: "desktop", label: "Digital First\nStrategies" },
  { icon: "users", label: "Team of Experienced\nProfessionals" },
  { icon: "clock", label: "On Time Delivery" },
  { icon: "check", label: "No False\nCommitments" },
  { icon: "building", label: "Industry Standard\nQuality" },
];

const SHARED = {
  solutionsEyebrow: "What We Deliver",
  challengesHeading: "Industry Challenges",
  technologiesHeading: "Technologies We Use",
  heroCtaLabel: "Build Your Project Now",
  whyChooseUsHeading: "Why choose us",
  whyChooseUsIntro:
    "As you know, digital solutions are the core concept of online businesses today. Either driving qualified traffic or building scalable software, digital strategy is essential for your enterprise to grow revenue and stay competitive. VynTech Solutions is a premier web design and software development agency delivering reliable, high-performance services.",
  whyChooseUsSubHeading: "Imaginations into creativity",
  whyChooseUsSubText:
    "As a dedicated software and web development company, we have worked on websites and web applications with incredible clients for diverse industries. It has enabled us to stretch our imaginations into a new realm of creativity and apply technical skills to enhance user experience. Finally, it has resulted in delivering perfect, bespoke solutions that aptly represent the goals of our clients.",
  whyChooseUsCards: WHY_CARDS,
  ctaHeading: "Ready To Get Started?",
  ctaButtonLabel: "Transform Your Digital Presence",
};

const BY_SLUG = {
  healthcare: {
    icon: "healthcare",
    cardImage:
      "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=1600&q=80",
    highlights: ["Patient Portals", "Telemedicine", "HIPAA Compliance", "Healthcare Analytics"],
    ctaBody: "Let's discuss how our healthcare services can help transform your business.",
  },
  "finance-banking": {
    icon: "finance",
    cardImage:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    highlights: ["Digital Banking", "Payment Solutions", "Risk Management", "Regulatory Compliance"],
    ctaBody: "Let's discuss how our finance services can help transform your business.",
  },
  "ecommerce-retail": {
    icon: "ecommerce",
    cardImage:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
    highlights: ["Online Stores", "Inventory Management", "POS Systems", "Customer Analytics"],
    ctaBody: "Let's discuss how our e-commerce services can help transform your business.",
  },
  education: {
    icon: "education",
    cardImage:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80",
    highlights: ["LMS Platforms", "Virtual Classrooms", "Student Portals", "EdTech Solutions"],
    ctaBody: "Let's discuss how our education services can help transform your business.",
  },
  "real-estate": {
    icon: "realestate",
    cardImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    highlights: ["Property Listings", "CRM Solutions", "Virtual Tours", "Transaction Management"],
    ctaBody: "Let's discuss how our real estate services can help transform your business.",
  },
  logistics: {
    icon: "logistics",
    cardImage:
      "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80",
    highlights: ["Fleet Management", "Route Optimization", "Warehouse Systems", "Real-time Tracking"],
    ctaBody: "Let's discuss how our logistics services can help transform your business.",
  },
  "entertainment-media": {
    icon: "entertainment",
    cardImage:
      "https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1600&q=80",
    highlights: ["Streaming Platforms", "Content Management", "Digital Publishing", "Media Analytics"],
    ctaBody: "Let's discuss how our entertainment services can help transform your business.",
  },
  manufacturing: {
    icon: "manufacturing",
    cardImage:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80",
    highlights: ["IoT Integration", "Production Planning", "Quality Control", "Supply Chain"],
    ctaBody: "Let's discuss how our manufacturing services can help transform your business.",
  },
  "hospitality-travel": {
    icon: "hospitality",
    cardImage:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    highlights: ["Booking Systems", "Guest Management", "Revenue Optimization", "Travel Platforms"],
    ctaBody: "Let's discuss how our hospitality services can help transform your business.",
  },
  telecommunications: {
    icon: "telecom",
    cardImage:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80",
    highlights: ["Network Management", "Billing Systems", "Customer Portals", "5G Solutions"],
    ctaBody: "Let's discuss how our telecommunications services can help transform your business.",
  },
};

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
let patched = 0;

for (const industry of seed.industries || []) {
  const slug = industry.slug;
  const meta = BY_SLUG[slug];
  if (!meta) {
    console.warn("No patch map for industry slug:", slug);
    continue;
  }
  Object.assign(industry, SHARED, meta, {
    servicesHeading: industry.subtitle || "Solutions We Deliver",
  });
  patched += 1;
}

const HREF_FIXES = {
  "/industries/education-elearning": "/industries/education",
  "/industries/logistics-transportation": "/industries/logistics",
};

let navFixes = 0;
for (const group of seed.navigation?.footerGroups || []) {
  for (const link of group.links || []) {
    if (HREF_FIXES[link.href]) {
      link.href = HREF_FIXES[link.href];
      navFixes += 1;
    }
  }
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log(`Patched ${patched} industries; fixed ${navFixes} footer hrefs`);
