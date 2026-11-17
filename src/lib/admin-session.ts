/**
 * HttpOnly cookie session for /admin (Edge-safe HMAC, same pattern as workflow).
 */

const COOKIE_NAME = "admin_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

export type AdminRole = "owner" | "virtual_assistant";

export type AdminSessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
  sid: string;
  exp: number;
};

function getSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.WORKFLOW_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "vyntech-admin-dev-secret-change-me"
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

export async function signAdminSession(
  payload: Omit<AdminSessionPayload, "exp">
): Promise<string> {
  const full: AdminSessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(full)));
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, toBufferSource(new TextEncoder().encode(body)));
  return `${body}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifyAdminSession(
  token: string | undefined | null
): Promise<AdminSessionPayload | null> {
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
    ) as AdminSessionPayload;
    if (!json?.sub || !json?.sid || !json?.role || !json.exp) return null;
    if (json.exp < Math.floor(Date.now() / 1000)) return null;
    if (json.role !== "owner" && json.role !== "virtual_assistant") return null;
    return json;
  } catch {
    return null;
  }
}

export function adminCookieName(): string {
  return COOKIE_NAME;
}

export function adminCookieMaxAge(): number {
  return MAX_AGE_SEC;
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}
