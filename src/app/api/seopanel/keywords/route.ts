import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSeoSession, logSeoActivity } from "@/lib/seopanel/auth";

export async function GET(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const keywords = await prisma.seoKeyword.findMany({
      include: { rankHistory: { orderBy: { recordedAt: "desc" }, take: 12 } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ keywords });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch keywords" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await request.json();
    const keyword = await prisma.seoKeyword.create({
      data: {
        keyword: data.keyword,
        targetUrl: data.targetUrl || null,
        currentRank: data.currentRank ?? null,
        previousRank: data.previousRank ?? null,
        bestRank: data.currentRank ?? null,
        searchVolume: data.searchVolume ?? null,
        difficulty: data.difficulty ?? null,
        priority: data.priority || "medium",
        status: data.status || "tracking",
        country: data.country || "CA",
        notes: data.notes || null,
      },
    });

    if (data.currentRank) {
      await prisma.seoRankHistory.create({ data: { keywordId: keyword.id, rank: data.currentRank } });
    }

    await logSeoActivity("Created keyword", "keywords", data.keyword);
    return NextResponse.json({ keyword });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create keyword" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const existing = await prisma.seoKeyword.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (updateData.currentRank !== undefined && updateData.currentRank !== existing.currentRank) {
      updateData.previousRank = existing.currentRank;
      if (!existing.bestRank || (updateData.currentRank && updateData.currentRank < existing.bestRank)) {
        updateData.bestRank = updateData.currentRank;
      }
      if (updateData.currentRank) {
        await prisma.seoRankHistory.create({ data: { keywordId: id, rank: updateData.currentRank } });
      }
    }

    const keyword = await prisma.seoKeyword.update({ where: { id }, data: updateData });
    await logSeoActivity("Updated keyword", "keywords", existing.keyword);
    return NextResponse.json({ keyword });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update keyword" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.seoKeyword.delete({ where: { id } });
    await logSeoActivity("Deleted keyword", "keywords", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete keyword" }, { status: 500 });
  }
}
