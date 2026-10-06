import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureProjectWorkflow, projectInclude } from "@/lib/admin/seed-project-workflow";

export const dynamic = "force-dynamic";

async function projectWithPayments(projectId: string) {
  await ensureProjectWorkflow(projectId);
  return prisma.project.findUnique({
    where: { id: projectId },
    include: projectInclude,
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const projectId = String(data.projectId || "").trim();
    const label = String(data.label || "").trim();
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }
    if (!label) {
      return NextResponse.json({ error: "Milestone label is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const percent =
      typeof data.percent === "number" && Number.isFinite(data.percent)
        ? Math.max(0, Math.min(100, data.percent))
        : 0;
    let amount =
      typeof data.amount === "number" && Number.isFinite(data.amount)
        ? Math.max(0, data.amount)
        : Math.round(((project.budget || 0) * percent) / 100 * 100) / 100;

    const maxSort = await prisma.projectPayment.aggregate({
      where: { projectId },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

    const payment = await prisma.projectPayment.create({
      data: {
        projectId,
        label,
        percent,
        amount,
        status: "pending",
        notes: data.notes ? String(data.notes) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        sortOrder,
      },
    });

    await prisma.activityLog.create({
      data: {
        projectId,
        action: `Payment milestone added: ${payment.label} (${payment.percent}% · $${payment.amount})`,
        user: "Admin",
      },
    });

    const full = await projectWithPayments(projectId);
    return NextResponse.json({ project: full, payment });
  } catch (error) {
    console.error("payments POST", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const id = String(data.id || "");
    if (!id) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    const existing = await prisma.projectPayment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const update: Record<string, unknown> = {};
    if (typeof data.label === "string" && data.label.trim()) {
      update.label = data.label.trim();
    }
    if (typeof data.percent === "number" && Number.isFinite(data.percent)) {
      update.percent = Math.max(0, Math.min(100, data.percent));
      if (typeof data.amount !== "number") {
        const project = await prisma.project.findUnique({
          where: { id: existing.projectId },
          select: { budget: true },
        });
        update.amount =
          Math.round((((project?.budget || 0) * (update.percent as number)) / 100) * 100) / 100;
      }
    }
    if (typeof data.amount === "number" && Number.isFinite(data.amount)) {
      update.amount = Math.max(0, data.amount);
    }
    if (typeof data.notes === "string") update.notes = data.notes || null;
    if (typeof data.status === "string" && ["pending", "due", "paid"].includes(data.status)) {
      update.status = data.status;
      if (data.status === "paid") {
        update.paidAt = data.paidAt ? new Date(data.paidAt) : new Date();
      } else if (existing.status === "paid") {
        update.paidAt = null;
      }
    }
    if (data.dueDate !== undefined) {
      update.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const payment = await prisma.projectPayment.update({
      where: { id },
      data: update,
    });

    if (update.status === "paid" && existing.status !== "paid") {
      await prisma.activityLog.create({
        data: {
          projectId: existing.projectId,
          action: `Payment marked paid: ${payment.label} ($${payment.amount})`,
          user: "Admin",
        },
      });
    } else if (update.label || update.percent != null || update.amount != null) {
      await prisma.activityLog.create({
        data: {
          projectId: existing.projectId,
          action: `Payment milestone updated: ${payment.label} (${payment.percent}% · $${payment.amount})`,
          user: "Admin",
        },
      });
    }

    const project = await projectWithPayments(existing.projectId);
    return NextResponse.json({ project, payment });
  } catch (error) {
    console.error("payments PATCH", error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    const existing = await prisma.projectPayment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    await prisma.projectPayment.delete({ where: { id } });
    await prisma.activityLog.create({
      data: {
        projectId: existing.projectId,
        action: `Payment milestone removed: ${existing.label}`,
        user: "Admin",
      },
    });

    const project = await projectWithPayments(existing.projectId);
    return NextResponse.json({ project });
  } catch (error) {
    console.error("payments DELETE", error);
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 });
  }
}
