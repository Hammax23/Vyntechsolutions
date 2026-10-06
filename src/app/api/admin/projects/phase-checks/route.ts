import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureProjectWorkflow, projectInclude } from "@/lib/admin/seed-project-workflow";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const id = String(data.id || "");
    if (!id) {
      return NextResponse.json({ error: "Check ID is required" }, { status: 400 });
    }

    const existing = await prisma.projectPhaseCheck.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Check not found" }, { status: 404 });
    }

    const done = typeof data.done === "boolean" ? data.done : !existing.done;
    await prisma.projectPhaseCheck.update({
      where: { id },
      data: { done },
    });

    await prisma.activityLog.create({
      data: {
        projectId: existing.projectId,
        action: `${done ? "Checked" : "Unchecked"}: ${existing.label}`,
        user: "Admin",
      },
    });

    await ensureProjectWorkflow(existing.projectId);
    const project = await prisma.project.findUnique({
      where: { id: existing.projectId },
      include: projectInclude,
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("phase-check PATCH", error);
    return NextResponse.json({ error: "Failed to update checklist" }, { status: 500 });
  }
}
