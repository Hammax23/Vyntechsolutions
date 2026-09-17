/**
 * Unique FAQs per industry (never share one generic set).
 * Run: node cms/scripts/patch-industry-faqs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "..");
const seedPath = path.join(root, "cms", "data", "seed.json");

/** @type {Record<string, Array<{question: string, answer: string}>>} */
export const INDUSTRY_FAQS_BY_SLUG = {
  healthcare: [
    {
      question: "Do you build HIPAA / PHIPA-aware healthcare software?",
      answer:
        "Yes. We design with Canadian privacy expectations in mind — access controls, audit trails, encryption, and workflows that support PHIPA/PIPEDA-aligned handling of patient and clinic data.",
    },
    {
      question: "What healthcare solutions do you typically deliver?",
      answer:
        "Patient portals, booking systems, telehealth experiences, clinic operations tools, integrations with EMR/EHR workflows, and internal dashboards that reduce admin load.",
    },
    {
      question: "Can you integrate with our existing clinic systems?",
      answer:
        "Usually yes. We start with an integration map, then connect scheduling, billing, CRM, or lab systems through secure APIs so staff are not stuck in duplicate entry.",
    },
    {
      question: "How long does a healthcare digital project take?",
      answer:
        "Focused portals or booking tools often launch in 6–12 weeks. Multi-location platforms with complex compliance and integrations are phased so each release is usable and auditable.",
    },
  ],
  "finance-banking": [
    {
      question: "Do you work with banks, fintechs, and accounting firms?",
      answer:
        "Yes. We build customer portals, onboarding flows, reporting dashboards, and internal tools for regulated and finance-adjacent teams across Canada.",
    },
    {
      question: "How do you approach security for financial products?",
      answer:
        "Least-privilege access, encryption in transit and at rest, audit logging, secure auth, and careful handling of PII — reviewed against your compliance requirements.",
    },
    {
      question: "Can you modernize legacy finance portals?",
      answer:
        "Yes. We stabilize what works, wrap APIs where needed, and rebuild high-friction journeys in stages so customers and staff keep operating during the upgrade.",
    },
    {
      question: "What is a typical timeline for a fintech MVP?",
      answer:
        "A scoped MVP can ship in 8–14 weeks when requirements and compliance boundaries are clear. Larger platforms are delivered in milestones with measurable risk controls.",
    },
  ],
  "ecommerce-retail": [
    {
      question: "Which ecommerce platforms do you support for retail?",
      answer:
        "Shopify, WooCommerce, Magento, and custom storefronts. We recommend based on catalog size, omnichannel needs, and integration complexity — not a one-platform pitch.",
    },
    {
      question: "Can you connect inventory, POS, and shipping systems?",
      answer:
        "Yes. ERP, POS, warehouse, and carrier integrations are common so stock, orders, and fulfillment stay in sync across channels.",
    },
    {
      question: "Do you optimize for conversion as well as build?",
      answer:
        "Absolutely. We focus on speed, checkout clarity, mobile UX, and analytics so the store sells — not just looks modern.",
    },
    {
      question: "How do Canadian tax and shipping rules get handled?",
      answer:
        "We configure tax, shipping, and payment setups suited to Canadian retail operations and validate checkout paths before launch.",
    },
  ],
  education: [
    {
      question: "What education platforms do you build?",
      answer:
        "Learning portals, enrollment flows, student/parent dashboards, admin tools, and content delivery experiences for schools, colleges, and training providers.",
    },
    {
      question: "Can you integrate with LMS or student information systems?",
      answer:
        "Yes. We connect to LMS, SIS, payment, and CRM tools so admissions, learning, and support teams work from consistent data.",
    },
    {
      question: "How do you keep education products accessible?",
      answer:
        "We design for clear UX, responsive layouts, and practical accessibility patterns so learners on different devices and abilities can participate.",
    },
    {
      question: "What is a realistic timeline for an education portal?",
      answer:
        "A focused enrollment or learning portal often launches in 6–12 weeks. Multi-role campuses with complex permissions are phased by user journey priority.",
    },
  ],
  "real-estate": [
    {
      question: "Do you build listing sites and agent portals?",
      answer:
        "Yes. Property listing sites, search experiences, agent dashboards, lead capture, and CRM-connected workflows for brokerages and developers.",
    },
    {
      question: "Can you sync listings from MLS or internal feeds?",
      answer:
        "Where APIs and licensing allow, we integrate listing feeds and keep details, photos, and status updates consistent across your site.",
    },
    {
      question: "How do you improve lead conversion for real estate?",
      answer:
        "Fast search, clear property pages, mobile-first inquiry flows, and CRM routing so agents respond while interest is hot.",
    },
    {
      question: "Do you support property management tools as well?",
      answer:
        "We build tenant portals, maintenance request flows, and owner reporting when property ops need digital workflows beyond marketing sites.",
    },
  ],
  logistics: [
    {
      question: "What logistics software do you typically deliver?",
      answer:
        "Dispatch tools, tracking portals, warehouse/ops dashboards, route-support workflows, and customer shipment visibility experiences.",
    },
    {
      question: "Can you integrate with carriers and ERP systems?",
      answer:
        "Yes. Carrier APIs, ERP, WMS, and notification systems are common so orders, inventory, and status updates stay aligned.",
    },
    {
      question: "How do you handle real-time tracking experiences?",
      answer:
        "We design status pipelines, map/timeline views, and reliable event ingestion so customers and ops teams see trustworthy updates.",
    },
    {
      question: "What timeline should we expect for a logistics MVP?",
      answer:
        "A focused tracking or dispatch MVP often ships in 8–14 weeks. Multi-warehouse platforms are delivered in phases tied to operational priority.",
    },
  ],
  "entertainment-media": [
    {
      question: "Do you build streaming, content, and fan engagement platforms?",
      answer:
        "Yes. Content sites, membership experiences, media libraries, event/ticket-adjacent flows, and engagement features for entertainment brands.",
    },
    {
      question: "How do you keep media sites fast under traffic spikes?",
      answer:
        "Caching, CDN-friendly architecture, optimized media delivery, and scalable hosting patterns so premieres and campaigns do not melt the site.",
    },
    {
      question: "Can you support subscriptions and paywalled content?",
      answer:
        "We implement auth, entitlements, payments, and content gating so paying members get reliable access and clear upgrade paths.",
    },
    {
      question: "Do you work with creative and marketing teams?",
      answer:
        "Yes. We hand off editable CMS structures and component systems so campaigns can ship without engineering bottlenecks for every content change.",
    },
  ],
  manufacturing: [
    {
      question: "What manufacturing digital solutions do you deliver?",
      answer:
        "Operations dashboards, supplier/customer portals, inventory visibility tools, quality tracking workflows, and internal process automation.",
    },
    {
      question: "Can you connect plant systems and ERP data?",
      answer:
        "Where integrations are available, we connect ERP, MES, IoT, and reporting layers so leadership sees live operational truth — not spreadsheet lag.",
    },
    {
      question: "How do you reduce downtime with software?",
      answer:
        "Better alerts, maintenance workflows, and visibility into bottlenecks help teams act before small issues become line stoppages.",
    },
    {
      question: "What does a manufacturing pilot usually look like?",
      answer:
        "Start with one plant or one workflow (quality, inventory, or supplier portal), prove ROI in weeks, then expand to other lines or sites.",
    },
  ],
  "hospitality-travel": [
    {
      question: "Do you build booking and guest experience platforms?",
      answer:
        "Yes. Booking flows, property sites, guest portals, loyalty experiences, and ops dashboards for hotels, travel brands, and hospitality groups.",
    },
    {
      question: "Can you integrate PMS, channel managers, and payments?",
      answer:
        "We connect property management, channel, CRM, and payment systems so reservations, rates, and guest data stay consistent.",
    },
    {
      question: "How do you improve direct bookings?",
      answer:
        "Faster pages, clearer rate presentation, mobile checkout, and trust signals that reduce OTA dependency without hurting occupancy.",
    },
    {
      question: "What timeline fits a hospitality website rebuild?",
      answer:
        "Many property sites launch in 4–8 weeks. Multi-property platforms with deep PMS integrations are phased by brand and booking priority.",
    },
  ],
  telecommunications: [
    {
      question: "What telecom digital products do you build?",
      answer:
        "Customer portals, plan comparison/checkout flows, support tools, outage/status experiences, and internal ops dashboards for telecom teams.",
    },
    {
      question: "Can you integrate BSS/OSS or CRM systems?",
      answer:
        "Yes where APIs allow. We map billing, provisioning, CRM, and support systems so customers get accurate account and service status.",
    },
    {
      question: "How do you handle high-volume customer self-serve?",
      answer:
        "Clear information architecture, robust auth, caching, and resilient APIs so account, billing, and support journeys stay fast at peak load.",
    },
    {
      question: "Do you support both B2C and B2B telecom journeys?",
      answer:
        "We design separate flows for consumers and business accounts when needs differ — quotes, multi-seat management, and enterprise onboarding included.",
    },
  ],
};

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
let patched = 0;

for (const ind of seed.industries || []) {
  const faqs = INDUSTRY_FAQS_BY_SLUG[ind.slug];
  if (!faqs?.length) {
    console.warn("Missing unique FAQs for industry", ind.slug);
    continue;
  }
  ind.faqs = faqs;
  if (!ind.faqEyebrow) ind.faqEyebrow = "FAQ";
  if (!ind.faqHeading) ind.faqHeading = "Frequently asked questions";
  if (!ind.faqIntro) {
    ind.faqIntro = `Answers about ${ind.title || "this industry"} solutions, timelines, and delivery. Still stuck? Chat with the team.`;
  }
  patched++;
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log("Patched unique FAQs for", patched, "industries");
