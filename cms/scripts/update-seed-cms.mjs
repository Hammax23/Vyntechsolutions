/**
 * One-shot updater for cms/data/seed.json — fills homepage/nav/org/about
 * extras and syncs service process steps from src/data/servicesData.ts
 * when present as JSON-compatible exports.
 *
 * Run: node cms/scripts/update-seed-cms.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const seedPath = path.join(root, "cms", "data", "seed.json");
const servicesDataPath = path.join(root, "src", "data", "servicesData.ts");

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));

seed.globalSeo = {
  ...seed.globalSeo,
  cookieTitle: seed.globalSeo.cookieTitle || "We value your privacy",
  cookieBody:
    seed.globalSeo.cookieBody ||
    'We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.',
  cookieAcceptLabel: seed.globalSeo.cookieAcceptLabel || "Accept All",
  cookieCustomizeLabel: seed.globalSeo.cookieCustomizeLabel || "Customize",
};

seed.homepage = {
  ...seed.homepage,
  heroCtaLabel: seed.homepage.heroCtaLabel || "GET FREE CONSULTATION",
  heroWords: seed.homepage.heroWords || ["Build", "Innovate", "Scale"],
  impactEyebrow: seed.homepage.impactEyebrow || "Proven delivery",
  impactHeading:
    seed.homepage.impactHeading || "Turning technology into\nreal business impact",
  impactBody:
    seed.homepage.impactBody ||
    "We don't just build software we build outcomes. Every project is guided by one question: Does this genuinely move your business forward? That focus is what turns technology into growth, and growth into lasting success.",
  impactCtaLabel: seed.homepage.impactCtaLabel || "About VynTech",
  impactCtaHref: seed.homepage.impactCtaHref || "/about",
  impactStats: seed.homepage.impactStats || [
    { value: "12+", label: "Years of industry experience" },
    { value: "50+", label: "Projects successfully delivered" },
    { value: "4+", label: "Countries served worldwide" },
    { value: "40+", label: "Happy clients & partners" },
  ],
  industriesSubheading: seed.homepage.industriesSubheading || "Industries we serve",
  industriesHeading:
    seed.homepage.industriesHeading || "Transforming Industries, Empowering Growth",
  faqEyebrow: seed.homepage.faqEyebrow || "FAQ",
  faqHeading: seed.homepage.faqHeading || "Frequently asked questions",
  faqIntro:
    seed.homepage.faqIntro ||
    "Answers about how we work, timelines, and delivery. Still stuck? Chat with the team.",
  techStackEyebrow: seed.homepage.techStackEyebrow || "Tech stack",
  techStackHeading: seed.homepage.techStackHeading || "Technology stack",
  techStackBody:
    seed.homepage.techStackBody ||
    "React, Next.js, Node.js, and cloud platforms we use to build websites, mobile apps, and custom software for every business.",
};

seed.navigation = {
  ...seed.navigation,
  footerGroups: seed.navigation.footerGroups || [
    {
      title: "Services",
      links: [
        { label: "Web Development", href: "/services/web-development" },
        { label: "Mobile App Development", href: "/services/mobile-app-development" },
        { label: "Cloud Solutions", href: "/services/cloud-solutions" },
        { label: "AI/ML Solutions", href: "/services/ai-ml-solutions" },
        { label: "DevOps & CI/CD", href: "/services/devops-cicd" },
        { label: "UI/UX Design", href: "/services/ui-ux-design" },
      ],
    },
    {
      title: "Industries",
      links: [
        { label: "Healthcare & Pharmaceuticals", href: "/industries/healthcare" },
        { label: "Finance & Banking", href: "/industries/finance-banking" },
        { label: "Ecommerce & Retail", href: "/industries/ecommerce-retail" },
        { label: "Education & E-learning", href: "/industries/education-elearning" },
        { label: "Real Estate & Property", href: "/industries/real-estate" },
        { label: "Logistics & Transportation", href: "/industries/logistics-transportation" },
        { label: "Entertainment & Media", href: "/industries/entertainment-media" },
        { label: "Manufacturing & Industry", href: "/industries/manufacturing" },
        { label: "Hospitality & Travel", href: "/industries/hospitality-travel" },
        { label: "Telecommunications", href: "/industries/telecommunications" },
      ],
    },
    {
      title: "Solutions",
      links: [
        { label: "Ecommerce Solutions", href: "/services/ecommerce-solutions" },
        { label: "Custom Software Development", href: "/services/custom-software-development" },
        { label: "SEO/Digital Marketing", href: "/services/seo-digital-marketing" },
        { label: "Maintenance & Support", href: "/services/maintenance-support" },
      ],
    },
  ],
};

seed.organizationProfile = {
  ...seed.organizationProfile,
  address:
    seed.organizationProfile.address ||
    "55 Village Centre Pl #200,\nMississauga, ON L4Z 1V9",
  tagline:
    seed.organizationProfile.tagline ||
    "Empowering businesses with innovative technology solutions. We deliver cutting-edge software, robust cloud architectures, and transformative digital experiences that drive growth.",
};

seed.formConfig = {
  ...seed.formConfig,
  timelineOptions: seed.formConfig.timelineOptions || [
    "ASAP",
    "1-3 months",
    "3-6 months",
    "6+ months",
    "Not sure yet",
  ],
};

const about = (seed.staticPages || []).find((p) => p.slug === "about");
if (about) {
  about.heroBody =
    about.heroBody ||
    "VynTech Solutions is a full-service software development company helping businesses across Canada transform bold ideas into powerful, scalable digital products built with precision, speed, and long-term growth in mind.";
  about.sections = {
    ...(about.sections || {}),
    missionHeading:
      about.sections?.missionHeading ||
      "Empowering Your Business Through Innovative Technology",
    missionBody:
      about.sections?.missionBody ||
      "You deserve more than just a service provider you deserve a partner invested in your success. At VynTech Solutions, we bridge the gap between your vision and technical execution, delivering software that's not just functional but transformative for your business.",
    missionBody2:
      about.sections?.missionBody2 ||
      "Whether you're a startup validating your first MVP or an enterprise modernizing legacy systems, we bring the same dedication, expertise, and passion to every project we take on because your growth is our priority.",
    valuesEyebrow: about.sections?.valuesEyebrow || "What Drives Us",
    valuesHeading: about.sections?.valuesHeading || "Our Core Values",
    values: about.sections?.values || [
      {
        title: "Excellence First",
        description:
          "Good enough isn't in our vocabulary. From the first line of code to the final pixel, we sweat the details others skip because your business deserves work we're genuinely proud of.",
      },
      {
        title: "Radical Transparency",
        description:
          "No surprise invoices, no vague timelines, no vanishing acts mid-project. You'll always know exactly where things stand, what's next, and why straight talk, every step of the way.",
      },
      {
        title: "Partnership Mindset",
        description:
          "We're not here to just check boxes and send invoices. When you win, we win. That's why we treat every project like it's our own business on the line.",
      },
      {
        title: "Speed Without Sacrifice",
        description:
          "Fast doesn't have to mean sloppy. We move quickly, stay agile, and still build things that hold up because rushed work today just means rework tomorrow.",
      },
    ],
    processEyebrow: about.sections?.processEyebrow || "Our Process",
    processHeading: about.sections?.processHeading || "How We Bring Ideas to Life",
    processIntro:
      about.sections?.processIntro || "A proven methodology refined over 50+ successful projects.",
    process: about.sections?.process || [
      {
        number: "01",
        title: "Discovery & Strategy",
        description:
          "Before we write a single line of code, we get to know your business inside out your goals, your users, your constraints. We align on the vision first, so nothing gets lost in translation later.",
      },
      {
        number: "02",
        title: "Architecture & Design",
        description:
          "We design systems built to grow with you, not just work for today. Every screen, every interaction, and every technical decision is intentional, laying a foundation that's scalable, intuitive, and built to last.",
      },
      {
        number: "03",
        title: "Agile Development",
        description:
          "You'll never be left wondering what's happening behind the scenes. With two-week sprints and live demos, you see real progress, give real feedback, and stay in the loop from the very first build.",
      },
      {
        number: "04",
        title: "Launch & Scale",
        description:
          "Launch day isn't the finish line it's the starting point. We test rigorously, deploy without disruption, and stick around to optimize, support, and scale your product long after it goes live.",
      },
    ],
  };
}

const careers = (seed.staticPages || []).find((p) => p.slug === "careers");
if (careers) {
  careers.heroHeading = careers.heroHeading || "Join Our Team";
  careers.heroBody =
    careers.heroBody ||
    "We're looking for people who want to build great software and grow with us. If that sounds like you, let's talk.";
}

if (!(seed.staticPages || []).some((p) => p.slug === "blog")) {
  seed.staticPages = seed.staticPages || [];
  seed.staticPages.push({
    title: "Blog",
    slug: "blog",
    heroHeading: "Blog",
    heroBody:
      "Practical insights on software development, technology decisions, and building digital products.",
  });
}

// Sync process (+ rich fields) from servicesData.ts text when available
try {
  const src = fs.readFileSync(servicesDataPath, "utf8");
  const slugBlocks = [...src.matchAll(/"([a-z0-9-]+)":\s*\{([\s\S]*?)(?=\n  "[a-z0-9-]+:|\n\};)/g)];
  // Fallback: simpler parse of process arrays per slug
  for (const service of seed.services || []) {
    const slug = service.slug;
    if (!slug) continue;
    const start = src.indexOf(`"${slug}":`);
    if (start < 0) continue;
    const chunk = src.slice(start, start + 8000);
    const processMatch = chunk.match(/"process":\s*(\[[\s\S]*?\])/);
    if (processMatch) {
      try {
        const processJson = processMatch[1]
          .replace(/(\w+):/g, '"$1":')
          .replace(/'/g, '"');
        // servicesData uses JSON-like already with double quotes
        const parsed = JSON.parse(processMatch[1]);
        if (Array.isArray(parsed) && parsed.length) service.process = parsed;
      } catch {
        // keep seed process
      }
    }
    const ph = chunk.match(/"processHeading":\s*"([^"]+)"/);
    if (ph) service.processHeading = ph[1];
  }
  void slugBlocks;
} catch (err) {
  console.warn("Could not sync process from servicesData.ts:", err.message);
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log("Updated", seedPath);
