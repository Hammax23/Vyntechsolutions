import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSeoSession, logSeoActivity } from "@/lib/seopanel/auth";
import { DEFAULT_SITE_PAGES } from "@/lib/seopanel/constants";

async function syncSitePages() {
  const existing = await prisma.seoPage.findMany({ select: { path: true } });
  const existingPaths = new Set(existing.map((p) => p.path));
  const missing = DEFAULT_SITE_PAGES.filter((p) => !existingPaths.has(p.path));
  if (missing.length > 0) {
    await prisma.seoPage.createMany({
      data: missing.map((p) => ({
        path: p.path,
        title: p.title,
        focusKeyword: p.focusKeyword || null,
        status: "needs_review",
      })),
      skipDuplicates: true,
    });
  }
}

export async function GET(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await syncSitePages();
    const pages = await prisma.seoPage.findMany({ orderBy: { path: "asc" } });
    return NextResponse.json({ pages });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await request.json();
    const page = await prisma.seoPage.create({
      data: {
        path: data.path,
        title: data.title || null,
        metaDescription: data.metaDescription || null,
        h1: data.h1 || null,
        canonicalUrl: data.canonicalUrl || null,
        ogTitle: data.ogTitle || null,
        ogDescription: data.ogDescription || null,
        ogImage: data.ogImage || null,
        focusKeyword: data.focusKeyword || null,
        seoScore: data.seoScore ?? 0,
        indexStatus: data.indexStatus || "index",
        status: data.status || "needs_review",
        notes: data.notes || null,
      },
    });
    await logSeoActivity("Added page", "pages", data.path);
    return NextResponse.json({ page });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    if (updateData.lastAuditedAt) {
      updateData.lastAuditedAt = new Date(updateData.lastAuditedAt);
    }

    const page = await prisma.seoPage.update({ where: { id }, data: updateData });
    await logSeoActivity("Updated page SEO", "pages", page.path);
    return NextResponse.json({ page });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await validateSeoSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await prisma.seoPage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
