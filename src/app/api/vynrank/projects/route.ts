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

  const forbidden = requireVynRankNav(session, "projects");
  if (forbidden) return forbidden;

  try {
    const projects = await prisma.vynRankProject.findMany({
      where: projectsWhereForSession(session),
      include: {
        package: { select: { id: true, name: true, priceCad: true } },
        assignees: { select: { id: true, name: true, email: true, role: true } },
        clientUser: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("vynrank projects list", error);
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sessionOrRes = await requireVynRankSession(request);
  if (isSessionResponse(sessionOrRes)) return sessionOrRes;
  const session = sessionOrRes;

  const forbidden = requireVynRankNav(session, "projects");
  if (forbidden) return forbidden;

  if (!canMutateProjects(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      clientName?: string;
      packageId?: string | null;
      goal?: string;
      monthlyRevenue?: number;
      assigneeIds?: string[];
      clientUserId?: string | null;
      status?: string;
      phase?: string;
    };

    const name = String(body.name || "").trim();
    const clientName = String(body.clientName || "").trim();
    if (!name || !clientName) {
      return NextResponse.json(
        { error: "Project name and client name are required" },
        { status: 400 }
      );
    }

    const assigneeIds = Array.isArray(body.assigneeIds)
      ? body.assigneeIds.filter(Boolean)
      : session.role === "seo_team"
        ? [session.sub]
        : [];

    const project = await prisma.vynRankProject.create({
      data: {
        orgId: session.orgId,
        name,
        clientName,
        packageId: body.packageId || null,
        goal: body.goal ? String(body.goal) : null,
        monthlyRevenue: Number(body.monthlyRevenue || 0) || 0,
        clientUserId: body.clientUserId || null,
        status: body.status || "onboarding",
        phase: body.phase || "onboarding",
        health: "healthy",
        assignees:
          assigneeIds.length > 0
            ? { connect: assigneeIds.map((id) => ({ id })) }
            : undefined,
      },
      include: {
        package: { select: { id: true, name: true } },
        assignees: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("vynrank projects create", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
