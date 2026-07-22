import type { QuotationData, ScopeSection } from "./quotation-types";
import { flattenScope, generateQuoteNumber } from "./quotation-types";

/** Software-house style statement of work */
export const DEFAULT_SCOPE: ScopeSection[] = [
  {
    title: "Discovery & Design",
    items: [
      "Requirements workshop and scope confirmation",
      "Information architecture and page structure",
      "UI/UX design for approved page set",
      "Design review and sign-off",
    ],
  },
  {
    title: "Development",
    items: [
      "Responsive Next.js frontend implementation",
      "Strapi CMS setup and content models",
      "API integration and admin configuration",
      "Forms, SEO foundations, and security basics",
    ],
  },
  {
    title: "QA & Launch",
    items: [
      "Cross-browser and device quality assurance",
      "Staging review and feedback incorporation",
      "Production deployment and go-live support",
      "Handover documentation and basic training",
    ],
  },
];

export const DEFAULT_OPTIONAL = [
  { service: "Paid Media Setup (Google / Meta)", price: "Upon Request" },
  { service: "CRM Integration", price: "Upon Request" },
  { service: "Accounting Integration (QuickBooks)", price: "Upon Request" },
  { service: "Extended Support Retainer", price: "Upon Request" },
];

export const DEFAULT_TERMS = [
  "This proposal is valid for 15 days from the issue date unless extended in writing.",
  "A deposit is required to confirm the engagement and reserve the project schedule.",
  "Project timeline begins after deposit clearance and receipt of required content/assets.",
  "Two rounds of revisions are included. Additional revisions are billed as change requests.",
  "Work outside the stated scope requires written approval and may affect cost and timeline.",
  "Intellectual property and source deliverables transfer to the client upon full payment.",
];

export const DEFAULT_INTRO =
  "Thank you for considering VynTech Solutions. Please find below our formal proposal for the engagement, including scope, commercial terms, and acceptance.";

export function createDefaultQuotation(): QuotationData {
  const scopeSections = DEFAULT_SCOPE.map((s) => ({
    title: s.title,
    items: [...s.items],
  }));

  return {
    quoteNumber: generateQuoteNumber(),
    customerName: "",
    companyName: "",
    quoteDate: new Date().toISOString().split("T")[0],
    projectTitle: "Custom Web Application",
    projectSubtitle: "Statement of Work & Commercial Proposal",
    introText: DEFAULT_INTRO,
    projectType: "Website Development",
    technology: "Next.js · Strapi CMS",
    totalPages: "Up to 20 pages",
    timeline: "3–5 weeks",
    scopeSections,
    includes: flattenScope(scopeSections),
    optionalServices: [...DEFAULT_OPTIONAL],
    showSocialMedia: false,
    socialMediaFee: 600,
    socialIncludes: [],
    baseAmount: 3700,
    discountPercent: 10,
    hstPercent: 13,
    depositPercent: 50,
    terms: [...DEFAULT_TERMS],
    status: "draft",
  };
}
