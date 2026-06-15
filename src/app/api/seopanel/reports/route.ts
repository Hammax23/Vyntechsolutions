import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSeoSession, logSeoActivity } from "@/lib/seopanel/auth";

export async function GET(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const reports = await prisma.seoReport.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ reports });
}

export async function POST(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await request.json();
  const report = await prisma.seoReport.create({
    data: {
      title: data.title,
      period: data.period,
      reportType: data.reportType || "monthly",
      summary: data.summary || null,
      metrics: data.metrics ? JSON.stringify(data.metrics) : null,
      highlights: data.highlights || null,
      challenges: data.challenges || null,
      nextSteps: data.nextSteps || null,
      status: data.status || "draft",
    },
  });
  await logSeoActivity("Created report", "reports", data.title);
  return NextResponse.json({ report });
}

export async function PATCH(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...data } = await request.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  if (data.metrics && typeof data.metrics === "object") data.metrics = JSON.stringify(data.metrics);
  const report = await prisma.seoReport.update({ where: { id }, data });
  return NextResponse.json({ report });
}

export async function DELETE(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.seoReport.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
