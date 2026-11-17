import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import type { AdminRole } from "@/lib/admin-session";
import { sectionsForRole } from "@/lib/admin-acl";

export async function hashAdminPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyAdminPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

/**
 * Ensure the env owner account exists (idempotent).
 * Does not overwrite password if owner already exists.
 */
export async function ensureOwnerAdminUser(): Promise<void> {
  const email = String(process.env.ADMIN_EMAIL || "info@vyntechsolutions.ca")
    .trim()
    .toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "").trim();
  if (!email || !password) return;

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "owner" || !existing.isActive) {
      await prisma.adminUser.update({
        where: { id: existing.id },
        data: { role: "owner", isActive: true },
      });
    }
    return;
  }

  await prisma.adminUser.create({
    data: {
      name: "Admin",
      email,
      passwordHash: await hashAdminPassword(password),
      role: "owner",
      isActive: true,
    },
  });
}

export function publicAdminUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt?: Date;
}) {
  const role = (user.role === "owner" ? "owner" : "virtual_assistant") as AdminRole;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    createdAt: user.createdAt ? user.createdAt.toISOString() : undefined,
    sections: sectionsForRole(role),
  };
}

export async function endOpenSessionsForUser(
  userId: string,
  reason: "logout" | "timeout" | "disabled"
) {
  await prisma.adminSession.updateMany({
    where: { userId, logoutAt: null },
    data: {
      logoutAt: new Date(),
      endedReason: reason,
      lastSeenAt: new Date(),
    },
  });
}

export async function logAdminActivity(opts: {
  userId: string;
  sessionId?: string | null;
  action: string;
  meta?: Record<string, unknown>;
}) {
  try {
    await prisma.adminActivityEvent.create({
      data: {
        userId: opts.userId,
        sessionId: opts.sessionId || null,
        action: opts.action,
        ...(opts.meta
          ? { meta: opts.meta as Prisma.InputJsonValue }
          : {}),
      },
    });
  } catch (e) {
    console.error("admin activity log", e);
  }
}

export const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;
export const SESSION_TIMEOUT_MS = 10 * 60 * 1000;

export function isSessionOnline(session: {
  logoutAt: Date | null;
  lastSeenAt: Date;
}): boolean {
  if (session.logoutAt) return false;
  return Date.now() - session.lastSeenAt.getTime() <= ONLINE_THRESHOLD_MS;
}

export function sessionDurationMs(session: {
  loginAt: Date;
  lastSeenAt: Date;
  logoutAt: Date | null;
}): number {
  const end = session.logoutAt || session.lastSeenAt;
  return Math.max(0, end.getTime() - session.loginAt.getTime());
}
