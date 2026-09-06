import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/workflow-auth";
import {
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS_PER_TASK,
  attachmentDiskPath,
  attachmentInclude,
  contentDisposition,
  makeStoredName,
  mapAttachment,
  removeAttachmentFile,
  sanitizeOriginalName,
  saveUploadedFile,
} from "@/lib/workflow-attachments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function canAccessTask(staffId: string, taskId: string) {
  return prisma.workflowTask.findFirst({
    where: {
      id: taskId,
      OR: [{ assignedToId: staffId }, { createdById: staffId }],
    },
    select: { id: true, assignedToId: true, createdById: true },
  });
}

/** POST multipart: taskId + file(s) field "file" or "files" */
export async function POST(request: NextRequest) {
  const me = await requireStaff();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const taskId = String(form.get("taskId") || "").trim();
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

  const task = await canAccessTask(me.id, taskId);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const existingCount = await prisma.workflowAttachment.count({ where: { taskId } });
  const incoming: File[] = [];
  const single = form.get("file");
  if (single instanceof File && single.size > 0) incoming.push(single);
  for (const value of form.getAll("files")) {
    if (value instanceof File && value.size > 0) incoming.push(value);
  }
  if (incoming.length === 0) {
    return NextResponse.json({ error: "Choose at least one file" }, { status: 400 });
  }
  if (existingCount + incoming.length > MAX_ATTACHMENTS_PER_TASK) {
    return NextResponse.json(
      { error: `Maximum ${MAX_ATTACHMENTS_PER_TASK} attachments per task` },
      { status: 400 }
    );
  }

  const created: Array<{ id: string; storedName: string; public: ReturnType<typeof mapAttachment> }> = [];
  try {
    for (const file of incoming) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        throw new Error(`“${file.name}” is too large (max 25 MB)`);
      }
      const fileName = sanitizeOriginalName(file.name || "file");
      const storedName = makeStoredName(fileName);
      const sizeBytes = await saveUploadedFile(taskId, storedName, file);
      const row = await prisma.workflowAttachment.create({
        data: {
          taskId,
          uploadedById: me.id,
          fileName,
          storedName,
          mimeType: file.type || "application/octet-stream",
          sizeBytes,
        },
        include: attachmentInclude,
      });
      created.push({ id: row.id, storedName, public: mapAttachment(row) });
    }
  } catch (e) {
    for (const item of created) {
      await prisma.workflowAttachment.delete({ where: { id: item.id } }).catch(() => null);
      await removeAttachmentFile(taskId, item.storedName);
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 400 }
    );
  }

  await prisma.workflowTask.update({
    where: { id: taskId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ attachments: created.map((c) => c.public) });
}

export async function GET(request: NextRequest) {
  const me = await requireStaff();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  const taskId = request.nextUrl.searchParams.get("taskId");

  if (id) {
    const row = await prisma.workflowAttachment.findUnique({
      where: { id },
      include: { ...attachmentInclude, task: { select: { assignedToId: true, createdById: true } } },
    });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (row.task.assignedToId !== me.id && row.task.createdById !== me.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const disk = attachmentDiskPath(row.taskId, row.storedName);
    const data = await fs.readFile(disk).catch(() => null);
    if (!data) return NextResponse.json({ error: "File missing on server" }, { status: 404 });
    const openInline = request.nextUrl.searchParams.get("open") === "1";
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": row.mimeType || "application/octet-stream",
        "Content-Length": String(data.length),
        "Content-Disposition": contentDisposition(row.fileName, openInline ? "inline" : "attachment"),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  if (!taskId) return NextResponse.json({ error: "taskId or id required" }, { status: 400 });
  const task = await canAccessTask(me.id, taskId);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const rows = await prisma.workflowAttachment.findMany({
    where: { taskId },
    include: attachmentInclude,
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ attachments: rows.map(mapAttachment) });
}

export async function DELETE(request: NextRequest) {
  const me = await requireStaff();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const row = await prisma.workflowAttachment.findUnique({
    where: { id },
    include: { task: { select: { assignedToId: true, createdById: true } } },
  });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.task.assignedToId !== me.id && row.task.createdById !== me.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.workflowAttachment.delete({ where: { id } });
  await removeAttachmentFile(row.taskId, row.storedName);
  await prisma.workflowTask.update({
    where: { id: row.taskId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
