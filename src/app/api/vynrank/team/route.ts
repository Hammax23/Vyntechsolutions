import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  isSessionResponse,
  requireVynRankNav,
  requireVynRankSession,
} from "@/lib/vynrank/auth-request";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sessionOrRes = await requireVynRankSession(request);
  if (isSessionResponse(sessionOrRes)) return sessionOrRes;
  const session = sessionOrRes;

  const forbidden = requireVynRankNav(session, "team");
  if (forbidden) return forbidden;

  try {
    const users = await prisma.vynRankUser.findMany({
      where: {
        orgId: session.orgId,
        isActive: true,
        role: { in: ["ceo", "seo_team"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        assignedProjects: {
          select: {
            id: true,
            name: true,
            health: true,
            status: true,
            monthlyRevenue: true,
          },
        },
        tasks: {
          where: { status: { not: "done" } },
          select: { id: true, status: true, title: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      members: users.map((u) => ({
        ...u,
        openTaskCount: u.tasks.length,
        projectCount: u.assignedProjects.length,
      })),
    });
  } catch (error) {
    console.error("vynrank team", error);
    return NextResponse.json({ error: "Failed to load team" }, { status: 500 });
  }
}
