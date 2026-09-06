export const DEFAULT_NAV_CHROME = {
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

export const DEFAULT_COOKIE_CHROME = {
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

export const DEFAULT_FORM_LABELS = {
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

export const DEFAULT_CONTACT_PAGE = {
  heroHeading: "Let's Talk",
  heroBody:
    "Tell us about your project, and our experts will craft a customized solution that drives real business results.",
  formHeading: "Tell Us About Your Project",
  formBody: "Fill out the form below and we'll get back to you within 24 hours with a customized proposal.",
  benefitsHeading: "What You'll Get",
  talkHeading: "Prefer to Talk?",
};

export function mergeCopy<T extends Record<string, string>>(
  defaults: T,
  incoming?: Record<string, unknown> | null
): T {
  if (!incoming || typeof incoming !== "object") return defaults;
  const next = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const value = incoming[key as string];
    if (typeof value === "string" && value.trim()) {
      next[key] = value as T[typeof key];
    }
  }
  return next;
}
