import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mapTask, todayKey, isValidIsoDate, utcDay, utcDayRange } from "@/lib/workflow-progress";
import { notSystemStaffWhere, requireStaff } from "@/lib/workflow-auth";

const STATUSES = new Set(["todo", "in_progress", "done", "blocked"]);
const PRIORITIES = new Set(["low", "medium", "high"]);

const includePeople = {
  createdBy: { select: { id: true, name: true, color: true } },
  assignedTo: { select: { id: true, name: true, color: true } },
};

export async function GET(request: NextRequest) {
  const me = await requireStaff();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = request.nextUrl.searchParams.get("date");
  const inbox = request.nextUrl.searchParams.get("inbox") === "1";

  const visibility = {
    OR: [{ assignedToId: me.id }, { createdById: me.id }],
  };

  const where = inbox
    ? { assignedToId: me.id, createdById: { not: me.id }, status: { not: "done" } }
    : date
      ? { ...visibility, workDate: utcDayRange(date) }
      : visibility;

  const tasks = await prisma.workflowTask.findMany({
    where,
    include: includePeople,
    orderBy: [{ workDate: "asc" }, { createdAt: "desc" }],
    take: date || inbox ? 200 : 80,
  });

  return NextResponse.json({ tasks: tasks.map(mapTask) });
}

export async function POST(request: NextRequest) {
  const me = await requireStaff();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const assignedToId = String(body.assignedToId || me.id);
  const assignee = await prisma.staffUser.findFirst({
    where: { id: assignedToId, isActive: true, ...notSystemStaffWhere() },
  });
  if (!assignee) return NextResponse.json({ error: "Assignee not found" }, { status: 400 });

  const dateRaw = String(body.workDate || "").slice(0, 10) || todayKey();
  if (!isValidIsoDate(dateRaw)) {
    return NextResponse.json({ error: "Invalid work date" }, { status: 400 });
  }
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
      createdById: me.id,
    },
    include: includePeople,
  });

  return NextResponse.json({ task: mapTask(task) });
}

export async function PATCH(request: NextRequest) {
  const me = await requireStaff();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const existing = await prisma.workflowTask.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.assignedToId !== me.id && existing.createdById !== me.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data: {
    title?: string;
    description?: string | null;
    status?: string;
    priority?: string;
    workDate?: Date;
    assignedToId?: string;
  } = {};

  if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim();
  if (typeof body.description === "string") data.description = body.description || null;
  if (STATUSES.has(body.status)) data.status = body.status;
  if (PRIORITIES.has(body.priority)) data.priority = body.priority;
  if (typeof body.workDate === "string" && body.workDate) {
    const d = body.workDate.slice(0, 10);
    if (!isValidIsoDate(d)) return NextResponse.json({ error: "Invalid work date" }, { status: 400 });
    data.workDate = utcDay(d);
  }
  if (typeof body.assignedToId === "string" && body.assignedToId) {
    const assignee = await prisma.staffUser.findFirst({
      where: { id: body.assignedToId, isActive: true, ...notSystemStaffWhere() },
    });
    if (!assignee) return NextResponse.json({ error: "Assignee not found" }, { status: 400 });
    data.assignedToId = assignee.id;
  }

  const task = await prisma.workflowTask.update({
    where: { id },
    data,
    include: includePeople,
  });

  return NextResponse.json({ task: mapTask(task) });
}

export async function DELETE(request: NextRequest) {
  const me = await requireStaff();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const existing = await prisma.workflowTask.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.createdById !== me.id && existing.assignedToId !== me.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.workflowTask.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
