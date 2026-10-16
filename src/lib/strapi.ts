/**
 * Strapi CMS client for Next.js (server-side).
 * Falls back gracefully when Strapi is offline or empty.
 */

/** Server-side API base (may be http://127.0.0.1:1338 on the VPS). */
const STRAPI_URL = (process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337").replace(/\/$/, "");
/**
 * Browser-facing CMS origin for media/uploads.
 * Prefer NEXT_PUBLIC_* so clients never get 127.0.0.1 image URLs.
 */
const STRAPI_PUBLIC_URL = (
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.STRAPI_URL ||
  "http://127.0.0.1:1337"
).replace(/\/$/, "");
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

/** ISR window — avoids cache:"no-store" which breaks `next build` static generation. */
const DEFAULT_REVALIDATE_SECONDS = 30;

export type StrapiListResponse<T> = {
  data: T[];
  meta?: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } };
};

export type StrapiSingleResponse<T> = {
  data: T | null;
};

export function getStrapiURL(path = ""): string {
  return `${STRAPI_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Resolve a Strapi media path/URL for use in <img> / next/image (public host). */
export function getStrapiMedia(url?: string | null): string | undefined {
  if (!url) return undefined;
  const raw = String(url).trim();
  if (!raw) return undefined;
  if (raw.startsWith("data:")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const u = new URL(raw);
      // Admin/API often returns loopback absolute URLs — rewrite for browsers
      if (u.hostname === "127.0.0.1" || u.hostname === "localhost") {
        return `${STRAPI_PUBLIC_URL}${u.pathname}${u.search}`;
      }
    } catch {
      /* keep original */
    }
    return raw;
  }

  return `${STRAPI_PUBLIC_URL}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

/** Pull url from Strapi 4/5 media shapes (flat, data, attributes). */
export function extractStrapiMediaUrl(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "string") return raw.trim();
  if (typeof raw !== "object") return "";
  const m = raw as {
    url?: string;
    data?: { url?: string; attributes?: { url?: string } } | null;
    attributes?: { url?: string };
  };
  return String(
    m.url || m.data?.url || m.data?.attributes?.url || m.attributes?.url || ""
  ).trim();
}

type FetchOptions = {
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  tags?: string[];
  revalidate?: number;
};

function buildQuery(query?: FetchOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function strapiFetch<T>({
  path,
  query,
  tags = ["strapi"],
  revalidate = DEFAULT_REVALIDATE_SECONDS,
}: FetchOptions): Promise<T | null> {
  const url = `${getStrapiURL(path)}${buildQuery(query)}`;

  try {
    // ISR only — never set cache:"no-store" here.
    // no-store during `next build` logs DYNAMIC_SERVER_USAGE on every static page.
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      next: { tags, revalidate },
    });

    if (!res.ok) {
      let detail = "";
      try {
        detail = (await res.text()).slice(0, 300);
      } catch {
        /* ignore */
      }
      console.warn(`[strapi] ${res.status} ${url}${detail ? ` — ${detail}` : ""}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[strapi] unreachable ${url} (${reason})`);
    return null;
  }
}

/** Strapi 5 returns flat entities; Strapi 4 uses attributes, support both */
function flattenStrapiEntity(item: unknown): Record<string, unknown> {
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

export function unwrapList(payload: StrapiListResponse<Record<string, unknown>> | null): Record<string, unknown>[] {
  if (!payload?.data || !Array.isArray(payload.data)) return [];
  return payload.data.map((item) => flattenStrapiEntity(item));
}

export function unwrapSingle(
  payload: StrapiSingleResponse<Record<string, unknown>> | null
): Record<string, unknown> | null {
  if (!payload?.data) return null;
  return flattenStrapiEntity(payload.data);
}

export function isStrapiConfigured(): boolean {
  return Boolean(STRAPI_URL);
}
