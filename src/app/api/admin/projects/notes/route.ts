import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { actorNameFromRequest } from "@/lib/admin/actor";

// POST create new note
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const actor = await actorNameFromRequest(request);

    const note = await prisma.note.create({
      data: {
        content: data.content,
        author: data.author || actor,
        projectId: data.projectId,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "New note added",
        user: actor,
        projectId: data.projectId,
      },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}

// DELETE note
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const actor = await actorNameFromRequest(request);

    if (!id) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await prisma.note.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: "Note deleted",
        user: actor,
        projectId: note.projectId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
