/** Shared quote-form defaults and CMS label helpers. */

export const DEFAULT_FORM_SERVICES = [
  "Web Development",
  "Mobile App Development",
  "Cloud Solutions",
  "AI/ML Solutions",
  "DevOps & CI/CD",
  "UI/UX Design",
  "E-commerce Solutions",
  "Custom Software Development",
  "SEO/Digital Marketing",
  "Maintenance & Support",
  "Tax & Accounting Services",
  "Other IT Services",
];

export const DEFAULT_FORM_REGIONS = [
  "Select Region",
  "Ontario",
  "British Columbia",
  "Quebec",
  "Alberta",
  "Other Canada",
  "International",
];

export const DEFAULT_HEAR_ABOUT = [
  "Google",
  "Referral",
  "LinkedIn",
  "Social Media",
  "Event/Conference",
  "Advertisement",
  "Other",
];

export const DEFAULT_BUDGET_OPTIONS = [
  "Under $10,000",
  "$10,000 to $25,000",
  "$25,000 to $50,000",
  "$50,000 to $100,000",
  "$100,000 to $250,000",
  "$250,000+",
];

export const DEFAULT_TIMELINE_OPTIONS = [
  "ASAP",
  "Within 1 month",
  "1-3 months",
  "3-6 months",
  "6+ months",
  "Not sure yet",
];

export function resolveServiceLabels(
  configServices: string[],
  cmsServices: { slug?: string; title?: string }[]
): string[] {
  const bySlug = new Map(
    cmsServices
      .filter((s) => s.slug)
      .map((s) => [String(s.slug), String(s.title || s.slug)])
  );
  return configServices.map((item) => {
    if (item.includes("-")) {
      return bySlug.get(item) || item;
    }
    return item;
  });
}

/** Ensure the catch-all option exists at the end of the services list. */
export function ensureOtherItServices(labels: string[]): string[] {
  if (labels.some((l) => /other it services/i.test(l))) return labels;
  return [...labels, "Other IT Services"];
}

export function withSelectPrefix(list: string[], prefix = "Select Region"): string[] {
  if (!list.length) return [prefix];
  if (list[0]?.toLowerCase().includes("select")) return list;
  return [prefix, ...list];
}

export function applyFormConfigServices(
  formConfig: Record<string, unknown> | undefined | null,
  cmsServices: { slug?: string; title?: string }[]
): string[] {
  if (Array.isArray(formConfig?.services) && formConfig.services.length) {
    return ensureOtherItServices(
      resolveServiceLabels(formConfig.services.map(String), cmsServices)
    );
  }
  if (cmsServices.length) {
    return ensureOtherItServices(
      cmsServices.map((s) => String(s.title || s.slug || "")).filter(Boolean)
    );
  }
  return DEFAULT_FORM_SERVICES;
}
