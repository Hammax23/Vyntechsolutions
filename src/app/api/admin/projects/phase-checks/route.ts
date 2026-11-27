import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  projectInclude,
  syncProjectProgress,
} from "@/lib/admin/seed-project-workflow";
import { actorNameFromRequest } from "@/lib/admin/actor";
import { normalizeProjectStatus } from "@/lib/admin/project-workflow";

export const dynamic = "force-dynamic";

async function projectPayload(projectId: string) {
  await syncProjectProgress(projectId);
  return prisma.project.findUnique({
    where: { id: projectId },
    include: projectInclude,
  });
}

/** POST — add a checklist item for a project phase */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const actor = await actorNameFromRequest(request);
    const projectId = String(data.projectId || "").trim();
    const label = String(data.label || "").trim();
    const phase = normalizeProjectStatus(String(data.phase || ""));

    if (!projectId) {
      return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }
    if (!label) {
      return NextResponse.json({ error: "Checklist label is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const maxSort = await prisma.projectPhaseCheck.aggregate({
      where: { projectId, phase },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

    await prisma.projectPhaseCheck.create({
      data: {
        projectId,
        phase,
        label,
        done: false,
        sortOrder,
      },
    });

    await prisma.activityLog.create({
      data: {
        projectId,
        action: `Checklist item added (${phase}): ${label}`,
        user: actor,
      },
    });

    const full = await projectPayload(projectId);
    return NextResponse.json({ project: full });
  } catch (error) {
    console.error("phase-check POST", error);
    return NextResponse.json({ error: "Failed to add checklist item" }, { status: 500 });
  }
}

/** PATCH — toggle done and/or rename label */
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const id = String(data.id || "");
    const actor = await actorNameFromRequest(request);
    if (!id) {
      return NextResponse.json({ error: "Check ID is required" }, { status: 400 });
    }

    const existing = await prisma.projectPhaseCheck.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Check not found" }, { status: 404 });
    }

    const update: { done?: boolean; label?: string } = {};
    if (typeof data.done === "boolean") {
      update.done = data.done;
    } else if (data.label === undefined) {
      update.done = !existing.done;
    }
    if (typeof data.label === "string") {
      const label = data.label.trim();
      if (!label) {
        return NextResponse.json({ error: "Label cannot be empty" }, { status: 400 });
      }
      update.label = label;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await prisma.projectPhaseCheck.update({
      where: { id },
      data: update,
    });

    if (update.done !== undefined && update.done !== existing.done) {
      await prisma.activityLog.create({
        data: {
          projectId: existing.projectId,
          action: `${update.done ? "Checked" : "Unchecked"}: ${updated.label}`,
          user: actor,
        },
      });
    }
    if (update.label && update.label !== existing.label) {
      await prisma.activityLog.create({
        data: {
          projectId: existing.projectId,
          action: `Checklist renamed: "${existing.label}" → "${update.label}"`,
          user: actor,
        },
      });
    }

    const project = await projectPayload(existing.projectId);
    return NextResponse.json({ project });
  } catch (error) {
    console.error("phase-check PATCH", error);
    return NextResponse.json({ error: "Failed to update checklist" }, { status: 500 });
  }
}

/** DELETE — remove a checklist item */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const actor = await actorNameFromRequest(request);
    if (!id) {
      return NextResponse.json({ error: "Check ID is required" }, { status: 400 });
    }

    const existing = await prisma.projectPhaseCheck.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Check not found" }, { status: 404 });
    }

    await prisma.projectPhaseCheck.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        projectId: existing.projectId,
        action: `Checklist item removed: ${existing.label}`,
        user: actor,
      },
    });

    const project = await projectPayload(existing.projectId);
    return NextResponse.json({ project });
  } catch (error) {
    console.error("phase-check DELETE", error);
    return NextResponse.json({ error: "Failed to delete checklist item" }, { status: 500 });
  }
}
