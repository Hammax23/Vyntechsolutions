import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSeoSession, logSeoActivity } from "@/lib/seopanel/auth";

export async function GET(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tasks = await prisma.seoTask.findMany({ orderBy: [{ status: "asc" }, { dueDate: "asc" }] });
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await request.json();
  const task = await prisma.seoTask.create({
    data: {
      title: data.title,
      description: data.description || null,
      category: data.category || "general",
      priority: data.priority || "medium",
      status: data.status || "pending",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assignee: data.assignee || "SEO Expert",
    },
  });
  await logSeoActivity("Created task", "tasks", data.title);
  return NextResponse.json({ task });
}

export async function PATCH(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...data } = await request.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  if (data.status === "completed") data.completedAt = new Date();
  const task = await prisma.seoTask.update({ where: { id }, data });
  return NextResponse.json({ task });
}

export async function DELETE(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.seoTask.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
