import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notSystemStaffWhere } from "@/lib/workflow-auth";
import { dateKey, scoreTasks } from "@/lib/workflow-progress";
import { daysInResolvedPeriod, resolveProgressPeriod } from "@/lib/admin/workflow-period";
import { renderWorkflowProgressPdf } from "@/lib/admin/render-workflow-progress-pdf";
import type {
  ProgressReportData,
  ProgressReportDay,
  ProgressReportTask,
} from "@/lib/admin/workflow-progress-report-types";

export const dynamic = "force-dynamic";

function makeReportId(staffId: string) {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return `PR-${stamp}-${staffId.slice(-4).toUpperCase()}`;
}

function safeFilenamePart(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "Employee";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const staffId = String(body.staffId || "").trim();

    if (!staffId) {
      return NextResponse.json({ error: "Select an employee" }, { status: 400 });
    }

    const staff = await prisma.staffUser.findFirst({
      where: { id: staffId, ...notSystemStaffWhere() },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    if (!staff) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const period = resolveProgressPeriod(body);
    if ("error" in period) {
      return NextResponse.json({ error: period.error }, { status: period.status });
    }

    const tasks = await prisma.workflowTask.findMany({
      where: {
        assignedToId: staff.id,
        workDate: { gte: period.rangeStart, lt: period.rangeEndExclusive },
      },
      include: {
        createdBy: { select: { name: true } },
      },
      orderBy: [{ workDate: "asc" }, { createdAt: "asc" }],
      take: 2000,
    });

    const byDay: Record<string, typeof tasks> = {};
    for (const t of tasks) {
      const key = dateKey(t.workDate);
      if (!byDay[key]) byDay[key] = [];
      byDay[key].push(t);
    }

    const dayKeys = Object.keys(byDay).sort();
    const days: ProgressReportDay[] = dayKeys.map((key) => {
      const list = byDay[key];
      const statuses = list.map((t) => t.status);
      const score = scoreTasks(statuses);
      const mapped: ProgressReportTask[] = list.map((t) => ({
        id: t.id,
        title: t.title,
        description: (t.description || "").slice(0, 280),
        status: t.status,
        priority: t.priority || "medium",
        workDate: key,
        createdByName: t.createdBy?.name || "System",
      }));
      return {
        date: key,
        total: score.total,
        done: score.done,
        inProgress: statuses.filter((x) => x === "in_progress").length,
        todo: statuses.filter((x) => x === "todo").length,
        blocked: statuses.filter((x) => x === "blocked").length,
        percent: score.percent,
        tasks: mapped,
      };
    });

    const allStatuses = tasks.map((t) => t.status);
    const summaryScore = scoreTasks(allStatuses);
    const report: ProgressReportData = {
      reportId: makeReportId(staff.id),
      generatedAt: new Date().toISOString(),
      mode: period.mode,
      periodLabel: period.periodLabel,
      periodFrom: period.fromIso,
      periodTo: period.toIso,
      employee: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
      summary: {
        totalTasks: summaryScore.total,
        done: summaryScore.done,
        inProgress: allStatuses.filter((x) => x === "in_progress").length,
        todo: allStatuses.filter((x) => x === "todo").length,
        blocked: allStatuses.filter((x) => x === "blocked").length,
        percent: summaryScore.percent,
        activeDays: days.length,
        daysInPeriod: daysInResolvedPeriod(period),
      },
      days,
    };

    const pdfBuffer = await renderWorkflowProgressPdf(report);
    const filename = `VynTech-Progress-${safeFilenamePart(staff.name)}-${period.fromIso}${
      period.fromIso !== period.toIso ? `_to_${period.toIso}` : ""
    }.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("workflow progress report", error);
    return NextResponse.json({ error: "Failed to generate progress report" }, { status: 500 });

  }
}
