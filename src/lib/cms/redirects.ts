/**
 * Edge-safe URL redirect helpers for Next.js middleware.
 * Live site applies flat url-redirect entries only (not redirect-chain docs).
 */

export type CmsUrlRedirect = {
  fromPath: string;
  toUrl: string;
  /** Strapi enum: permanent → 301, temporary → 302 */
  redirectType: "permanent" | "temporary";
  active: boolean;
};

const STRAPI_URL = (
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://127.0.0.1:1337"
).replace(/\/$/, "");

const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";
const REDIRECT_REVALIDATE_SECONDS = 60;

const SKIP_PREFIXES = ["/admin", "/api", "/_next", "/workflow"];

export function shouldSkipRedirectLookup(pathname: string): boolean {
  return SKIP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Normalize path for matching: leading slash, no trailing slash (except `/`). */
export function normalizeRedirectPath(input: string): string {
  if (!input) return "/";
  let path = input.trim();
  try {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      path = new URL(path).pathname;
    }
  } catch {
    /* keep as-is */
  }
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

function flattenEntity(item: unknown): Record<string, unknown> {
  if (!item || typeof item !== "object") return {};
  const anyItem = item as Record<string, unknown>;
  if (anyItem.attributes && typeof anyItem.attributes === "object") {
    return {
      id: anyItem.id,
      documentId: anyItem.documentId,
      ...(anyItem.attributes as Record<string, unknown>),
    };
  }
  return anyItem;
}

function mapRedirect(entry: Record<string, unknown>): CmsUrlRedirect | null {
  const fromPath = String(entry.fromPath || "").trim();
  const toUrl = String(entry.toUrl || "").trim();
  if (!fromPath || !toUrl) return null;
  const typeRaw = String(entry.redirectType || "permanent").toLowerCase();
  // Accept Strapi enum + legacy/numeric aliases
  const redirectType: "permanent" | "temporary" =
    typeRaw === "temporary" || typeRaw === "302" ? "temporary" : "permanent";
  const active = entry.active !== false;
  return { fromPath, toUrl, redirectType, active };
}

/** Fetch published active redirects (cached ~60s). Safe for Edge middleware. */
export async function fetchActiveUrlRedirects(): Promise<CmsUrlRedirect[]> {
  const params = new URLSearchParams({
    status: "published",
    "filters[active][$eq]": "true",
    "pagination[pageSize]": "200",
  });
  const url = `${STRAPI_URL}/api/url-redirects?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      next: { revalidate: REDIRECT_REVALIDATE_SECONDS, tags: ["strapi", "url-redirects"] },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: unknown[] };
    if (!Array.isArray(json?.data)) return [];
    return json.data
      .map((item) => mapRedirect(flattenEntity(item)))
      .filter((r): r is CmsUrlRedirect => Boolean(r?.active && r.fromPath && r.toUrl));
  } catch {
    return [];
  }
}

export function findMatchingRedirect(
  pathname: string,
  redirects: CmsUrlRedirect[]
): CmsUrlRedirect | null {
  const normalized = normalizeRedirectPath(pathname);
  for (const r of redirects) {
    if (normalizeRedirectPath(r.fromPath) === normalized) return r;
  }
  return null;
}

/** Resolve redirect destination relative to the incoming request origin when toUrl is a path. */
export function resolveRedirectDestination(toUrl: string, requestUrl: URL): URL {
  const trimmed = toUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return new URL(trimmed);
  }
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return new URL(path, requestUrl.origin);
}
