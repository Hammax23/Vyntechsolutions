import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureAdminWorkflowCreator, notSystemStaffWhere } from "@/lib/workflow-auth";
import { isValidIsoDate, mapTask, todayKey, utcDay, utcDayRange } from "@/lib/workflow-progress";

export const dynamic = "force-dynamic";

const STATUSES = new Set(["todo", "in_progress", "done", "blocked"]);
const PRIORITIES = new Set(["low", "medium", "high"]);

const includePeople = {
  createdBy: { select: { id: true, name: true, color: true } },
  assignedTo: { select: { id: true, name: true, color: true } },
};

export async function GET(request: NextRequest) {
  try {
    const staffId = request.nextUrl.searchParams.get("staffId");
    const date = request.nextUrl.searchParams.get("date");
    if (!staffId || !date) {
      return NextResponse.json({ error: "staffId and date required" }, { status: 400 });
    }
    if (!isValidIsoDate(date)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const tasks = await prisma.workflowTask.findMany({
      where: { assignedToId: staffId, workDate: utcDayRange(date) },
      include: includePeople,
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ tasks: tasks.map(mapTask) });
  } catch (error) {
    console.error("workflow day tasks", error);
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const title = String(body.title || "").trim();
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const assignedToId = String(body.assignedToId || "");
    if (!assignedToId) {
      return NextResponse.json({ error: "Select an employee" }, { status: 400 });
    }

    const assignee = await prisma.staffUser.findFirst({
      where: { id: assignedToId, isActive: true, ...notSystemStaffWhere() },
    });
    if (!assignee) {
      return NextResponse.json({ error: "Assignee not found or inactive" }, { status: 400 });
    }

    const dateRaw = String(body.workDate || "").slice(0, 10) || todayKey();
    if (!isValidIsoDate(dateRaw)) {
      return NextResponse.json({ error: "Invalid work date" }, { status: 400 });
    }

    const creator = await ensureAdminWorkflowCreator();
    const workDate = utcDay(dateRaw);
    const status = STATUSES.has(body.status) ? body.status : "todo";
    const priority = PRIORITIES.has(body.priority) ? body.priority : "medium";

    const task = await prisma.workflowTask.create({
      data: {
        title,
        description: body.description ? String(body.description) : null,
        status,
        priority,
        workDate,
        assignedToId: assignee.id,
        createdById: creator.id,
      },
      include: includePeople,
    });

    return NextResponse.json({ task: mapTask(task) });
  } catch (error) {
    console.error("admin assign task", error);
    return NextResponse.json({ error: "Failed to assign task" }, { status: 500 });

  }
}
