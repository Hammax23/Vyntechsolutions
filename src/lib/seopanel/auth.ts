import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";

export const SEO_EXPERT_EMAIL = process.env.SEO_EXPERT_EMAIL || "seo@vyntechsolutions.ca";
export const SEO_EXPERT_PASSWORD = process.env.SEO_EXPERT_PASSWORD || "SeoExpert@2024";

const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function generate2FACode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIP || "unknown";
}

export async function isSeoIPLocked(ipAddress: string) {
  const since = new Date(Date.now() - LOCKOUT_DURATION_MS);
  const failedAttempts = await prisma.loginAttempt.count({
    where: { ipAddress, success: false, createdAt: { gte: since } },
  });
  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    const latest = await prisma.loginAttempt.findFirst({
      where: { ipAddress, success: false, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
    });
    if (latest) {
      const unlockTime = new Date(latest.createdAt.getTime() + LOCKOUT_DURATION_MS);
      const remainingTime = Math.ceil((unlockTime.getTime() - Date.now()) / 60000);
      return { locked: true, remainingTime };
    }
  }
  return { locked: false };
}

export async function recordSeoLoginAttempt(ipAddress: string, email: string, success: boolean) {
  await prisma.loginAttempt.create({ data: { ipAddress, email, success } });
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: oneDayAgo } } });
}

export async function createSeoSession(email: string) {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await prisma.seoSession.create({ data: { token, email, expiresAt } });
  return { token, expiresAt };
}

export async function validateSeoSession(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;

  const session = await prisma.seoSession.findUnique({ where: { token } });
  if (!session || new Date() > session.expiresAt) {
    if (session) await prisma.seoSession.delete({ where: { token } }).catch(() => {});
    return null;
  }
  return session;
}

export async function logSeoActivity(action: string, module: string, details?: string) {
  await prisma.seoActivityLog.create({
    data: { action, module, details, user: "SEO Expert" },
  });
}
