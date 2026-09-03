import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/workflow-auth";
import { dateKey, scoreTasks } from "@/lib/workflow-progress";

export async function GET(request: NextRequest) {
  const me = await requireStaff();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const year = Number(request.nextUrl.searchParams.get("year")) || new Date().getFullYear();
  const month = Number(request.nextUrl.searchParams.get("month")) || new Date().getMonth() + 1;
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  // Match day-board visibility: tasks assigned to me OR created by me.
  const tasks = await prisma.workflowTask.findMany({
    where: {
      workDate: { gte: start, lt: end },
      OR: [{ assignedToId: me.id }, { createdById: me.id }],
    },
    select: { workDate: true, status: true, assignedToId: true },
  });

  const byDay: Record<string, string[]> = {};
  for (const t of tasks) {
    // Progress color = assigned-to-me only; outbound-only days still get a count via total.
    if (t.assignedToId !== me.id) continue;
    const key = dateKey(t.workDate);
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(t.status);
  }

  const createdOnly: Record<string, number> = {};
  for (const t of tasks) {
    if (t.assignedToId === me.id) continue;
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
}
