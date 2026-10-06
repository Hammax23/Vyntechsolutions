import prisma from "@/lib/prisma";
import {
  buildMissingPhaseCheckCreates,
  buildPaymentCreates,
  buildPhaseCheckCreates,
  normalizeProjectStatus,
} from "@/lib/admin/project-workflow";

const projectInclude = {
  tasks: true,
  milestones: true,
  notes: true,
  activityLogs: { orderBy: { timestamp: "desc" as const } },
  phaseChecks: { orderBy: { sortOrder: "asc" as const } },
  payments: { orderBy: { sortOrder: "asc" as const } },
};

export { projectInclude };

/** Seed checklist + payment rows if missing (lazy backfill for older projects). */
export async function ensureProjectWorkflow(projectId: string, budget?: number) {
  const existing = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      budget: true,
      status: true,
      phaseChecks: { select: { phase: true, sortOrder: true } },
      _count: { select: { phaseChecks: true, payments: true } },
    },
  });
  if (!existing) return null;

  const normalized = normalizeProjectStatus(existing.status);
  if (existing.status !== normalized) {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: normalized },
    });
  }

  if (existing._count.phaseChecks === 0) {
    await prisma.projectPhaseCheck.createMany({
      data: buildPhaseCheckCreates(projectId),
    });
  } else {
    const maxSort = existing.phaseChecks.reduce(
      (m, row) => Math.max(m, row.sortOrder ?? 0),
      0
    );
    const missing = buildMissingPhaseCheckCreates(
      projectId,
      existing.phaseChecks.map((c) => c.phase),
      maxSort + 10
    );
    if (missing.length > 0) {
      await prisma.projectPhaseCheck.createMany({ data: missing });
    }
  }

  if (existing._count.payments === 0) {
    const amountBudget = typeof budget === "number" ? budget : existing.budget;
    await prisma.projectPayment.createMany({
      data: buildPaymentCreates(projectId, amountBudget),
    });
  }

  return prisma.project.findUnique({
    where: { id: projectId },
    include: projectInclude,
  });
}

export async function seedNewProjectWorkflow(projectId: string, budget: number) {
  await prisma.projectPhaseCheck.createMany({
    data: buildPhaseCheckCreates(projectId),
  });
  await prisma.projectPayment.createMany({
    data: buildPaymentCreates(projectId, budget),
  });
  await prisma.activityLog.create({
    data: {
      projectId,
      action: "Workflow seeded (SDLC checklist + payment milestones)",
      user: "Admin",
    },
  });
}
