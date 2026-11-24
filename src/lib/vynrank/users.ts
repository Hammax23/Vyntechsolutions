import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import type { VynRankRole } from "@/lib/vynrank/session";
import { isVynRankRole } from "@/lib/vynrank/session";

export async function hashVynRankPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyVynRankPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function publicVynRankUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  orgId: string;
  isActive: boolean;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as VynRankRole,
    orgId: user.orgId,
    isActive: user.isActive,
  };
}

export async function findActiveVynRankUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const user = await prisma.vynRankUser.findUnique({ where: { email: normalized } });
  if (!user || !user.isActive) return null;
  if (!isVynRankRole(user.role)) return null;
  return user;
}
