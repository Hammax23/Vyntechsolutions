/**
 * Unique FAQs per service (never share one generic set across all services).
 * Run: node cms/scripts/patch-service-faqs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "..");
const seedPath = path.join(root, "cms", "data", "seed.json");

/** @type {Record<string, Array<{question: string, answer: string}>>} */
export const SERVICE_FAQS_BY_SLUG = {
  "web-development": [
    {
      question: "How long does a custom website take to build?",
      answer:
        "Most marketing and brochure sites launch in 4–8 weeks. Larger web apps, portals, or multi-language builds are planned in milestones so you always know scope, timeline, and next deliverables.",
    },
    {
      question: "Do you build SEO-ready websites for Canadian businesses?",
      answer:
        "Yes. We structure pages for Core Web Vitals, clean URLs, schema-ready markup, and local SEO signals so your site is ready for Canadian search and Google Business Profile growth.",
    },
    {
      question: "Can you redesign an existing website without losing rankings?",
      answer:
        "We plan migrations carefully: URL mapping, redirects, content parity, and performance checks so redesigns protect equity while improving conversion and speed.",
    },
    {
      question: "What stack do you use for web development?",
      answer:
        "We typically use modern stacks like Next.js, React, Node, and headless CMS options when they fit the project — chosen for performance, maintainability, and your team's long-term needs.",
    },
  ],
  "mobile-app-development": [
    {
      question: "Do you build native iOS, Android, or cross-platform apps?",
      answer:
        "All three. We deliver Swift/SwiftUI and Kotlin/Compose native apps when performance matters most, and React Native when shared code and faster iteration are the priority.",
    },
    {
      question: "How long does a mobile app project usually take?",
      answer:
        "A focused MVP often ships in 8–14 weeks. Complex apps with integrations, offline mode, or multi-role workflows are phased so each release is testable and store-ready.",
    },
    {
      question: "Do you handle App Store and Google Play submission?",
      answer:
        "Yes. We prepare store listings, privacy disclosures, build pipelines, and review compliance so submissions are smooth for Canadian and international releases.",
    },
    {
      question: "Can you integrate our app with CRM, ERP, or payment systems?",
      answer:
        "Absolutely. Secure API integrations with CRM, ERP, payments, and analytics are part of most builds so your app plugs into existing business systems.",
    },
  ],
  "cloud-solutions": [
    {
      question: "Which clouds do you work with?",
      answer:
        "AWS, Azure, and Google Cloud. We design architectures that match your compliance, cost, and growth goals rather than forcing a single vendor.",
    },
    {
      question: "Can you migrate us from on-prem or another cloud with minimal downtime?",
      answer:
        "Yes. We plan cutovers with staging, data validation, rollback paths, and phased traffic moves so migrations stay controlled and measurable.",
    },
    {
      question: "How do you keep cloud costs under control?",
      answer:
        "Right-sizing, autoscaling, reserved capacity where it pays off, observability, and clear budgets. We review spend against usage so you are not paying for idle resources.",
    },
    {
      question: "Do your cloud setups support Canadian data residency needs?",
      answer:
        "We can design region and compliance-aware architectures (including PIPEDA considerations) so data location, access, and encryption match your policy requirements.",
    },
  ],
  "devops-cicd": [
    {
      question: "What does a typical CI/CD engagement include?",
      answer:
        "Pipeline design, automated tests, secure secrets, staging/production promotion, and rollout strategies (blue-green or canary) so releases are frequent and low-risk.",
    },
    {
      question: "Do you use Infrastructure as Code?",
      answer:
        "Yes. Terraform and related IaC tooling keep environments versioned, repeatable, and reviewable — reducing snowflake servers and manual drift.",
    },
    {
      question: "How quickly can you improve our release process?",
      answer:
        "Many teams see faster, safer deploys within a few sprints once pipelines, environments, and quality gates are standardized.",
    },
    {
      question: "Can you add monitoring and alerting with DevOps work?",
      answer:
        "Yes. Observability (logs, metrics, traces, and alerts) is part of mature delivery so incidents are visible before customers feel them.",
    },
  ],
  "ai-ml-solutions": [
    {
      question: "What kinds of AI/ML projects do you deliver?",
      answer:
        "Chatbots and assistants, recommendation systems, document intelligence, forecasting, computer vision, and workflow automation tailored to real business outcomes.",
    },
    {
      question: "Do we need our own large dataset to start?",
      answer:
        "Not always. We assess data readiness first, then use existing systems, APIs, and carefully scoped models — including fine-tuning or retrieval-augmented approaches when appropriate.",
    },
    {
      question: "How do you keep AI solutions secure and compliant?",
      answer:
        "Access controls, data minimization, audit logging, and clear retention policies. We design with Canadian privacy expectations in mind and avoid unnecessary data exposure.",
    },
    {
      question: "Can AI integrate with our current software stack?",
      answer:
        "Yes. We typically connect models and agents to CRMs, support tools, databases, and internal APIs so AI sits inside existing workflows instead of as a disconnected demo.",
    },
  ],
  "ui-ux-design": [
    {
      question: "What is included in a UI/UX engagement?",
      answer:
        "Discovery, user flows, wireframes, high-fidelity UI, interactive prototypes, and design systems — scoped to product, web, or mobile needs.",
    },
    {
      question: "Do you work with existing development teams?",
      answer:
        "Yes. We hand off Figma specs, components, and interaction notes so engineers can implement cleanly without guesswork.",
    },
    {
      question: "How do you validate designs before build?",
      answer:
        "Through prototypes, usability reviews, and stakeholder walkthroughs so major UX issues are caught before engineering cost locks in.",
    },
    {
      question: "Can you redesign only key conversion pages?",
      answer:
        "Absolutely. Many clients start with homepage, pricing, or checkout flows to lift conversion quickly, then expand into a full system.",
    },
  ],
  "ecommerce-solutions": [
    {
      question: "Which ecommerce platforms do you support?",
      answer:
        "Shopify, WooCommerce, Magento, and custom storefronts. We recommend based on catalog size, integrations, and growth plans — not a one-size platform pitch.",
    },
    {
      question: "Can you migrate my store without losing SEO or order history?",
      answer:
        "Yes. We map URLs, products, customers, and redirects carefully, then verify indexing and checkout flows before and after cutover.",
    },
    {
      question: "Do you handle payments, shipping, and tax for Canadian stores?",
      answer:
        "We integrate payment gateways, shipping carriers, and tax/shipping rules suited to Canadian retail so checkout stays accurate and conversion-friendly.",
    },
    {
      question: "How long does an ecommerce build take?",
      answer:
        "A focused storefront can launch in 6–10 weeks. Multi-warehouse, B2B pricing, or complex ERP sync projects are phased by catalog and integration priority.",
    },
  ],
  "custom-software-development": [
    {
      question: "When should I choose custom software instead of SaaS?",
      answer:
        "When off-the-shelf tools force awkward workarounds, limit integrations, or cannot match your workflow, compliance, or competitive edge.",
    },
    {
      question: "How do you scope a custom software project?",
      answer:
        "Discovery workshops, prioritized requirements, architecture options, and a phased roadmap so you ship value early instead of waiting for a giant big-bang release.",
    },
    {
      question: "Can you modernize legacy systems?",
      answer:
        "Yes. We stabilize, wrap, or rebuild legacy platforms in stages — including API layers and data migration — so operations keep running during the upgrade.",
    },
    {
      question: "Who owns the code and IP?",
      answer:
        "Clients retain ownership of the custom work delivered under agreement. We document repositories, environments, and handoff so your team is never locked out.",
    },
  ],
  "seo-digital-marketing": [
    {
      question: "How long before SEO results show?",
      answer:
        "Technical and on-page wins can appear within weeks. Competitive keyword growth is usually measured over 3–6 months of consistent content, authority, and local optimization.",
    },
    {
      question: "Do you offer local SEO for Canadian cities?",
      answer:
        "Yes. We optimize Google Business Profile, local pages, citations, and city-focused content for markets like Toronto, Vancouver, Calgary, Ottawa, and beyond.",
    },
    {
      question: "What is included in your SEO packages?",
      answer:
        "Technical audits, keyword strategy, on-page optimization, content guidance, reporting, and optional link/authority work depending on the package you select.",
    },
    {
      question: "Will you work with our existing website and CMS?",
      answer:
        "Yes. We adapt to your current stack and prioritize fixes that unblock rankings and conversion without unnecessary rebuilds.",
    },
  ],
  "maintenance-support": [
    {
      question: "What does ongoing maintenance cover?",
      answer:
        "Updates, uptime monitoring, security patches, backups, performance checks, and prioritized bug fixes so your site or app stays healthy after launch.",
    },
    {
      question: "Do you support products you did not originally build?",
      answer:
        "Often yes. We start with a health audit, stabilize critical issues, then move into a predictable support retainer.",
    },
    {
      question: "What are typical response times?",
      answer:
        "Response and resolution targets depend on the plan and severity. Critical production issues are prioritized first; enhancements follow an agreed backlog cadence.",
    },
    {
      question: "Can maintenance include small feature improvements?",
      answer:
        "Yes. Many retainers reserve hours each month for minor enhancements, content updates, and conversion tweaks — not only break/fix work.",
    },
  ],
  "tax-accounting": [
    {
      question: "Which tax and accounting services do you provide?",
      answer:
        "Personal and corporate tax filings, bookkeeping, CRA correspondence support, payroll setup guidance, and year-round advisory for Canadian businesses and individuals.",
    },
    {
      question: "Do you work with CRA filings and compliance deadlines?",
      answer:
        "Yes. We plan around filing calendars, organize records, and help you meet deadlines with clear checklists and proactive reminders.",
    },
    {
      question: "Can startups and small businesses use your services?",
      answer:
        "Absolutely. We support sole proprietors, corporations, and growing teams that need accurate books without a full in-house finance department.",
    },
    {
      question: "How do engagements usually start?",
      answer:
        "With a discovery call, document checklist, and scoped engagement — so scope, timeline, and deliverables are clear before work begins.",
    },
  ],
};

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
let patched = 0;

for (const svc of seed.services || []) {
  const faqs = SERVICE_FAQS_BY_SLUG[svc.slug];
  if (!faqs?.length) {
    console.warn("Missing unique FAQs for", svc.slug);
    continue;
  }
  svc.faqs = faqs;
  patched++;
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log("Patched unique FAQs for", patched, "services");
