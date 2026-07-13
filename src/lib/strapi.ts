/**
 * Strapi CMS client for Next.js (server-side).
 * Falls back gracefully when Strapi is offline or empty.
 */

const STRAPI_URL = (process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337").replace(/\/$/, "");
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

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

export function getStrapiMedia(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http") || url.startsWith("//") || url.startsWith("data:")) return url;
  return getStrapiURL(url);
}

type FetchOptions = {
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  tags?: string[];
  revalidate?: number | false;
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
  revalidate = 60,
}: FetchOptions): Promise<T | null> {
  const url = `${getStrapiURL(path)}${buildQuery(query)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      next: revalidate === false ? { revalidate: 0 } : { revalidate, tags },
    });

    if (!res.ok) {
      console.warn(`[strapi] ${res.status} ${url}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[strapi] unreachable ${url}`, err);
    return null;
  }
}

export function unwrapList<T extends { id: number; documentId?: string; attributes?: Record<string, unknown> } | Record<string, unknown>>(
  payload: StrapiListResponse<T> | null
): Array<T & Record<string, unknown>> {
  if (!payload?.data || !Array.isArray(payload.data)) return [];
  return payload.data.map((item) => flattenStrapiEntity(item));
}

export function unwrapSingle<T extends { id: number; documentId?: string; attributes?: Record<string, unknown> } | Record<string, unknown>>(
  payload: StrapiSingleResponse<T> | null
): (T & Record<string, unknown>) | null {
  if (!payload?.data) return null;
  return flattenStrapiEntity(payload.data);
}

/** Strapi 5 returns flat entities; Strapi 4 uses attributes — support both */
function flattenStrapiEntity<T>(item: T): T & Record<string, unknown> {
  if (!item || typeof item !== "object") return item as T & Record<string, unknown>;
  const anyItem = item as Record<string, unknown>;
  if (anyItem.attributes && typeof anyItem.attributes === "object") {
    return {
      id: anyItem.id,
      documentId: anyItem.documentId,
      ...(anyItem.attributes as Record<string, unknown>),
    } as T & Record<string, unknown>;
  }
  return item as T & Record<string, unknown>;
}

export function isStrapiConfigured(): boolean {
  return Boolean(STRAPI_URL);
}
