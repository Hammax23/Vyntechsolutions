/**
 * Generates cms/data/seed.json from Next.js fallback content.
 * Run from repo root: node cms/scripts/generate-seed.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

async function loadTsModule(rel) {
  // dynamic import of TS via Node may fail; prefer evaluating exported JS-like by reading after extract
  const url = pathToFileURL(path.join(root, rel)).href;
  return import(url);
}

const { blogPosts } = await loadTsModule("src/data/blogData.ts");
const { servicesData } = await loadTsModule("src/data/servicesData.ts");
const { industriesData } = await loadTsModule("src/data/industriesData.ts");

const faqs = [
  {
    question: "What services does VynTech Solutions offer?",
    answer:
      "VynTech Solutions offers comprehensive digital services including custom web development, mobile app development (iOS & Android), UI/UX design, cloud solutions, AI/ML development, e-commerce solutions, and enterprise software development. We serve businesses across Canada including Toronto, Vancouver, and Montreal.",
    order: 1,
    page: "global",
  },
  {
    question: "How much does web development cost in Canada?",
    answer:
      "Web development costs vary based on project complexity. Simple websites start from $5,000 CAD, while custom web applications range from $15,000 to $100,000+ CAD. Contact VynTech Solutions for a free consultation and accurate quote for your specific requirements.",
    order: 2,
    page: "global",
  },
  {
    question: "How long does it take to build a website?",
    answer:
      "Timeline depends on project scope. A simple website takes 2-4 weeks, while complex web applications may take 3-6 months. We follow agile methodologies with regular updates and transparent communication throughout the development process.",
    order: 3,
    page: "global",
  },
  {
    question: "Do you work with startups and enterprises?",
    answer:
      "Yes! VynTech Solutions works with businesses of all sizes - from early-stage startups launching their first MVP to established enterprises modernizing their digital infrastructure. We tailor our approach to match your business needs and budget.",
    order: 4,
    page: "global",
  },
  {
    question: "What technologies do you use?",
    answer:
      "We use modern, scalable technologies including React, Next.js, Node.js, Python, TypeScript, PostgreSQL, MongoDB, AWS, Azure, Google Cloud, React Native, Flutter, and more. We choose the best tech stack based on your project requirements.",
    order: 5,
    page: "global",
  },
];

const categories = [...new Set(blogPosts.map((p) => p.category))];

const seed = {
  globalSeo: {
    siteName: "VynTech Solutions",
    siteUrl: "https://vyntechsolutions.ca",
    defaultTitle: "VynTech Solutions | Building Digital Excellence for Canadian Businesses",
    titleTemplate: "%s | VynTech Solutions - Canadian Digital Agency",
    defaultDescription:
      "VynTech Solutions is Canada's leading digital agency specializing in custom web development, mobile apps, UI/UX design, and enterprise software solutions. Serving businesses across Toronto, Vancouver, Montreal & nationwide.",
    phone: "+1-416-893-5779",
    email: "info@vyntechsolutions.ca",
    locale: "en_CA",
  },
  pageSeos: [
    { path: "/", h1: "VynTech Solutions", seo: { metaTitle: "VynTech Solutions | Building Digital Excellence for Canadian Businesses", metaDescription: "Canada's leading digital agency.", indexable: true } },
    { path: "/blog", h1: "Blog", seo: { metaTitle: "Blog", metaDescription: "Practical insights on software development.", indexable: true } },
    { path: "/services", h1: "Services", seo: { metaTitle: "Our Services", metaDescription: "Web, mobile, cloud, AI and more.", indexable: true } },
    { path: "/industries", h1: "Industries", seo: { metaTitle: "Industries", metaDescription: "Industry digital solutions.", indexable: true } },
    { path: "/about", h1: "About", seo: { metaTitle: "About Us", metaDescription: "About VynTech Solutions.", indexable: true } },
  ],
  faqs,
  categories: categories.map((name) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
  })),
  blogPosts: blogPosts.map((p, i) => ({
    title: p.title,
    slug: p.slug,
    metaDescription: p.metaDescription,
    excerpt: p.excerpt,
    content: p.content,
    tags: p.tags,
    author: p.author,
    readTime: p.readTime,
    image: p.image,
    featured: i === 0,
    categoryName: p.category,
    seo: {
      metaTitle: p.title,
      metaDescription: p.metaDescription,
      indexable: true,
    },
  })),
  services: Object.entries(servicesData).map(([slug, s], order) => ({
    ...s,
    slug,
    order,
    seo: {
      metaTitle: `${s.title} | VynTech Solutions`,
      metaDescription: s.description,
      indexable: true,
    },
  })),
  industries: Object.entries(industriesData).map(([slug, ind], order) => ({
    ...ind,
    slug,
    order,
    seo: {
      metaTitle: `${ind.title} | VynTech Solutions`,
      metaDescription: ind.description,
      indexable: true,
    },
  })),
  homepage: {
    servicesHeading: "Our Services",
    servicesSubheading: "Transforming Modern Businesses",
    servicesBody: "Through Innovation, Technology, and Scalable Digital Solutions",
    impactHeading: "Technology That Makes an Impact",
    partnersHeading: "Technology Partners",
    insightsHeading: "Featured Insights",
    industriesHeading: "Industries We Serve",
  },
  navigation: {
    primaryLinks: [
      { label: "Blog", href: "/blog", order: 1 },
      { label: "About", href: "/about", order: 2 },
      { label: "Careers", href: "/careers", order: 3 },
    ],
    legalLinks: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
    ],
  },
  promos: [
    {
      name: "SEO Packages Bar",
      slot: "announcement-bar",
      heading: "SEO Packages",
      body: "From $799/mo",
      ctaLabel: "Learn more",
      ctaHref: "/services/seo-digital-marketing",
      active: true,
      priority: 10,
    },
    {
      name: "Google Ranking Promo",
      slot: "google-ranking",
      heading: "Get your Website",
      body: "Google RANKING",
      ctaLabel: "Boost with SEO",
      ctaHref: "/services/seo-digital-marketing",
      active: true,
      priority: 5,
    },
    {
      name: "Timed CTA Popup",
      slot: "timed-cta",
      heading: "Share Your Requirements",
      body: "to help our experts understand your business objectives and create your customized plan.",
      ctaLabel: "Submit",
      ctaHref: "/lets-talk-business",
      active: true,
      priority: 5,
    },
  ],
  formConfig: {
    services: Object.keys(servicesData),
    regions: ["Ontario", "British Columbia", "Quebec", "Alberta", "Other Canada", "International"],
    hearAbout: ["Google", "Referral", "LinkedIn", "Other"],
  },
  organizationProfile: {
    name: "VynTech Solutions",
    phone: "+1-416-893-5779",
    email: "info@vyntechsolutions.ca",
    geoLatitude: "43.6532",
    geoLongitude: "-79.3832",
    ratingValue: 4.9,
    reviewCount: 50,
  },
  staticPages: [
    {
      title: "About",
      slug: "about",
      heroHeading: "About VynTech Solutions",
      heroBody: "Building digital excellence for Canadian businesses.",
    },
    {
      title: "Careers",
      slug: "careers",
      heroHeading: "Careers",
      heroBody: "Join the VynTech Solutions team.",
    },
  ],
  legalPages: [
    {
      title: "Privacy Policy",
      slug: "privacy-policy",
      lastUpdated: "2026-01-01",
      body: "See live Privacy Policy page. Update this content in Strapi.",
    },
    {
      title: "Terms and Conditions",
      slug: "terms-and-conditions",
      lastUpdated: "2026-01-01",
      body: "See live Terms page. Update this content in Strapi.",
    },
  ],
};

const out = path.join(__dirname, "../data/seed.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(seed, null, 2));
console.log("Wrote", out);
