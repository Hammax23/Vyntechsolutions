import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = join(root, "cms/data/seed.json");
const seed = JSON.parse(readFileSync(seedPath, "utf8"));

seed.navigation = seed.navigation || {};
seed.navigation.chrome = {
  servicesLabel: "SERVICES",
  industriesLabel: "INDUSTRIES",
  ctaLabel: "LET'S TALK BUSINESS",
  expertiseHeading: "OUR EXPERTISE",
  expertiseBody: "Why data standards matter & why they're important",
  exploreServices: "Explore all services →",
  viewAllServices: "View All Services",
  industriesMenuHeading: "INDUSTRIES",
  exploreIndustries: "Explore all industries →",
  searchPlaceholder: "Search pages, services...",
  searchAria: "Search",
  quickLinks: "Quick Links",
  noResultsPrefix: "No results found for",
  pressEsc: "Press ESC to close",
  homeLabel: "Home",
  contactLabel: "Contact",
};

seed.globalSeo = seed.globalSeo || {};
seed.globalSeo.cookieChrome = {
  rejectLabel: "Reject All",
  settingsTitle: "Privacy Settings",
  settingsBody: "Manage your cookie preferences",
  saveLabel: "Save Settings",
  requiredLabel: "Required",
  essentialTitle: "Essential",
  essentialBody: "Necessary for the website to function. Cannot be disabled.",
  analyticsTitle: "Analytics",
  analyticsBody: "Help us understand how visitors interact with our website.",
  marketingTitle: "Marketing",
  marketingBody: "Used to display relevant advertisements based on your interests.",
  functionalTitle: "Functional",
  functionalBody: "Enable personalized features like live chat and social sharing.",
};

seed.formConfig = seed.formConfig || {};
seed.formConfig.labels = {
  modalTitle: "Let's Talk Business",
  submit: "Submit",
  submitting: "Submitting...",
  submitted: "Submitted!",
  successTitle: "Quote Submitted Successfully!",
  timedName: "Name",
  timedEmail: "Company Email",
  timedPhone: "Contact Number",
  timedWorkEmail: "Work Email (Optional)",
  timedProject: "Describe your project (Help us come back better prepared)",
  timedTrust: "Fast 2-minute response, fully NDA-protected.",
  timedSubmit: "Submit Requirements",
};

if (seed.homepage) {
  seed.homepage.industriesViewLabel = seed.homepage.industriesViewLabel || "View";
}

for (const industry of seed.industries || []) {
  if (!industry.solutionsEyebrow) industry.solutionsEyebrow = "What We Deliver";
}

const pages = seed.staticPages || [];
if (!pages.some((p) => p.slug === "lets-talk-business")) {
  pages.push({
    title: "Let's Talk Business",
    slug: "lets-talk-business",
    heroHeading: "Let's Talk",
    heroBody:
      "Tell us about your project, and our experts will craft a customized solution that drives real business results.",
    sections: {
      formHeading: "Tell Us About Your Project",
      formBody: "Fill out the form below and we'll get back to you within 24 hours with a customized proposal.",
      benefitsHeading: "What You'll Get",
      talkHeading: "Prefer to Talk?",
    },
  });
}
const blog = pages.find((p) => p.slug === "blog");
if (blog) {
  blog.sections = {
    ...(blog.sections || {}),
    relatedHeading: "Related Articles",
    postCtaHeading: "Need Help With Your Project?",
    postCtaBody: "Let's discuss how we can help build your software solution.",
    postCtaLabel: "Get in Touch",
    notFoundHeading: "Article Not Found",
    notFoundLink: "Back to Blog",
  };
}
seed.staticPages = pages;

writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log("Seeded navigation.chrome, cookieChrome, form labels, contact page, blog post CTA");
