import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  isSessionResponse,
  requireVynRankNav,
  requireVynRankSession,
} from "@/lib/vynrank/auth-request";
import {
  canMutateProjects,
  projectsWhereForSession,
} from "@/lib/vynrank/project-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sessionOrRes = await requireVynRankSession(request);
  if (isSessionResponse(sessionOrRes)) return sessionOrRes;
  const session = sessionOrRes;

  const forbidden = requireVynRankNav(session, "tasks");
  if (forbidden) return forbidden;

  try {
    const tasks = await prisma.vynRankTask.findMany({
      where: { project: projectsWhereForSession(session) },
      include: {
        project: { select: { id: true, name: true, clientName: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    });
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("vynrank tasks list", error);
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sessionOrRes = await requireVynRankSession(request);
  if (isSessionResponse(sessionOrRes)) return sessionOrRes;
  const session = sessionOrRes;

  const forbidden = requireVynRankNav(session, "tasks");
  if (forbidden) return forbidden;

  if (!canMutateProjects(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      projectId?: string;
      title?: string;
      description?: string;
      priority?: string;
      assigneeId?: string | null;
      dueDate?: string | null;
      status?: string;
    };

    const projectId = String(body.projectId || "");
    const title = String(body.title || "").trim();
    if (!projectId || !title) {
      return NextResponse.json({ error: "projectId and title required" }, { status: 400 });
    }

    const project = await prisma.vynRankProject.findFirst({
      where: { id: projectId, ...projectsWhereForSession(session) },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const task = await prisma.vynRankTask.create({
      data: {
        projectId,
        title,
        description: body.description ? String(body.description) : null,
        priority: body.priority || "medium",
        status: body.status || "todo",
        assigneeId: body.assigneeId || (session.role === "seo_team" ? session.sub : null),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("vynrank tasks create", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const sessionOrRes = await requireVynRankSession(request);
  if (isSessionResponse(sessionOrRes)) return sessionOrRes;
  const session = sessionOrRes;

  const forbidden = requireVynRankNav(session, "tasks");
  if (forbidden) return forbidden;

  if (!canMutateProjects(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      id?: string;
      status?: string;
      title?: string;
      description?: string;
      priority?: string;
      assigneeId?: string | null;
      dueDate?: string | null;
    };

    const id = String(body.id || "");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const existing = await prisma.vynRankTask.findFirst({
      where: { id, project: projectsWhereForSession(session) },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (body.status) data.status = body.status;
    if (body.title) data.title = String(body.title).trim();
    if ("description" in body) data.description = body.description ? String(body.description) : null;
    if (body.priority) data.priority = body.priority;
    if ("assigneeId" in body) data.assigneeId = body.assigneeId || null;
    if ("dueDate" in body) data.dueDate = body.dueDate ? new Date(String(body.dueDate)) : null;

    const task = await prisma.vynRankTask.update({
      where: { id },
      data,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("vynrank tasks patch", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
