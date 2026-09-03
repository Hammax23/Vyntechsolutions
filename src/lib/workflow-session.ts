const COOKIE_NAME = "workflow_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

export type WorkflowSessionPayload = {
  sub: string;
  email: string;
  name: string;
  exp: number;
};

function getSecret(): string {
  return (
    process.env.WORKFLOW_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "vyntech-workflow-dev-secret-change-me"
  );
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
  const enc = new TextEncoder().encode(getSecret());
  return crypto.subtle.importKey("raw", enc, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signWorkflowSession(payload: Omit<WorkflowSessionPayload, "exp">): Promise<string> {
  const full: WorkflowSessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(full)));
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return `${body}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifyWorkflowSession(token: string | undefined | null): Promise<WorkflowSessionPayload | null> {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const key = await hmacKey();
    const ok = await crypto.subtle.verify("HMAC", key, fromBase64Url(sig), new TextEncoder().encode(body));
    if (!ok) return null;
    const json = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as WorkflowSessionPayload;
    if (!json?.sub || !json.exp || json.exp < Math.floor(Date.now() / 1000)) return null;
    return json;
  } catch {
    return null;
  }
}

export function workflowCookieName(): string {
  return COOKIE_NAME;
}

export function workflowCookieMaxAge(): number {
  return MAX_AGE_SEC;
}
