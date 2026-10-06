import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notSystemStaffWhere } from "@/lib/workflow-auth";

export const dynamic = "force-dynamic";

function mapMember(m: {
  staffUser: { id: string; name: string; email: string; color: string; isActive: boolean };
}) {
  return {
    id: m.staffUser.id,
    name: m.staffUser.name,
    email: m.staffUser.email,
    color: m.staffUser.color,
    isActive: m.staffUser.isActive,
  };
}

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

    const rows = await prisma.projectTeamMember.findMany({
      where: { projectId },
      include: {
        staffUser: {
          select: { id: true, name: true, email: true, color: true, isActive: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ members: rows.map(mapMember) });
  } catch (error) {
    console.error("project team GET", error);
    return NextResponse.json({ error: "Failed to load team" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const projectId = String(body.projectId || "").trim();
    const rawIds = Array.isArray(body.staffUserIds) ? body.staffUserIds : [];
    const staffUserIds = [
      ...new Set(rawIds.map((id: unknown) => String(id || "").trim()).filter(Boolean)),
    ];

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

    let validStaff: { id: string }[] = [];
    if (staffUserIds.length > 0) {
      validStaff = await prisma.staffUser.findMany({
        where: {
          id: { in: staffUserIds },
          isActive: true,
          ...notSystemStaffWhere(),
        },
        select: { id: true },
      });
    }
    const validIds = new Set(validStaff.map((s) => s.id));
    const finalIds = staffUserIds.filter((id) => validIds.has(id));

    await prisma.$transaction(async (tx) => {
      await tx.projectTeamMember.deleteMany({ where: { projectId } });
      if (finalIds.length > 0) {
        await tx.projectTeamMember.createMany({
          data: finalIds.map((staffUserId) => ({ projectId, staffUserId })),
        });
      }
      await tx.activityLog.create({
        data: {
          projectId,
          action: `Team updated (${finalIds.length} members)`,
          user: "Admin",
        },
      });
    });

    const rows = await prisma.projectTeamMember.findMany({
      where: { projectId },
      include: {
        staffUser: {
          select: { id: true, name: true, email: true, color: true, isActive: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ members: rows.map(mapMember) });
  } catch (error) {
    console.error("project team PUT", error);
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
  }
}
