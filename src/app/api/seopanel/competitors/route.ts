import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSeoSession, logSeoActivity } from "@/lib/seopanel/auth";

export async function GET(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const competitors = await prisma.seoCompetitor.findMany({ orderBy: { domainAuth: "desc" } });
  return NextResponse.json({ competitors });
}

export async function POST(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await request.json();
  const competitor = await prisma.seoCompetitor.create({
    data: {
      domain: data.domain,
      name: data.name || null,
      domainAuth: data.domainAuth ?? null,
      topKeywords: data.topKeywords || [],
      strengths: data.strengths || null,
      weaknesses: data.weaknesses || null,
      notes: data.notes || null,
    },
  });
  await logSeoActivity("Added competitor", "competitors", data.domain);
  return NextResponse.json({ competitor });
}

export async function PATCH(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...data } = await request.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const competitor = await prisma.seoCompetitor.update({ where: { id }, data });
  return NextResponse.json({ competitor });
}

export async function DELETE(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.seoCompetitor.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
