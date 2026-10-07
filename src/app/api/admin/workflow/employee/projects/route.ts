import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { phaseLabel } from "@/lib/admin/project-workflow";

export const dynamic = "force-dynamic";

const EXCLUDED_STATUSES = ["completed", "on_hold"];

export async function GET(request: NextRequest) {
  try {
    const staffId = String(request.nextUrl.searchParams.get("staffId") || "").trim();
    if (!staffId) {
      return NextResponse.json({ error: "staffId required" }, { status: 400 });
    }

    const staff = await prisma.staffUser.findUnique({
      where: { id: staffId },
      select: { id: true },
    });
    if (!staff) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const memberships = await prisma.projectTeamMember.findMany({
      where: { staffUserId: staffId },
      select: {
        project: {
          select: {
            id: true,
            projectName: true,
            companyName: true,
            status: true,
            progress: true,
          },
        },
      },
    });

    const projects = memberships
      .map((m) => m.project)
      .filter((p) => p && !EXCLUDED_STATUSES.includes(p.status))
      .map((p) => ({
        id: p.id,
        projectName: p.projectName,
        companyName: p.companyName || "",
        status: p.status,
        progress: typeof p.progress === "number" ? p.progress : 0,
        phaseLabel: phaseLabel(p.status),
      }))
      .sort((a, b) => a.projectName.localeCompare(b.projectName));

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("admin employee projects GET", error);
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
  }
}
