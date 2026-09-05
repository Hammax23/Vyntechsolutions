import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notSystemStaffWhere } from "@/lib/workflow-auth";
import { mapTask, utcDayRange, isValidIsoDate } from "@/lib/workflow-progress";

export const dynamic = "force-dynamic";

const includePeople = {
  createdBy: { select: { id: true, name: true, color: true } },
  assignedTo: { select: { id: true, name: true, color: true } },
};

/** Admin preview of an employee board/inbox — same visibility rules as /workflow for that staff. */
export async function GET(request: NextRequest) {
  try {
    const staffId = String(request.nextUrl.searchParams.get("staffId") || "").trim();
    if (!staffId) {
      return NextResponse.json({ error: "staffId required" }, { status: 400 });
    }

    const staff = await prisma.staffUser.findFirst({
      where: { id: staffId, ...notSystemStaffWhere() },
      select: { id: true },
    });
    if (!staff) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const date = request.nextUrl.searchParams.get("date");
    const inbox = request.nextUrl.searchParams.get("inbox") === "1";

    if (date && !isValidIsoDate(date)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const visibility = {
      OR: [{ assignedToId: staffId }, { createdById: staffId }],
    };

    const where = inbox
      ? { assignedToId: staffId, createdById: { not: staffId }, status: { not: "done" } }
      : date
        ? { ...visibility, workDate: utcDayRange(date) }
        : visibility;

    const tasks = await prisma.workflowTask.findMany({
      where,
      include: includePeople,
      orderBy: [{ workDate: "asc" }, { createdAt: "desc" }],
      take: date || inbox ? 200 : 80,
    });

    return NextResponse.json({ tasks: tasks.map(mapTask) });
  } catch (error) {
    console.error("admin employee tasks", error);
    return NextResponse.json({ error: "Failed to load employee tasks" }, { status: 500 });
  }
}
