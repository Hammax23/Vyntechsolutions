import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSeoSession } from "@/lib/seopanel/auth";

export async function GET(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [
      keywordCount,
      pageCount,
      backlinkCount,
      taskCount,
      openTasks,
      openIssues,
      competitorCount,
      recentActivity,
      keywords,
      settings,
    ] = await Promise.all([
      prisma.seoKeyword.count(),
      prisma.seoPage.count(),
      prisma.seoBacklink.count({ where: { status: "active" } }),
      prisma.seoTask.count(),
      prisma.seoTask.count({ where: { status: { in: ["pending", "in_progress"] } } }),
      prisma.seoTechnicalIssue.count({ where: { status: { in: ["open", "in_progress"] } } }),
      prisma.seoCompetitor.count(),
      prisma.seoActivityLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
      prisma.seoKeyword.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
      prisma.seoSettings.findUnique({ where: { id: "default" } }),
    ]);

    const rankedKeywords = await prisma.seoKeyword.count({
      where: { currentRank: { lte: 10, not: null } },
    });

    const avgRank = await prisma.seoKeyword.aggregate({
      _avg: { currentRank: true },
      where: { currentRank: { not: null } },
    });

    const optimizedPages = await prisma.seoPage.count({ where: { status: "optimized" } });

    return NextResponse.json({
      stats: {
        keywordCount,
        pageCount,
        backlinkCount,
        taskCount,
        openTasks,
        openIssues,
        competitorCount,
        rankedKeywords,
        avgRank: Math.round(avgRank._avg.currentRank || 0),
        optimizedPages,
        optimizationRate: pageCount > 0 ? Math.round((optimizedPages / pageCount) * 100) : 0,
      },
      recentActivity,
      topKeywords: keywords,
      settings,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
