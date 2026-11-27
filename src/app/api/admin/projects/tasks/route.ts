import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { actorNameFromRequest } from "@/lib/admin/actor";

// POST create new task
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const actor = await actorNameFromRequest(request);

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || "",
        status: data.status || "pending",
        priority: data.priority || "medium",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assignee: data.assignee || "",
        projectId: data.projectId,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: `Task "${task.title}" added`,
        user: actor,
        projectId: data.projectId,
      },
    });

    // Project.progress is owned by SDLC phase checks — Tasks must not overwrite it.

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// PATCH update task
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, projectId, ...updateData } = data;
    const actor = await actorNameFromRequest(request);

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    if (updateData.status) {
      await prisma.activityLog.create({
        data: {
          action: `Task "${task.title}" status changed to ${updateData.status}`,
          user: actor,
          projectId: task.projectId,
        },
      });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const actor = await actorNameFromRequest(request);

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: `Task "${task.title}" deleted`,
        user: actor,
        projectId: task.projectId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
