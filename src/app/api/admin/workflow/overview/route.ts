import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notSystemStaffWhere } from "@/lib/workflow-auth";
import { dateKey, scoreTasks, todayKey, utcDay } from "@/lib/workflow-progress";

export const dynamic = "force-dynamic";

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
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        assignedToId: true,
        projectId: true,
        project: { select: { id: true, projectName: true } },
        assignedTo: { select: { id: true, name: true, color: true } },
      },
      orderBy: [{ createdAt: "desc" }],
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

    type ProjectBucket = {
      projectId: string | null;
      projectName: string;
      total: number;
      done: number;
      inProgress: number;
      todo: number;
      blocked: number;
      percent: number | null;
      people: { id: string; name: string; color: string }[];
      tasks: {
        id: string;
        title: string;
        status: string;
        priority: string;
        assigneeName: string;
        assigneeId: string;
      }[];
    };

    const projectMap = new Map<string, ProjectBucket>();
    for (const t of todayTasks) {
      const key = t.projectId || "__none__";
      let bucket = projectMap.get(key);
      if (!bucket) {
        bucket = {
          projectId: t.projectId,
          projectName: t.project?.projectName || "No project",
          total: 0,
          done: 0,
          inProgress: 0,
          todo: 0,
          blocked: 0,
          percent: null,
          people: [],
          tasks: [],
        };
        projectMap.set(key, bucket);
      }
      bucket.total += 1;
      if (t.status === "done") bucket.done += 1;
      else if (t.status === "in_progress") bucket.inProgress += 1;
      else if (t.status === "blocked") bucket.blocked += 1;
      else bucket.todo += 1;
      if (t.assignedTo && !bucket.people.some((p) => p.id === t.assignedTo!.id)) {
        bucket.people.push({
          id: t.assignedTo.id,
          name: t.assignedTo.name,
          color: t.assignedTo.color,
        });
      }
      bucket.tasks.push({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        assigneeName: t.assignedTo?.name || "—",
        assigneeId: t.assignedToId,
      });
    }

    const todayByProject = Array.from(projectMap.values())
      .map((b) => {
        const score = scoreTasks(
          b.tasks.map((t) => t.status)
        );
        return { ...b, percent: score.percent, done: score.done, total: score.total };
      })
      .sort((a, b) => {
        if (a.projectId === null) return 1;
        if (b.projectId === null) return -1;
        return a.projectName.localeCompare(b.projectName);
      });

    return NextResponse.json({
      year,
      month,
      daysInMonth: new Date(Date.UTC(year, month, 0)).getUTCDate(),
      staff,
      grid,
      todayStrip,
      teamToday,
      todayKey: todayKey(),
      todayByProject,
    });
  } catch (error) {
    console.error("workflow overview", error);
    return NextResponse.json({ error: "Failed to load overview" }, { status: 500 });

  }
}
