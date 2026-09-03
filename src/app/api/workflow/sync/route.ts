import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notSystemStaffWhere, requireStaff } from "@/lib/workflow-auth";

/** Lightweight change detector — clients poll this, then refetch only when stamp moves. */
export async function GET() {
  const me = await requireStaff();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [taskStamp, staffStamp] = await Promise.all([
      prisma.workflowTask.aggregate({
        where: {
          OR: [{ assignedToId: me.id }, { createdById: me.id }],
        },
        _max: { updatedAt: true },
        _count: { _all: true },
      }),
      prisma.staffUser.aggregate({
        where: notSystemStaffWhere(),
        _max: { updatedAt: true },
        _count: { _all: true },
      }),
    ]);

    const stamp = [
      taskStamp._max.updatedAt?.toISOString() || "0",
      taskStamp._count._all,
      staffStamp._max.updatedAt?.toISOString() || "0",
      staffStamp._count._all,
    ].join(":");

    return NextResponse.json({ stamp }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("workflow sync", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
