import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS_PER_TASK } from "@/lib/workflow-attachments-limits";

export { MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS_PER_TASK };

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "workflow");

export type AttachmentPublic = {
  id: string;
  taskId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  uploadedBy?: { id: string; name: string } | null;
};

export function mapAttachment(a: {
  id: string;
  taskId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
  uploadedBy?: { id: string; name: string } | null;
}): AttachmentPublic {
  return {
    id: a.id,
    taskId: a.taskId,
    fileName: a.fileName,
    mimeType: a.mimeType,
    sizeBytes: a.sizeBytes,
    createdAt: a.createdAt.toISOString(),
    uploadedBy: a.uploadedBy || null,
  };
}

/** Keep a readable extension; strip path tricks from the original name. */
export function sanitizeOriginalName(name: string): string {
  const base = path.basename(String(name || "file")).replace(/[<>:"|?*\u0000-\u001f]/g, "_").trim();
  const cleaned = base.replace(/\.+/g, ".").slice(0, 180);
  return cleaned || "file";
}

function extensionOf(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  if (!ext || ext.length > 12) return "";
  if (!/^\.[a-z0-9._+-]+$/i.test(ext)) return "";
  return ext;
}

export function makeStoredName(originalName: string): string {
  const ext = extensionOf(originalName);
  return `${Date.now().toString(36)}_${randomBytes(8).toString("hex")}${ext}`;
}

export function attachmentDiskPath(taskId: string, storedName: string): string {
  const safeTask = taskId.replace(/[^a-zA-Z0-9_-]/g, "");
  const safeStored = path.basename(storedName);
  return path.join(UPLOAD_ROOT, safeTask, safeStored);
}

export async function ensureTaskUploadDir(taskId: string): Promise<string> {
  const dir = path.join(UPLOAD_ROOT, taskId.replace(/[^a-zA-Z0-9_-]/g, ""));
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function saveUploadedFile(taskId: string, storedName: string, file: File): Promise<number> {
  await ensureTaskUploadDir(taskId);
  const dest = attachmentDiskPath(taskId, storedName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(dest, buffer);
  return buffer.length;
}

export async function removeAttachmentFile(taskId: string, storedName: string): Promise<void> {
  try {
    await fs.unlink(attachmentDiskPath(taskId, storedName));
  } catch {
    /* missing file is fine */
  }
}

export async function removeTaskUploadDir(taskId: string): Promise<void> {
  try {
    await fs.rm(path.join(UPLOAD_ROOT, taskId.replace(/[^a-zA-Z0-9_-]/g, "")), { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

export const attachmentInclude = {
  uploadedBy: { select: { id: true, name: true } },
} as const;

export const taskAttachmentsInclude = {
  attachments: {
    include: attachmentInclude,
    orderBy: { createdAt: "asc" as const },
  },
};

/** Persist browser File objects for a task; rolls back DB + disk on failure. */
export async function persistTaskFiles(taskId: string, uploadedById: string, files: File[]) {
  const incoming = files.filter((f) => f instanceof File && f.size > 0);
  if (incoming.length === 0) return [] as AttachmentPublic[];
  if (incoming.length > MAX_ATTACHMENTS_PER_TASK) {
    throw new Error(`Maximum ${MAX_ATTACHMENTS_PER_TASK} attachments per task`);
  }

  const existingCount = await prisma.workflowAttachment.count({ where: { taskId } });
  if (existingCount + incoming.length > MAX_ATTACHMENTS_PER_TASK) {
    throw new Error(`Maximum ${MAX_ATTACHMENTS_PER_TASK} attachments per task`);
  }

  const created: Array<{ id: string; storedName: string; public: AttachmentPublic }> = [];
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
          uploadedById,
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
    throw e;
  }

  await prisma.workflowTask.update({
    where: { id: taskId },
    data: { updatedAt: new Date() },
  });

  return created.map((c) => c.public);
}

export function contentDisposition(fileName: string, mode: "inline" | "attachment" = "attachment"): string {
  const safe = sanitizeOriginalName(fileName).replace(/"/g, "");
  const encoded = encodeURIComponent(safe);
  return `${mode}; filename="${safe}"; filename*=UTF-8''${encoded}`;
}
