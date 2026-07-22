import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { ClientSelections, QuotationData, ScopeSection } from "@/lib/admin/quotation-types";
import { flattenScope, generateQuoteNumber } from "@/lib/admin/quotation-types";
import { DEFAULT_SCOPE } from "@/lib/admin/quotation-defaults";

function mapQuotation(record: {
  id: string;
  quoteNumber: string;
  customerName: string;
  companyName: string | null;
  quoteDate: Date;
  projectTitle: string;
  projectSubtitle: string | null;
  introText: string | null;
  projectType: string | null;
  technology: string | null;
  totalPages: string | null;
  timeline: string | null;
  scopeSections: unknown;
  includes: string[];
  optionalServices: unknown;
  showSocialMedia: boolean;
  socialMediaFee: number;
  socialIncludes: string[];
  baseAmount: number;
  discountPercent: number;
  hstPercent: number;
  depositPercent: number;
  terms: string[];
  status: string;
  shareToken: string | null;
  shareExpiresAt: Date | null;
  clientSelections: unknown;
}) {
  const scopeSections =
    (record.scopeSections as ScopeSection[])?.length > 0
      ? (record.scopeSections as ScopeSection[])
      : record.includes.length
        ? [{ title: "Included Deliverables", items: record.includes }]
        : DEFAULT_SCOPE;

  return {
    id: record.id,
    quoteNumber: record.quoteNumber,
    customerName: record.customerName,
    companyName: record.companyName || "",
    quoteDate: record.quoteDate.toISOString().split("T")[0],
    projectTitle: record.projectTitle,
    projectSubtitle: record.projectSubtitle || "",
    introText: record.introText || "",
    projectType: record.projectType || "",
    technology: record.technology || "",
    totalPages: record.totalPages || "",
    timeline: record.timeline || "",
    scopeSections,
    includes: record.includes.length ? record.includes : flattenScope(scopeSections),
    optionalServices: (record.optionalServices as QuotationData["optionalServices"]) || [],
    showSocialMedia: record.showSocialMedia,
    socialMediaFee: record.socialMediaFee,
    socialIncludes: record.socialIncludes,
    baseAmount: record.baseAmount,
    discountPercent: record.discountPercent,
    hstPercent: record.hstPercent,
    depositPercent: record.depositPercent,
    terms: record.terms,
    status: record.status,
    shareToken: record.shareToken,
    shareExpiresAt: record.shareExpiresAt?.toISOString() || null,
    clientSelections: (record.clientSelections as ClientSelections) || {
      optionalIndexes: [],
      socialMediaSelected: false,
    },
  };
}

function normalizePayload(data: QuotationData) {
  const scopeSections =
    data.scopeSections?.length > 0
      ? data.scopeSections
          .map((s) => ({ title: s.title.trim(), items: s.items.map((i) => i.trim()).filter(Boolean) }))
          .filter((s) => s.title || s.items.length)
      : DEFAULT_SCOPE;

  return {
    quoteNumber: data.quoteNumber || generateQuoteNumber(),
    customerName: data.customerName,
    companyName: data.companyName || null,
    quoteDate: data.quoteDate ? new Date(data.quoteDate) : new Date(),
    projectTitle: data.projectTitle || data.projectType || "Website Development",
    projectSubtitle: data.projectSubtitle || "Project Offer Letter",
    introText: data.introText || null,
    projectType: data.projectType || null,
    technology: data.technology || null,
    totalPages: data.totalPages || null,
    timeline: data.timeline || null,
    scopeSections,
    includes: flattenScope(scopeSections),
    optionalServices: data.optionalServices || [],
    showSocialMedia: data.showSocialMedia ?? false,
    socialMediaFee: data.socialMediaFee ?? 600,
    socialIncludes: (data.socialIncludes || []).filter(Boolean),
    baseAmount: data.baseAmount,
    discountPercent: data.discountPercent,
    hstPercent: data.hstPercent,
    depositPercent: data.depositPercent,
    terms: (data.terms || []).filter(Boolean),
    status: data.status || "draft",
  };
}

export async function GET() {
  try {
    const quotations = await prisma.clientQuotation.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ quotations: quotations.map(mapQuotation) });
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as QuotationData;
    const payload = normalizePayload(data);

    const quotation = await prisma.clientQuotation.create({ data: payload });
    return NextResponse.json({ quotation: mapQuotation(quotation) });
  } catch (error) {
    console.error("Error creating quotation:", error);
    return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = (await request.json()) as QuotationData & { id: string };
    if (!data.id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const payload = normalizePayload(data);
    const quotation = await prisma.clientQuotation.update({
      where: { id: data.id },
      data: payload,
    });

    return NextResponse.json({ quotation: mapQuotation(quotation) });
  } catch (error) {
    console.error("Error updating quotation:", error);
    return NextResponse.json({ error: "Failed to update quotation" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.clientQuotation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    return NextResponse.json({ error: "Failed to delete quotation" }, { status: 500 });
  }
}
