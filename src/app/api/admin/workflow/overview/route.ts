import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notSystemStaffWhere } from "@/lib/workflow-auth";
import { dateKey, scoreTasks, todayKey, utcDay } from "@/lib/workflow-progress";

export async function GET(request: NextRequest) {
  try {
    const year = Number(request.nextUrl.searchParams.get("year")) || new Date().getFullYear();
    const month = Number(request.nextUrl.searchParams.get("month")) || new Date().getMonth() + 1;
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const staff = await prisma.staffUser.findMany({
      where: { isActive: true, ...notSystemStaffWhere() },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, color: true, role: true },
    });
    const staffIds = staff.map((s) => s.id);

    const tasks = await prisma.workflowTask.findMany({
      where: {
        workDate: { gte: start, lt: end },
        assignedToId: { in: staffIds },
      },
      select: { assignedToId: true, workDate: true, status: true },
    });

    const grid: Record<string, Record<string, { total: number; done: number; percent: number | null }>> = {};
    for (const s of staff) grid[s.id] = {};

    const buckets: Record<string, Record<string, string[]>> = {};
    for (const t of tasks) {
      const day = dateKey(t.workDate);
      if (!buckets[t.assignedToId]) buckets[t.assignedToId] = {};
      if (!buckets[t.assignedToId][day]) buckets[t.assignedToId][day] = [];
      buckets[t.assignedToId][day].push(t.status);
    }

    for (const [staffId, days] of Object.entries(buckets)) {
      if (!grid[staffId]) continue;
      for (const [day, statuses] of Object.entries(days)) {
        grid[staffId][day] = scoreTasks(statuses);
      }
    }

    // Align with browser/local business day used by assign forms (todayKey).
    const todayStart = utcDay(todayKey());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const todayTasks = await prisma.workflowTask.findMany({
      where: {
        workDate: { gte: todayStart, lt: todayEnd },
        assignedToId: { in: staffIds },
      },
      select: { assignedToId: true, status: true },
    });

    const todayByStaff: Record<string, string[]> = {};
    for (const t of todayTasks) {
      if (!todayByStaff[t.assignedToId]) todayByStaff[t.assignedToId] = [];
      todayByStaff[t.assignedToId].push(t.status);
    }

    const todayStrip = staff.map((s) => {
      const score = scoreTasks(todayByStaff[s.id] || []);
      return {
        ...s,
        ...score,
        idle: score.total === 0,
      };
    });

    const teamToday = scoreTasks(todayTasks.map((t) => t.status));

    return NextResponse.json({
      year,
      month,
      daysInMonth: new Date(Date.UTC(year, month, 0)).getUTCDate(),
      staff,
      grid,
      todayStrip,
      teamToday,
    });
  } catch (error) {
    console.error("workflow overview", error);
    return NextResponse.json({ error: "Failed to load overview" }, { status: 500 });
  }
}
