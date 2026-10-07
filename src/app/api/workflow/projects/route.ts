import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/workflow-auth";
import { phaseLabel } from "@/lib/admin/project-workflow";

export const dynamic = "force-dynamic";

const EXCLUDED_STATUSES = ["completed", "on_hold"];

export async function GET() {
  const me = await requireStaff();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const memberships = await prisma.projectTeamMember.findMany({
      where: { staffUserId: me.id },
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
    console.error("workflow projects GET", error);
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
  }
}
