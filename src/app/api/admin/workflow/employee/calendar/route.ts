import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notSystemStaffWhere } from "@/lib/workflow-auth";
import { dateKey, scoreTasks } from "@/lib/workflow-progress";

export const dynamic = "force-dynamic";

/** Admin preview of an employee calendar — same scoring rules as /workflow. */
export async function GET(request: NextRequest) {
  try {
    const staffId = String(request.nextUrl.searchParams.get("staffId") || "").trim();
    if (!staffId) {
      return NextResponse.json({ error: "staffId required" }, { status: 400 });
    }

    const staff = await prisma.staffUser.findFirst({
      where: { id: staffId, ...notSystemStaffWhere() },
      select: { id: true },
    });
    if (!staff) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const year = Number(request.nextUrl.searchParams.get("year")) || new Date().getFullYear();
    const month = Number(request.nextUrl.searchParams.get("month")) || new Date().getMonth() + 1;
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const tasks = await prisma.workflowTask.findMany({
      where: {
        workDate: { gte: start, lt: end },
        OR: [{ assignedToId: staffId }, { createdById: staffId }],
      },
      select: { workDate: true, status: true, assignedToId: true },
    });

    const byDay: Record<string, string[]> = {};
    for (const t of tasks) {
      if (t.assignedToId !== staffId) continue;
      const key = dateKey(t.workDate);
      if (!byDay[key]) byDay[key] = [];
      byDay[key].push(t.status);
    }

    const createdOnly: Record<string, number> = {};
    for (const t of tasks) {
      if (t.assignedToId === staffId) continue;
      const key = dateKey(t.workDate);
      createdOnly[key] = (createdOnly[key] || 0) + 1;
    }

    const days: Record<string, { total: number; done: number; percent: number | null }> = {};
    for (const [key, statuses] of Object.entries(byDay)) {
      days[key] = scoreTasks(statuses);
    }
    for (const [key, extra] of Object.entries(createdOnly)) {
      if (!days[key]) {
        days[key] = { total: extra, done: 0, percent: null };
      } else {
        days[key] = { ...days[key], total: days[key].total + extra };
      }
    }

    return NextResponse.json({ year, month, days });
  } catch (error) {
    console.error("admin employee calendar", error);
    return NextResponse.json({ error: "Failed to load employee calendar" }, { status: 500 });
  }
}
