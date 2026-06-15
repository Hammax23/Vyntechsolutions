import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSeoSession, logSeoActivity } from "@/lib/seopanel/auth";
import { DEFAULT_TECHNICAL_CHECKS } from "@/lib/seopanel/constants";

async function seedTechnicalIfEmpty() {
  const count = await prisma.seoTechnicalIssue.count();
  if (count === 0) {
    await prisma.seoTechnicalIssue.createMany({
      data: DEFAULT_TECHNICAL_CHECKS.map((c) => ({
        title: c.title,
        category: c.category,
        severity: c.severity,
        status: "open",
      })),
    });
  }
}

export async function GET(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await seedTechnicalIfEmpty();
    const issues = await prisma.seoTechnicalIssue.findMany({ orderBy: [{ severity: "asc" }, { createdAt: "desc" }] });
    return NextResponse.json({ issues });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await request.json();
    const issue = await prisma.seoTechnicalIssue.create({ data });
    await logSeoActivity("Added technical issue", "technical", data.title);
    return NextResponse.json({ issue });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    if (updateData.status === "resolved") updateData.resolvedAt = new Date();
    const issue = await prisma.seoTechnicalIssue.update({ where: { id }, data: updateData });
    await logSeoActivity("Updated technical issue", "technical", issue.title);
    return NextResponse.json({ issue });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await prisma.seoTechnicalIssue.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete issue" }, { status: 500 });
  }
}
