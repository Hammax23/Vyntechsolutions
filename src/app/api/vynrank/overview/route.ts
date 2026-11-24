import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  isSessionResponse,
  requireVynRankNav,
  requireVynRankSession,
} from "@/lib/vynrank/auth-request";
import { projectsWhereForSession } from "@/lib/vynrank/project-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sessionOrRes = await requireVynRankSession(request);
  if (isSessionResponse(sessionOrRes)) return sessionOrRes;
  const session = sessionOrRes;

  const forbidden = requireVynRankNav(session, "command_center");
  if (forbidden) return forbidden;

  try {
    const where = projectsWhereForSession(session);
    const [projects, taskCounts, openTasks] = await Promise.all([
      prisma.vynRankProject.findMany({
        where,
        include: {
          package: { select: { id: true, name: true } },
          assignees: { select: { id: true, name: true, role: true } },
          _count: { select: { tasks: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.vynRankTask.groupBy({
        by: ["status"],
        where: { project: where },
        _count: { _all: true },
      }),
      prisma.vynRankTask.findMany({
        where: {
          project: where,
          status: { in: ["todo", "in_progress", "submitted", "qa"] },
        },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
    ]);

    const health = {
      healthy: projects.filter((p) => p.health === "healthy").length,
      attention: projects.filter((p) => p.health === "attention").length,
      at_risk: projects.filter((p) => p.health === "at_risk").length,
    };

    const mrr = projects.reduce((sum, p) => sum + (p.monthlyRevenue || 0), 0);
    const organicTraffic = projects.reduce((sum, p) => sum + (p.organicTraffic || 0), 0);
    const keywordsTop10 = projects.reduce((sum, p) => sum + (p.keywordsTop10 || 0), 0);
    const organicLeads = projects.reduce((sum, p) => sum + (p.organicLeads || 0), 0);

    const tasksByStatus = Object.fromEntries(
      taskCounts.map((row) => [row.status, row._count._all])
    );

    return NextResponse.json({
      kpis: {
        activeProjects: projects.filter((p) => p.status === "active" || p.status === "onboarding")
          .length,
        mrr,
        organicTraffic,
        keywordsTop10,
        organicLeads,
        openTasks: openTasks.length,
      },
      health,
      tasksByStatus,
      recentProjects: projects.slice(0, 6).map((p) => ({
        id: p.id,
        name: p.name,
        clientName: p.clientName,
        status: p.status,
        health: p.health,
        phase: p.phase,
        monthlyRevenue: p.monthlyRevenue,
        packageName: p.package?.name || null,
        assignees: p.assignees,
        taskCount: p._count.tasks,
      })),
      attentionTasks: openTasks,
    });
  } catch (error) {
    console.error("vynrank overview", error);
    return NextResponse.json({ error: "Failed to load overview" }, { status: 500 });
  }
}
