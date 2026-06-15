import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSeoSession, logSeoActivity } from "@/lib/seopanel/auth";

export async function GET(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.seoContentBrief.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ content: items });
}

export async function POST(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await request.json();
  const item = await prisma.seoContentBrief.create({ data });
  await logSeoActivity("Created content brief", "content", data.title);
  return NextResponse.json({ content: item });
}

export async function PATCH(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...data } = await request.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  if (data.publishedAt) data.publishedAt = new Date(data.publishedAt);
  const item = await prisma.seoContentBrief.update({ where: { id }, data });
  return NextResponse.json({ content: item });
}

export async function DELETE(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.seoContentBrief.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
