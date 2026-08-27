/**
 * P1 seed gaps: about/careers sections, organization profile fields,
 * and service delivery* + canadaCities for all services.
 *
 * Run: node cms/scripts/patch-p1-gaps.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const seedPath = path.join(root, "cms", "data", "seed.json");

const CANADA_CITIES = [
  "Toronto",
  "Vancouver",
  "Calgary",
  "Ottawa",
  "Mississauga",
  "Brampton",
  "Edmonton",
  "Hamilton",
];

const DELIVERY_STEPS = [
  {
    title: "Discovery & Product Strategy",
    content:
      "We define product goals, target audience requirements, feature prioritization, system architecture blueprints, and a clear execution roadmap before writing code.",
  },
  {
    title: "UX/UI Design & Prototyping",
    content:
      "Our design team crafts intuitive user journeys, wireframes, high-fidelity UI components, and interactive prototypes tailored for high conversion and seamless interaction.",
  },
  {
    title: "Agile Engineering & QA",
    content:
      "We build scalable frontend and backend systems using agile 2-week sprints, automated unit/integration testing, continuous code reviews, and frequent demo deployments.",
  },
  {
    title: "Cloud Deployment & DevOps",
    content:
      "We establish automated CI/CD pipelines, containerized environments, secure cloud infrastructure, and zero-downtime deployment strategies on AWS, Azure, or GCP.",
  },
  {
    title: "Support, Optimize & Scale",
    content:
      "After launch, we continuously monitor app performance, perform security audits, optimize load times, and ship ongoing feature enhancements to support your business growth.",
  },
];

const TAX_DELIVERY_STEPS = [
  {
    title: "Financial Discovery",
    content:
      "We review your books, filings history, and business structure so recommendations and deadlines match your real situation.",
  },
  {
    title: "Planning & Compliance Map",
    content:
      "We outline tax obligations, filing calendars, and optimization opportunities tailored to Canadian CRA requirements.",
  },
  {
    title: "Accurate Preparation",
    content:
      "Our accountants prepare returns and statements with clear documentation so you know what is being filed and why.",
  },
  {
    title: "Filing & Follow-Through",
    content:
      "We submit on time, track confirmations, and support any CRA questions that come back after filing.",
  },
  {
    title: "Year-Round Support",
    content:
      "Beyond peak season, we help with bookkeeping hygiene, quarterly estimates, and proactive planning for the next year.",
  },
];

function serviceLabel(title, slug) {
  const t = String(title || slug || "Services").replace(/\s+Services$/i, "");
  return t;
}

function ensureCanadaCities(svc) {
  svc.pageSections = svc.pageSections && typeof svc.pageSections === "object" ? svc.pageSections : {};
  if (svc.pageSections.canadaCities?.heading) return;
  const label = serviceLabel(svc.title, svc.slug);
  svc.pageSections.canadaCities = {
    heading: `${label} Services Across Canada`,
    description: `We serve businesses in every major Canadian city. Click your city to learn more about our local ${label.toLowerCase()} services.`,
    cities: [...CANADA_CITIES],
  };
}

function ensureDelivery(svc) {
  if (svc.deliveryHeading && Array.isArray(svc.deliverySteps) && svc.deliverySteps.length) {
    return;
  }
  const label = serviceLabel(svc.title, svc.slug);
  const isTax = svc.slug === "tax-accounting";
  if (isTax) {
    // Accounting-specific delivery (not generic software delivery)
    svc.deliveryHeading =
      svc.deliveryHeading || `How We Deliver ${label} Services`;
    svc.deliveryDescription =
      svc.deliveryDescription ||
      "Tax and accounting work only pays off when filings are accurate, deadlines are met, and advice is clear. At VynTech Solutions, our accounting delivery model is structured, transparent, and built for Canadian businesses.\\n\\nWe work in clear phases so discovery is thorough, preparation is precise, and filings are predictable. Scope, timelines, and support expectations are defined upfront.";
    svc.deliverySteps = svc.deliverySteps?.length ? svc.deliverySteps : TAX_DELIVERY_STEPS;
    svc.deliveryEyebrow = svc.deliveryEyebrow || "Delivery Framework";
    return;
  }
  svc.deliveryHeading =
    svc.deliveryHeading || `How We Deliver ${label} Services`;
  svc.deliveryDescription =
    svc.deliveryDescription ||
    `${label} only pays off when the work is fast, secure, easy to use, and built to scale. At VynTech Solutions, our delivery model is structured, outcome-oriented, and refined across 50+ engagements.\\n\\nWe work in clear phases so discovery is thorough, build quality is high, and launches are predictable. Scope, timelines, architecture, and support are defined upfront, which removes ambiguity and gives stakeholders full visibility from day one.`;
  svc.deliverySteps = svc.deliverySteps?.length ? svc.deliverySteps : DELIVERY_STEPS;
  svc.deliveryEyebrow = svc.deliveryEyebrow || "Delivery Framework";
}

function upsertStaticPage(seed, page) {
  seed.staticPages = seed.staticPages || [];
  const idx = seed.staticPages.findIndex((p) => p.slug === page.slug);
  if (idx >= 0) {
    const existing = seed.staticPages[idx];
    seed.staticPages[idx] = {
      ...existing,
      ...page,
      sections: {
        ...(existing.sections && typeof existing.sections === "object"
          ? existing.sections
          : {}),
        ...(page.sections || {}),
      },
    };
  } else {
    seed.staticPages.push(page);
  }
}

const aboutSectionsExtra = {
  missionEyebrow: "Our Mission",
  heroCtaLabel: "Start a Project",
  missionCtaLabel: "Work With Us",
  missionStats: [
    {
      title: "Web Design & Development",
      label: "50+ custom websites delivered for businesses like yours",
      value: "💻",
    },
    {
      title: "SEO & Digital Marketing",
      label: "300% average traffic growth, real results you can measure",
      value: "📈",
    },
    {
      title: "UI/UX",
      label: "Branding trusted by 40+ businesses",
      value: "🎨",
    },
    {
      title: "AI & ML",
      label: "Automation strategies built to save you hours, every week.",
      value: "🤖",
    },
  ],
  ctaHeading: "Ready to Build Something Extraordinary?",
  ctaBody:
    "Let's discuss your project and explore how we can help you achieve your goals.",
  ctaButtonLabel: "Start Your Project",
  ctaEmail: "info@vyntechsolutions.ca",
};

const careersSections = {
  openingsEyebrow: "Open Positions",
  openingsHeading: "Current Openings",
  emptyHeading: "No open positions right now",
  emptyBody:
    "We don't have any roles open at the moment, but we're always interested in meeting talented people. Drop us your resume and we'll reach out when something comes up.",
  emptyEmail: "careers@vyntechsolutions.ca",
  whyEyebrow: "Why Us",
  whyHeading: "What you get",
  whyCards: [
    {
      title: "Real projects",
      description: "Work on actual client projects, not internal tools nobody uses.",
    },
    {
      title: "Remote-friendly",
      description:
        "Work from home or our office. We care about output, not hours at a desk.",
    },
    {
      title: "No micromanaging",
      description: "We hire adults and treat them like adults. You own your work.",
    },
    {
      title: "Growth",
      description: "Learn new tech, take on bigger projects, and grow your skills.",
    },
  ],
  ctaHeading: "Interested?",
  ctaBody: "Send us your resume. We'll get back to you if there's a fit.",
  ctaLabel: "Get in Touch",
  ctaHref: "mailto:careers@vyntechsolutions.ca",
  applyLabel: "Apply Now",
};

const orgExtras = {
  officeLabel: "Canada (Head Office)",
  copyrightText: "© 2026 VynTech Solutions. All rights reserved.",
  sameAs: [
    "https://linkedin.com",
    "https://facebook.com",
    "https://instagram.com",
    "https://youtube.com",
    "https://x.com",
  ],
  foundingDate: "2014-01-01",
  openingHours: {
    daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "17:00",
    timeZone: "America/Toronto",
  },
};

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));

// Organization profile
seed.organizationProfile = {
  ...(seed.organizationProfile || {}),
  ...orgExtras,
};

// About + careers static pages
const aboutExisting = (seed.staticPages || []).find((p) => p.slug === "about");
upsertStaticPage(seed, {
  title: "About",
  slug: "about",
  heroHeading: aboutExisting?.heroHeading || "We Build Software That Drives Growth",
  heroBody:
    aboutExisting?.heroBody ||
    "VynTech Solutions is a full-service software development company helping businesses transform ideas into powerful digital products.",
  sections: {
    ...(aboutExisting?.sections || {}),
    ...aboutSectionsExtra,
  },
});

upsertStaticPage(seed, {
  title: "Careers",
  slug: "careers",
  heroHeading: "Join Our Team",
  heroBody:
    "We're looking for people who want to build great software and grow with us. If that sounds like you, let's talk.",
  sections: careersSections,
});

// Services delivery + canadaCities
let deliveryPatched = 0;
let canadaPatched = 0;
for (const svc of seed.services || []) {
  const hadDelivery = !!(
    svc.deliveryHeading &&
    Array.isArray(svc.deliverySteps) &&
    svc.deliverySteps.length
  );
  const hadCanada = !!(svc.pageSections && svc.pageSections.canadaCities?.heading);
  ensureDelivery(svc);
  ensureCanadaCities(svc);
  if (!hadDelivery) deliveryPatched += 1;
  if (!hadCanada) canadaPatched += 1;
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log(
  `patch-p1-gaps: org updated; about/careers sections upserted; delivery filled on ${deliveryPatched} services; canadaCities filled on ${canadaPatched} services.`
);
