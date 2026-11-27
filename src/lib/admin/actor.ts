import { NextRequest } from "next/server";
import {
  adminCookieName,
  verifyAdminSession,
  type AdminSessionPayload,
} from "@/lib/admin-session";

/** Display name for Activity / Notes (prefer name, else email). */
export function getAdminActorName(
  user: { name?: string | null; email?: string | null } | null | undefined
): string {
  const name = String(user?.name || "").trim();
  if (name) return name;
  const email = String(user?.email || "").trim();
  if (email) return email;
  return "Admin";
}

/** Richer label for audit lines: `Name <email>`. */
export function getAdminActorLabel(
  user: { name?: string | null; email?: string | null } | null | undefined
): string {
  const name = String(user?.name || "").trim();
  const email = String(user?.email || "").trim();
  if (name && email) return `${name} <${email}>`;
  return getAdminActorName(user);
}

/** Resolve actor from admin_session cookie (Owner or VA). */
export async function resolveAdminActor(
  request: NextRequest
): Promise<{ payload: AdminSessionPayload; name: string; label: string } | null> {
  const token = request.cookies.get(adminCookieName())?.value;
  const payload = await verifyAdminSession(token);
  if (!payload) return null;
  return {
    payload,
    name: getAdminActorName(payload),
    label: getAdminActorLabel(payload),
  };
}

/** Actor name or fallback when session missing (middleware should already gate). */
export async function actorNameFromRequest(
  request: NextRequest,
  fallback = "Admin"
): Promise<string> {
  const actor = await resolveAdminActor(request);
  return actor?.name || fallback;
}
