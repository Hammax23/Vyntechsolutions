import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notSystemStaffWhere } from "@/lib/workflow-auth";

/** Admin change detector for Team Progress live refresh. */
export async function GET() {
  try {
    const [taskStamp, staffStamp] = await Promise.all([
      prisma.workflowTask.aggregate({
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
    console.error("admin workflow sync", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
