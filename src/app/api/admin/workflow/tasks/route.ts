import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureAdminWorkflowCreator, notSystemStaffWhere } from "@/lib/workflow-auth";
import { isValidIsoDate, mapTask, todayKey, utcDay, utcDayRange } from "@/lib/workflow-progress";
import { persistTaskFiles, removeTaskUploadDir } from "@/lib/workflow-attachments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STATUSES = new Set(["todo", "in_progress", "done", "blocked"]);
const PRIORITIES = new Set(["low", "medium", "high"]);

const includePeople = {
  createdBy: { select: { id: true, name: true, color: true } },
  assignedTo: { select: { id: true, name: true, color: true } },
  attachments: {
    include: { uploadedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" as const },
  },
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

async function parseAssignBody(request: NextRequest): Promise<{
  title: string;
  description: string;
  assignedToId: string;
  workDate: string;
  priority: string;
  status: string;
  files: File[];
}> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const files: File[] = [];
    const single = form.get("file");
    if (single instanceof File && single.size > 0) files.push(single);
    for (const value of form.getAll("files")) {
      if (value instanceof File && value.size > 0) files.push(value);
    }
    return {
      title: String(form.get("title") || "").trim(),
      description: String(form.get("description") || "").trim(),
      assignedToId: String(form.get("assignedToId") || "").trim(),
      workDate: String(form.get("workDate") || "").slice(0, 10) || todayKey(),
      priority: String(form.get("priority") || "medium"),
      status: String(form.get("status") || "todo"),
      files,
    };
  }

  const body = await request.json().catch(() => ({}));
  return {
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    assignedToId: String(body.assignedToId || "").trim(),
    workDate: String(body.workDate || "").slice(0, 10) || todayKey(),
    priority: String(body.priority || "medium"),
    status: String(body.status || "todo"),
    files: [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseAssignBody(request);
    if (!parsed.title) return NextResponse.json({ error: "Title required" }, { status: 400 });
    if (!parsed.assignedToId) {
      return NextResponse.json({ error: "Select an employee" }, { status: 400 });
    }

    const assignee = await prisma.staffUser.findFirst({
      where: { id: parsed.assignedToId, isActive: true, ...notSystemStaffWhere() },
    });
    if (!assignee) {
      return NextResponse.json({ error: "Assignee not found or inactive" }, { status: 400 });
    }

    if (!isValidIsoDate(parsed.workDate)) {
      return NextResponse.json({ error: "Invalid work date" }, { status: 400 });
    }

    const creator = await ensureAdminWorkflowCreator();
    const workDate = utcDay(parsed.workDate);
    const status = STATUSES.has(parsed.status) ? parsed.status : "todo";
    const priority = PRIORITIES.has(parsed.priority) ? parsed.priority : "medium";
    const now = new Date();

    const task = await prisma.workflowTask.create({
      data: {
        title: parsed.title,
        description: parsed.description || null,
        status,
        priority,
        workDate,
        assignedToId: assignee.id,
        createdById: creator.id,
        statusChangedAt: now,
        cycleStartedAt: now,
        startedAt: status === "in_progress" || status === "done" || status === "blocked" ? now : null,
        completedAt: status === "done" ? now : null,
        firstBlockedAt: status === "blocked" ? now : null,
      },
      include: includePeople,
    });

    if (parsed.files.length > 0) {
      try {
        await persistTaskFiles(task.id, creator.id, parsed.files);
      } catch (e) {
        await prisma.workflowTask.delete({ where: { id: task.id } }).catch(() => null);
        await removeTaskUploadDir(task.id);
        return NextResponse.json(
          { error: e instanceof Error ? e.message : "Attachment upload failed" },
          { status: 400 }
        );
      }
    }

    const full = await prisma.workflowTask.findUnique({
      where: { id: task.id },
      include: includePeople,
    });

    return NextResponse.json({ task: mapTask(full!) });
  } catch (error) {
    console.error("admin assign task", error);
    return NextResponse.json({ error: "Failed to assign task" }, { status: 500 });
  }
}
