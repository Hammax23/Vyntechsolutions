import type { Prisma } from "@prisma/client";
import type { VynRankSessionPayload } from "@/lib/vynrank/session";

/** Prisma where clause for projects visible to the current session */
export function projectsWhereForSession(
  session: VynRankSessionPayload
): Prisma.VynRankProjectWhereInput {
  const base: Prisma.VynRankProjectWhereInput = { orgId: session.orgId };
  if (session.role === "ceo") return base;
  if (session.role === "client") {
    return { ...base, clientUserId: session.sub };
  }
  // seo_team — assigned projects
  return {
    ...base,
    assignees: { some: { id: session.sub } },
  };
}

export function canMutateProjects(role: VynRankSessionPayload["role"]): boolean {
  return role === "ceo" || role === "seo_team";
}

export function canManageBilling(role: VynRankSessionPayload["role"]): boolean {
  return role === "ceo";
}

export function canManageSettings(role: VynRankSessionPayload["role"]): boolean {
  return role === "ceo";
}
