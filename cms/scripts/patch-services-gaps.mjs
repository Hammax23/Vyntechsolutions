/**
 * Fill empty service fields in seed.json from enriched local servicesData (via JSON export).
 * Run: node cms/scripts/patch-services-gaps.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "..");
const seedPath = path.join(root, "cms", "data", "seed.json");

const DEFAULT_WHY = {
  whyChooseUsHeading: "Why choose us",
  whyChooseUsIntro:
    "As you know, digital solutions are the core concept of online businesses today. Either driving qualified traffic or building scalable software, digital strategy is essential for your enterprise to grow revenue and stay competitive. VynTech Solutions is a premier web design and software development agency delivering reliable, high-performance services.",
  whyChooseUsSubHeading: "Imaginations into creativity",
  whyChooseUsSubText:
    "As a dedicated software and web development company, we have worked on websites and web applications with incredible clients for diverse industries. It has enabled us to stretch our imaginations into a new realm of creativity and apply technical skills to enhance user experience.",
  whyChooseUsCards: [
    { icon: "chart", label: "Result Driven\nApproach" },
    { icon: "desktop", label: "Digital First\nStrategies" },
    { icon: "users", label: "Team of Experienced\nProfessionals" },
    { icon: "clock", label: "On Time Delivery" },
    { icon: "check", label: "No False\nCommitments" },
    { icon: "star", label: "Industry Standard\nQuality" },
  ],
};

const TAX_WHY = {
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

const DEFAULT_FAQS = [
  {
    question: "How long does a typical project take?",
    answer:
      "Timelines depend on scope. Most websites launch in 4–8 weeks; larger apps and platforms are planned in clear milestones so you always know what's next.",
  },
  {
    question: "Do you work with businesses across Canada?",
    answer:
      "Yes. We serve clients nationwide from discovery through launch and ongoing support, with remote collaboration and clear communication.",
  },
  {
    question: "What happens after launch?",
    answer:
      "We offer maintenance, monitoring, and iterative improvements so your product stays fast, secure, and aligned with your goals.",
  },
];

const CHROME = {
  heroCtaLabel: "Get a Free Consultation",
  featuresEyebrow: "What We Offer",
  ctaHeading: "Ready To Get Started?",
  ctaBody: "Let's discuss how our {title} services can help transform your business.",
  ctaButtonLabel: "Transform Your Digital Presence",
  deliveryEyebrow: "Delivery Framework",
  processHeading: "How We Work",
  processDescription:
    "A clear, collaborative process from discovery to launch — so you always know what happens next.",
};

function empty(v) {
  return (
    v === undefined ||
    v === null ||
    v === "" ||
    (Array.isArray(v) && v.length === 0) ||
    (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0)
  );
}

const sectionsPath = path.join(root, "cms", "data", "service-page-sections.json");
const sectionsBundle = fs.existsSync(sectionsPath)
  ? JSON.parse(fs.readFileSync(sectionsPath, "utf8"))
  : {};

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
let patched = 0;

for (const svc of seed.services || []) {
  const slug = svc.slug;
  const why = slug === "tax-accounting" ? TAX_WHY : DEFAULT_WHY;
  const pageSec =
    sectionsBundle.servicePageSectionsBySlug?.[slug] ||
    sectionsBundle[slug] ||
    svc.pageSections;

  const fill = {
    ...CHROME,
    ...why,
    faqs: DEFAULT_FAQS,
    pageSections: pageSec,
    techStack:
      svc.techStack ||
      pageSec?.techStack ||
      sectionsBundle.defaultTechStack,
    showTechStack:
      typeof svc.showTechStack === "boolean"
        ? svc.showTechStack
        : slug !== "tax-accounting" && slug !== "seo-digital-marketing",
  };

  for (const [k, v] of Object.entries(fill)) {
    if (empty(svc[k]) && v !== undefined) {
      svc[k] = v;
      patched++;
    }
  }
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log("Patched empty service fields, assignments:", patched);
