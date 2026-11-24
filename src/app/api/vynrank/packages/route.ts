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

  const forbidden = requireVynRankNav(session, "packages");
  if (forbidden) return forbidden;

  try {
    const packages = await prisma.vynRankPackage.findMany({
      where: { orgId: session.orgId },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { projects: true } } },
    });
    return NextResponse.json({ packages });
  } catch (error) {
    console.error("vynrank packages", error);
    return NextResponse.json({ error: "Failed to load packages" }, { status: 500 });
  }
}
