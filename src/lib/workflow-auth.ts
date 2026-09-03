import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import {
  signWorkflowSession,
  verifyWorkflowSession,
  workflowCookieMaxAge,
  workflowCookieName,
  type WorkflowSessionPayload,
} from "@/lib/workflow-session";
import prisma from "@/lib/prisma";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function setWorkflowCookie(payload: { sub: string; email: string; name: string }) {
  const token = await signWorkflowSession(payload);
  cookies().set(workflowCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: workflowCookieMaxAge(),
  });
}

export function clearWorkflowCookie() {
  cookies().set(workflowCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getWorkflowSession(): Promise<WorkflowSessionPayload | null> {
  const token = cookies().get(workflowCookieName())?.value;
  return verifyWorkflowSession(token);
}

export async function requireStaff() {
  const session = await getWorkflowSession();
  if (!session) return null;
  const staff = await prisma.staffUser.findUnique({ where: { id: session.sub } });
  if (!staff || !staff.isActive || staff.role === "system") {
    clearWorkflowCookie();
    return null;
  }
  return staff;
}

/** Internal creator for tasks assigned from the admin panel (not a real login). */
export const ADMIN_WORKFLOW_CREATOR_EMAIL = "admin-system@vyntech.internal";

/** Prisma filter: hide internal admin task-creator account everywhere. */
export function notSystemStaffWhere() {
  return {
    AND: [{ role: { not: "system" } }, { email: { not: ADMIN_WORKFLOW_CREATOR_EMAIL } }],
  };
}

export function isSystemStaffRecord(s: { role?: string; email?: string }) {
  return s.role === "system" || s.email === ADMIN_WORKFLOW_CREATOR_EMAIL;
}

export const STAFF_COLORS = ["#00B4FF", "#6366F1", "#22C55E", "#F59E0B", "#EC4899", "#14B8A6", "#A78BFA", "#F97316"];

export function nextStaffColor(index: number): string {
  return STAFF_COLORS[index % STAFF_COLORS.length];
}

export async function ensureAdminWorkflowCreator() {
  const existing = await prisma.staffUser.findUnique({
    where: { email: ADMIN_WORKFLOW_CREATOR_EMAIL },
  });
  if (existing) return existing;

  return prisma.staffUser.create({
    data: {
      name: "Admin",
      email: ADMIN_WORKFLOW_CREATOR_EMAIL,
      passwordHash: await hashPassword(`${crypto.randomUUID()}${crypto.randomUUID()}`),
      role: "system",
      isActive: false,
      color: "#0055FF",
    },
  });
}
