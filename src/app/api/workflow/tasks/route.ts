import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  buildStatusTransition,
  mapTask,
  todayKey,
  isValidIsoDate,
  utcDay,
  utcDayRange,
  normalizeWorkLink,
} from "@/lib/workflow-progress";
import { notSystemStaffWhere, requireStaff } from "@/lib/workflow-auth";
import { persistTaskFiles, removeTaskUploadDir } from "@/lib/workflow-attachments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STATUSES = new Set(["todo", "in_progress", "done", "blocked"]);
const PRIORITIES = new Set(["low", "medium", "high"]);

const includePeople = {
  createdBy: { select: { id: true, name: true, color: true } },
  assignedTo: { select: { id: true, name: true, color: true } },
  project: { select: { id: true, projectName: true } },
  attachments: {
    include: { uploadedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" as const },
  },
};

function initialTiming(status: string, now = new Date()) {
  return {
    statusChangedAt: now,
    cycleStartedAt: now,
    startedAt: status === "in_progress" || status === "done" || status === "blocked" ? now : null,
    completedAt: status === "done" ? now : null,
    firstBlockedAt: status === "blocked" ? now : null,
    todoMs: 0,
    inProgressMs: 0,
    blockedMs: 0,
  };
}

async function parseCreateBody(request: NextRequest): Promise<{
  title: string;
  description: string;
  workLink: string;
  assignedToId: string;
  workDate: string;
  priority: string;
  status: string;
  projectId: string;
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
      workLink: String(form.get("workLink") || "").trim(),
      assignedToId: String(form.get("assignedToId") || "").trim(),
      workDate: String(form.get("workDate") || "").slice(0, 10) || todayKey(),
      priority: String(form.get("priority") || "medium"),
      status: String(form.get("status") || "todo"),
      projectId: String(form.get("projectId") || "").trim(),
      files,
    };
  }

  const body = await request.json().catch(() => ({}));
  return {
    title: String(body.title || "").trim(),
    description: body.description ? String(body.description) : "",
    workLink: body.workLink ? String(body.workLink) : "",
    assignedToId: String(body.assignedToId || "").trim(),
    workDate: String(body.workDate || "").slice(0, 10) || todayKey(),
    priority: String(body.priority || "medium"),
    status: String(body.status || "todo"),
    projectId: String(body.projectId || "").trim(),
    files: [],
  };
}

async function assertAssigneeOnProject(projectId: string, assigneeId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, status: true },
  });
  if (!project) {
    return { error: "Project not found", status: 400 as const };
  }
  if (project.status === "completed" || project.status === "on_hold") {
    return { error: "Project is not active", status: 400 as const };
  }
  const membership = await prisma.projectTeamMember.findUnique({
    where: {
      projectId_staffUserId: {
        projectId: project.id,
        staffUserId: assigneeId,
      },
    },
  });
  if (!membership) {
    return {
      error: "Assignee must be on this project team",
      status: 400 as const,
    };
  }
  return { projectId: project.id };
}

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

  const parsed = await parseCreateBody(request);
  if (!parsed.title) return NextResponse.json({ error: "Title required" }, { status: 400 });
  if (!parsed.projectId) {
    return NextResponse.json({ error: "Select a project" }, { status: 400 });
  }

  const assignedToId = parsed.assignedToId || me.id;
  const assignee = await prisma.staffUser.findFirst({
    where: { id: assignedToId, isActive: true, ...notSystemStaffWhere() },
  });
  if (!assignee) return NextResponse.json({ error: "Assignee not found" }, { status: 400 });

  const projectCheck = await assertAssigneeOnProject(parsed.projectId, assignee.id);
  if ("error" in projectCheck) {
    return NextResponse.json({ error: projectCheck.error }, { status: projectCheck.status });
  }

  if (!isValidIsoDate(parsed.workDate)) {
    return NextResponse.json({ error: "Invalid work date" }, { status: 400 });
  }
  const workDate = utcDay(parsed.workDate);
  const status = STATUSES.has(parsed.status) ? parsed.status : "todo";
  const priority = PRIORITIES.has(parsed.priority) ? parsed.priority : "medium";
  const now = new Date();

  if (!parsed.workLink.trim()) {
    return NextResponse.json({ error: "Work link is required" }, { status: 400 });
  }
  let workLink: string;
  try {
    const normalized = normalizeWorkLink(parsed.workLink);
    if (!normalized) {
      return NextResponse.json({ error: "Work link is required" }, { status: 400 });
    }
    workLink = normalized;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid work link" },
      { status: 400 }
    );
  }

  const task = await prisma.workflowTask.create({
    data: {
      title: parsed.title,
      description: parsed.description || null,
      workLink,
      status,
      priority,
      workDate,
      assignedToId: assignee.id,
      createdById: me.id,
      projectId: projectCheck.projectId,
      ...initialTiming(status, now),
    },
    include: includePeople,
  });

  if (parsed.files.length > 0) {
    try {
      await persistTaskFiles(task.id, me.id, parsed.files);
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

  const data: Record<string, unknown> = {};

  if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim();
  if (typeof body.description === "string") data.description = body.description || null;
  if (typeof body.workLink === "string") {
    try {
      data.workLink = normalizeWorkLink(body.workLink);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Invalid work link" },
        { status: 400 }
      );
    }
  }
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

  const nextProjectId =
    typeof body.projectId === "string" && body.projectId.trim()
      ? body.projectId.trim()
      : existing.projectId;
  const nextAssigneeId =
    typeof data.assignedToId === "string" ? data.assignedToId : existing.assignedToId;

  if (typeof body.projectId === "string" && body.projectId.trim()) {
    const projectCheck = await assertAssigneeOnProject(body.projectId.trim(), nextAssigneeId);
    if ("error" in projectCheck) {
      return NextResponse.json({ error: projectCheck.error }, { status: projectCheck.status });
    }
    data.projectId = projectCheck.projectId;
  } else if (
    typeof data.assignedToId === "string" &&
    nextProjectId &&
    data.assignedToId !== existing.assignedToId
  ) {
    const projectCheck = await assertAssigneeOnProject(nextProjectId, nextAssigneeId);
    if ("error" in projectCheck) {
      return NextResponse.json({ error: projectCheck.error }, { status: projectCheck.status });
    }
  }

  if (STATUSES.has(body.status) && body.status !== existing.status) {
    Object.assign(
      data,
      buildStatusTransition(
        {
          status: existing.status,
          statusChangedAt: existing.statusChangedAt,
          cycleStartedAt: existing.cycleStartedAt,
          startedAt: existing.startedAt,
          completedAt: existing.completedAt,
          firstBlockedAt: existing.firstBlockedAt,
          todoMs: existing.todoMs,
          inProgressMs: existing.inProgressMs,
          blockedMs: existing.blockedMs,
          createdAt: existing.createdAt,
        },
        body.status
      )
    );
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
  await removeTaskUploadDir(id);
  return NextResponse.json({ success: true });
}
