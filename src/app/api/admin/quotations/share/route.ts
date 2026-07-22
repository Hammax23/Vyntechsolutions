import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateShareToken } from "@/lib/admin/quotation-types";

export async function POST(request: NextRequest) {
  try {
    const { id } = (await request.json()) as { id?: string };
    if (!id) {
      return NextResponse.json({ error: "Quotation ID required" }, { status: 400 });
    }

    const existing = await prisma.clientQuotation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const shareToken = existing.shareToken || generateShareToken();
    const shareExpiresAt = new Date();
    shareExpiresAt.setDate(shareExpiresAt.getDate() + 30);

    const quotation = await prisma.clientQuotation.update({
      where: { id },
      data: {
        shareToken,
        shareExpiresAt,
        status: existing.status === "draft" ? "shared" : existing.status,
      },
    });

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
    const shareUrl = `${origin}/quote/${shareToken}`;

    return NextResponse.json({
      shareToken: quotation.shareToken,
      shareUrl,
      shareExpiresAt: quotation.shareExpiresAt?.toISOString(),
    });
  } catch (error) {
    console.error("Share link error:", error);
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }
}
