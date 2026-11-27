import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { actorNameFromRequest } from "@/lib/admin/actor";

// POST create new milestone
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const actor = await actorNameFromRequest(request);

    const milestone = await prisma.milestone.create({
      data: {
        title: data.title,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        completed: false,
        projectId: data.projectId,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: `Milestone "${milestone.title}" added`,
        user: actor,
        projectId: data.projectId,
      },
    });

    return NextResponse.json({ milestone });
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }
}

// PATCH update milestone (toggle completed)
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    const actor = await actorNameFromRequest(request);

    if (!id) {
      return NextResponse.json({ error: "Milestone ID is required" }, { status: 400 });
    }

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const milestone = await prisma.milestone.update({
      where: { id },
      data: updateData,
    });

    if (typeof updateData.completed !== "undefined") {
      await prisma.activityLog.create({
        data: {
          action: `Milestone "${milestone.title}" ${updateData.completed ? "completed" : "unmarked"}`,
          user: actor,
          projectId: milestone.projectId,
        },
      });
    }

    return NextResponse.json({ milestone });
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  }
}

// DELETE milestone
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const actor = await actorNameFromRequest(request);

    if (!id) {
      return NextResponse.json({ error: "Milestone ID is required" }, { status: 400 });
    }

    const milestone = await prisma.milestone.findUnique({ where: { id } });

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    await prisma.milestone.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: `Milestone "${milestone.title}" deleted`,
        user: actor,
        projectId: milestone.projectId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    return NextResponse.json({ error: "Failed to delete milestone" }, { status: 500 });
  }
}
