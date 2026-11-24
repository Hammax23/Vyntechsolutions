/**
 * HttpOnly cookie session for /vynrank (Edge-safe HMAC).
 */

const COOKIE_NAME = "vynrank_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

export type VynRankRole = "ceo" | "seo_team" | "client";

export type VynRankSessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: VynRankRole;
  orgId: string;
  exp: number;
};

function getSecret(): string {
  return (
    process.env.VYNRANK_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.WORKFLOW_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "vynrank-dev-secret-change-me"
  );
}

function toBufferSource(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = typeof btoa === "function" ? btoa(bin) : Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "==".slice((input.length * 3) % 4);
  if (typeof atob === "function") {
    const bin = atob(padded);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(padded, "base64"));
}

async function hmacKey(): Promise<CryptoKey> {
  const enc = toBufferSource(new TextEncoder().encode(getSecret()));
  return crypto.subtle.importKey("raw", enc, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function signVynRankSession(
  payload: Omit<VynRankSessionPayload, "exp">
): Promise<string> {
  const full: VynRankSessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(full)));
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, toBufferSource(new TextEncoder().encode(body)));
  return `${body}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifyVynRankSession(
  token: string | undefined | null
): Promise<VynRankSessionPayload | null> {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const key = await hmacKey();
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      toBufferSource(fromBase64Url(sig)),
      toBufferSource(new TextEncoder().encode(body))
    );
    if (!ok) return null;
    const json = JSON.parse(
      new TextDecoder().decode(fromBase64Url(body))
    ) as VynRankSessionPayload;
    if (!json?.sub || !json?.role || !json?.orgId || !json.exp) return null;
    if (json.exp < Math.floor(Date.now() / 1000)) return null;
    if (json.role !== "ceo" && json.role !== "seo_team" && json.role !== "client") return null;
    return json;
  } catch {
    return null;
  }
}

export function vynrankCookieName(): string {
  return COOKIE_NAME;
}

export function vynrankCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}

export function isVynRankRole(value: string): value is VynRankRole {
  return value === "ceo" || value === "seo_team" || value === "client";
}
