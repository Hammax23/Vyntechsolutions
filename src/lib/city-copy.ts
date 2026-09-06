export type CityCopyVars = {
  city: string;
  service: string;
  description?: string;
};

/** Replace {city}, {service}, {description} placeholders in CMS city-page templates. */
export function fillCityCopy(template: string | null | undefined, vars: CityCopyVars): string {
  if (!template) return "";
  return String(template)
    .replace(/\{city\}/gi, vars.city)
    .replace(/\{service\}/gi, vars.service)
    .replace(/\{description\}/gi, vars.description || "");
}

export const DEFAULT_CITY_HERO = {
  eyebrowTemplate: "{service} in {city}",
  headlineTemplate: "{service} Services in {city}",
  subheadingTemplate: "{description} We are the trusted local partner for businesses in {city}.",
  ctaLabel: "Request a Free Quote",
  whyChooseHeadingTemplate: "Why Choose Us for {service} in {city}?",
  whyChooseBodyTemplate:
    "Our team is dedicated to providing high-quality digital solutions tailored specifically for the {city} market. Let us help you dominate your local industry.",
  engagementHeadingTemplate: "How Will We Increase Engagement Through {service}",
  aboutEyebrowTemplate: "About {city}",
  aboutHeadingTemplate: "{service} for {city} Businesses",
  aboutBodyTemplate:
    "{city} is a highly competitive digital market, with hundreds of thousands of businesses all fighting for the same Google searches. A generic digital presence won't cut it here. VynTech Solutions builds custom, conversion-focused {service} campaigns for {city} businesses that are engineered to rank, load fast, and turn visitors into paying customers. We understand the {city} market deeply. Our strategies are tailored to local neighbourhoods and business verticals, so you're not just getting traffic, you're getting the right traffic. With five-star reviews and clients across every major industry, we're the agency that {city} businesses trust to grow online.",
  industriesHeadingTemplate: "Industries We Serve in {city}",
  sidebarHeadingTemplate: "Why {city} Businesses Choose VynTech",
  sidebarItems: [
    "{city}'s leading {service} agency",
    "Custom strategies engineered to dominate the {city} market",
    "Local market expertise and dedicated support",
    "Mobile-first approach, capturing local smartphone searches",
  ],
  hoursText: "Mon to Fri: 9:00 AM to 6:00 PM EST",
  quoteCtaTemplate: "Get a Free {city} Quote",
  bottomCtaHeadingTemplate: "Ready to Grow Your Business in {city}?",
  bottomCtaBodyTemplate:
    "Contact us today to discuss your {service} project. We provide custom quotes and transparent timelines.",
  bottomCtaLabel: "Let's Talk Business",
  faqEyebrow: "FAQ",
  faqHeading: "Frequently asked questions",
  faqIntroTemplate: "Everything you need to know about our {service} services in {city}.",
  rankingEyebrow: "What We Optimize",
  rankingHeadingTemplate: "Dominating the {city} Search Results",
  rankingDescription:
    "Ranking in the local map pack requires a precise, technical approach. Here is exactly what we optimize to push your business to the top of Google.",
  rankingItems: [
    {
      title: "Google Business Profile",
      desc: "Full optimization of your GBP, including categories, attributes, products, and regular geo-tagged posts to boost relevance.",
      iconKey: "gbp",
    },
    {
      title: "Local Citations",
      desc: "Building consistent NAP (Name, Address, Phone) citations across high-authority directories specifically relevant to your area.",
      iconKey: "citations",
    },
    {
      title: "On-Page Localization",
      desc: "Injecting hyper-local keywords, schema markup, and neighborhood references directly into your website's architecture.",
      iconKey: "onpage",
    },
    {
      title: "Review Management",
      desc: "Implementing automated systems to generate positive reviews from your best clients, a major ranking signal for local SEO.",
      iconKey: "reviews",
    },
  ],
  advantageHeadingTemplate: "Ready to Capture the {city} Market?",
  advantageBody:
    "46% of all Google searches have local intent. If you aren't visible when local customers search for your services, you're handing revenue directly to your competitors. Let's fix that.",
  advantageCtaPrimary: "Get a Free Local SEO Audit",
  advantageCtaSecondary: "Speak with a Strategist",
  advantageStats: [
    { value: "97%", label: "Of people learn more about a local company online than anywhere else." },
    { value: "88%", label: "Of local mobile searches result in a call or visit within 24 hours." },
  ],
};

export const DEFAULT_CITY_FAQS = [
  {
    question: "Why do I need professional {service} services in {city}?",
    answer:
      "{city} is a highly competitive market. Having a professional {service} strategy ensures your business stands out locally, attracts the right audience, and converts visitors into loyal customers.",
  },
  {
    question: "How long does a typical {service} project take?",
    answer:
      "The timeline depends on the scope and complexity of your requirements. Once we evaluate your business goals during our free consultation, we provide a clear, transparent timeline with milestones.",
  },
  {
    question: "Do you have experience working with businesses in {city}?",
    answer:
      "Yes, we have extensive experience working with companies across {city} in various industries. We understand the local market dynamics and tailor our strategies to match regional consumer behavior.",
  },
  {
    question: "What makes VynTech Solutions different from other agencies in {city}?",
    answer:
      "We don't just deliver a service; we act as your technology partner. Our team focuses on ROI-driven results, transparent communication, and building long-term scalable solutions for your business.",
  },
  {
    question: "How do we get started?",
    answer:
      "Getting started is easy! Simply reach out to us using the 'Let's Talk Business' button below. We'll schedule a free consultation to discuss your needs and outline the perfect strategy.",
  },
];
