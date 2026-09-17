/**
 * Service page headings — always prefer Strapi fields.
 * H1 = subtitle (hero). H2 overview = overviewHeading (never repeats H1).
 */

export function resolveServiceHeroHeading(service: {
  title: string;
  subtitle?: string | null;
}): string {
  const subtitle = String(service.subtitle || "").trim();
  const title = String(service.title || "").trim();
  return subtitle || title;
}

export function resolveServiceOverviewHeading(service: {
  title: string;
  subtitle?: string | null;
  overviewHeading?: string | null;
}): string {
  const h1 = resolveServiceHeroHeading(service).toLowerCase();
  const fromCms = String(service.overviewHeading || "").trim();
  if (fromCms && fromCms.toLowerCase() !== h1) return fromCms;

  // Fallback only when Strapi overviewHeading empty — still CMS title, never hero subtitle
  const title = String(service.title || "").trim();
  if (title && title.toLowerCase() !== h1) return title;

  return fromCms || title || "Overview";
}
