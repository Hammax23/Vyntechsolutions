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

type Ctx = { params: { id: string } };

export async function GET(request: NextRequest, { params }: Ctx) {
  const sessionOrRes = await requireVynRankSession(request);
  if (isSessionResponse(sessionOrRes)) return sessionOrRes;
  const session = sessionOrRes;

  const forbidden = requireVynRankNav(session, "projects");
  if (forbidden) return forbidden;

  try {
    const project = await prisma.vynRankProject.findFirst({
      where: { id: params.id, ...projectsWhereForSession(session) },
      include: {
        package: true,
        assignees: { select: { id: true, name: true, email: true, role: true } },
        clientUser: { select: { id: true, name: true, email: true } },
        tasks: {
          include: { assignee: { select: { id: true, name: true } } },
          orderBy: { updatedAt: "desc" },
        },
      },
    });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (error) {
    console.error("vynrank project get", error);
    return NextResponse.json({ error: "Failed to load project" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const sessionOrRes = await requireVynRankSession(request);
  if (isSessionResponse(sessionOrRes)) return sessionOrRes;
  const session = sessionOrRes;

  const forbidden = requireVynRankNav(session, "projects");
  if (forbidden) return forbidden;

  if (!canMutateProjects(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const existing = await prisma.vynRankProject.findFirst({
      where: { id: params.id, ...projectsWhereForSession(session) },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const data: Record<string, unknown> = {};
    for (const key of [
      "name",
      "clientName",
      "status",
      "health",
      "phase",
      "goal",
      "notes",
      "packageId",
      "clientUserId",
    ]) {
      if (key in body) data[key] = body[key];
    }
    if ("monthlyRevenue" in body) data.monthlyRevenue = Number(body.monthlyRevenue) || 0;
    if ("organicTraffic" in body) data.organicTraffic = Number(body.organicTraffic) || 0;
    if ("keywordsTop10" in body) data.keywordsTop10 = Number(body.keywordsTop10) || 0;
    if ("organicLeads" in body) data.organicLeads = Number(body.organicLeads) || 0;
    if ("clientRating" in body) {
      data.clientRating =
        body.clientRating === null || body.clientRating === ""
          ? null
          : Number(body.clientRating);
    }

    if (Array.isArray(body.assigneeIds) && session.role === "ceo") {
      data.assignees = {
        set: (body.assigneeIds as string[]).filter(Boolean).map((id) => ({ id })),
      };
    }

    const project = await prisma.vynRankProject.update({
      where: { id: params.id },
      data,
      include: {
        package: { select: { id: true, name: true } },
        assignees: { select: { id: true, name: true, role: true } },
        tasks: {
          include: { assignee: { select: { id: true, name: true } } },
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("vynrank project patch", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}
