import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notSystemStaffWhere } from "@/lib/workflow-auth";
import { resolveProgressPeriod } from "@/lib/admin/workflow-period";

export const dynamic = "force-dynamic";

/**
 * Preview or permanently delete an employee's workflow tasks for a day / range / month.
 * Body mirrors progress report export. Use dryRun:true to count first.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const staffId = String(body.staffId || "").trim();
    const dryRun = Boolean(body.dryRun);
    const confirm = Boolean(body.confirm);

    if (!staffId) {
      return NextResponse.json({ error: "Select an employee" }, { status: 400 });
    }
    if (!dryRun && !confirm) {
      return NextResponse.json(
        { error: "Deletion requires confirm: true (or dryRun: true to preview)" },
        { status: 400 }
      );
    }

    const staff = await prisma.staffUser.findFirst({
      where: { id: staffId, ...notSystemStaffWhere() },
      select: { id: true, name: true, email: true },
    });
    if (!staff) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const period = resolveProgressPeriod(body);
    if ("error" in period) {
      return NextResponse.json({ error: period.error }, { status: period.status });
    }

    const where = {
      assignedToId: staff.id,
      workDate: { gte: period.rangeStart, lt: period.rangeEndExclusive },
    };

    if (dryRun) {
      const count = await prisma.workflowTask.count({ where });
      return NextResponse.json({
        dryRun: true,
        count,
        periodLabel: period.periodLabel,
        periodFrom: period.fromIso,
        periodTo: period.toIso,
        employee: staff,
      });
    }

    const result = await prisma.workflowTask.deleteMany({ where });

    return NextResponse.json({
      deleted: result.count,
      periodLabel: period.periodLabel,
      periodFrom: period.fromIso,
      periodTo: period.toIso,
      employee: staff,
    });
  } catch (error) {
    console.error("workflow progress purge", error);
    return NextResponse.json({ error: "Failed to clear progress" }, { status: 500 });

  }
}
