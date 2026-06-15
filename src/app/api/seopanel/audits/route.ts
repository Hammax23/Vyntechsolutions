import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSeoSession, logSeoActivity } from "@/lib/seopanel/auth";

export async function GET(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const audits = await prisma.seoAudit.findMany({ orderBy: { auditedAt: "desc" } });
  return NextResponse.json({ audits });
}

export async function POST(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await request.json();
  const audit = await prisma.seoAudit.create({
    data: {
      title: data.title,
      auditType: data.auditType || "full",
      score: data.score ?? 0,
      findings: data.findings || null,
      recommendations: data.recommendations || null,
      status: data.status || "completed",
      auditedAt: data.auditedAt ? new Date(data.auditedAt) : new Date(),
    },
  });
  await logSeoActivity("Created audit", "audits", data.title);
  return NextResponse.json({ audit });
}

export async function PATCH(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...data } = await request.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const audit = await prisma.seoAudit.update({ where: { id }, data });
  return NextResponse.json({ audit });
}

export async function DELETE(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.seoAudit.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
