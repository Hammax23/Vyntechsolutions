import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { ClientSelections, QuotationData, ScopeSection } from "@/lib/admin/quotation-types";
import { flattenScope } from "@/lib/admin/quotation-types";
import { DEFAULT_SCOPE } from "@/lib/admin/quotation-defaults";

function mapPublic(record: {
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
  shareExpiresAt: Date | null;
  clientSelections: unknown;
}) {
  const scopeSections =
    (record.scopeSections as ScopeSection[])?.length > 0
      ? (record.scopeSections as ScopeSection[])
      : record.includes.length
        ? [{ title: "Scope", items: record.includes }]
        : DEFAULT_SCOPE;

  return {
    quoteNumber: record.quoteNumber,
    customerName: record.customerName,
    companyName: record.companyName || "",
    quoteDate: record.quoteDate.toISOString().split("T")[0],
    projectTitle: record.projectTitle,
    projectSubtitle: record.projectSubtitle || "Project Offer Letter",
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
    shareExpiresAt: record.shareExpiresAt?.toISOString() || null,
    clientSelections: (record.clientSelections as ClientSelections) || {
      optionalIndexes: [],
      socialMediaSelected: false,
    },
  };
}

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const quotation = await prisma.clientQuotation.findUnique({
      where: { shareToken: params.token },
    });
    if (!quotation) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    if (quotation.shareExpiresAt && quotation.shareExpiresAt < new Date()) {
      return NextResponse.json({ error: "This quote link has expired" }, { status: 410 });
    }
    return NextResponse.json({ quotation: mapPublic(quotation) });
  } catch (error) {
    console.error("Public quote fetch error:", error);
    return NextResponse.json({ error: "Failed to load quote" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const body = (await request.json()) as ClientSelections;
    const quotation = await prisma.clientQuotation.findUnique({
      where: { shareToken: params.token },
    });
    if (!quotation) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    if (quotation.shareExpiresAt && quotation.shareExpiresAt < new Date()) {
      return NextResponse.json({ error: "This quote link has expired" }, { status: 410 });
    }

    const selections: ClientSelections = {
      optionalIndexes: Array.isArray(body.optionalIndexes) ? body.optionalIndexes : [],
      socialMediaSelected: Boolean(body.socialMediaSelected),
      clientNote: body.clientNote?.trim() || "",
      submittedAt: new Date().toISOString(),
    };

    const updated = await prisma.clientQuotation.update({
      where: { shareToken: params.token },
      data: { clientSelections: selections, status: "client_reviewed" },
    });

    return NextResponse.json({ success: true, quotation: mapPublic(updated) });
  } catch (error) {
    console.error("Public quote submit error:", error);
    return NextResponse.json({ error: "Failed to submit selections" }, { status: 500 });
  }
}
