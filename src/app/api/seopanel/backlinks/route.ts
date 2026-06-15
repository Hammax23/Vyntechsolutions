import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSeoSession, logSeoActivity } from "@/lib/seopanel/auth";

export async function GET(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.seoBacklink.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ backlinks: items });
}

export async function POST(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await request.json();
  const backlink = await prisma.seoBacklink.create({
    data: {
      sourceUrl: data.sourceUrl,
      targetUrl: data.targetUrl,
      anchorText: data.anchorText || null,
      domainAuth: data.domainAuth ?? null,
      linkType: data.linkType || "dofollow",
      status: data.status || "active",
      acquiredAt: data.acquiredAt ? new Date(data.acquiredAt) : null,
      notes: data.notes || null,
    },
  });
  await logSeoActivity("Added backlink", "backlinks", data.sourceUrl);
  return NextResponse.json({ backlink });
}

export async function PATCH(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...data } = await request.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  if (data.acquiredAt) data.acquiredAt = new Date(data.acquiredAt);
  const backlink = await prisma.seoBacklink.update({ where: { id }, data });
  return NextResponse.json({ backlink });
}

export async function DELETE(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.seoBacklink.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
