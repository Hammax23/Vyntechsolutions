import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mapTask } from "@/lib/workflow-progress";

export const dynamic = "force-dynamic";

const includeTask = {
  createdBy: { select: { id: true, name: true, color: true } },
  assignedTo: { select: { id: true, name: true, color: true } },
  project: { select: { id: true, projectName: true } },
  attachments: {
    include: { uploadedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" as const },
  },
};

export async function GET(request: NextRequest) {
  try {
    const projectId = String(request.nextUrl.searchParams.get("projectId") || "").trim();
    if (!projectId) {
      return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const limitRaw = Number(request.nextUrl.searchParams.get("limit") || 50);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 50;

    const tasks = await prisma.workflowTask.findMany({
      where: { projectId },
      include: includeTask,
      orderBy: [{ workDate: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    return NextResponse.json({ tasks: tasks.map(mapTask) });
  } catch (error) {
    console.error("project workflow-tasks GET", error);
    return NextResponse.json({ error: "Failed to load project tasks" }, { status: 500 });
  }
}
