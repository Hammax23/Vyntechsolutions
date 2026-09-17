import type { MetadataRoute } from "next";
import { getCmsGlobalSeo } from "@/lib/cms/content";

/** SEO Expert–approved default (also in public/robots.txt + Global SEO robotsTxt). */
export const DEFAULT_ROBOTS_TXT = `# VynTech Solutions - Canada's Premier Digital Agency
# https://vyntechsolutions.ca

User-agent: *
Allow: /
# Allow required Next.js rendering resources
Allow: /_next/static/
Allow: /_next/image/
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /_next/

Sitemap: https://vyntechsolutions.ca/sitemap.xml
`;

/**
 * Parse plain robots.txt into Next MetadataRoute rules when possible.
 * Falls back to the SEO Expert default structure.
 */
function rulesFromRobotsTxt(raw: string): MetadataRoute.Robots["rules"] {
  const lines = raw.split(/\r?\n/).map((l) => l.trim());
  const allows: string[] = [];
  const disallows: string[] = [];
  let sawAgent = false;

  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const lower = line.toLowerCase();
    if (lower.startsWith("user-agent:")) {
      sawAgent = true;
      continue;
    }
    if (lower.startsWith("allow:")) {
      const v = line.slice(line.indexOf(":") + 1).trim();
      if (v) allows.push(v);
      continue;
    }
    if (lower.startsWith("disallow:")) {
      const v = line.slice(line.indexOf(":") + 1).trim();
      if (v) disallows.push(v);
      continue;
    }
  }

  if (!sawAgent && !allows.length && !disallows.length) {
    return {
      userAgent: "*",
      allow: ["/", "/_next/static/", "/_next/image/"],
      disallow: ["/admin/", "/api/", "/private/", "/_next/"],
    };
  }

  return {
    userAgent: "*",
    allow: allows.length ? allows : ["/"],
    disallow: disallows,
  };
}

function sitemapFromRobotsTxt(raw: string): string {
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (/^sitemap:/i.test(t)) {
      return t.slice(t.indexOf(":") + 1).trim() || "https://vyntechsolutions.ca/sitemap.xml";
    }
  }
  return "https://vyntechsolutions.ca/sitemap.xml";
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const globalSeo = await getCmsGlobalSeo().catch(() => null);
  const fromCms =
    typeof globalSeo?.robotsTxt === "string" && globalSeo.robotsTxt.trim()
      ? String(globalSeo.robotsTxt)
      : DEFAULT_ROBOTS_TXT;

  return {
    rules: rulesFromRobotsTxt(fromCms),
    sitemap: sitemapFromRobotsTxt(fromCms),
    host: "https://vyntechsolutions.ca",
  };
}
