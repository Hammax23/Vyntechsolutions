import { NextRequest, NextResponse } from "next/server";
import { renderQuotationPdf } from "@/lib/admin/render-quotation-pdf";
import type { QuotationData } from "@/lib/admin/quotation-types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = body.data as QuotationData;
    const variant = (body.variant as "client" | "internal" | "both") || "both";

    if (!data?.quoteNumber || !data?.customerName) {
      return NextResponse.json({ error: "Quote number and customer name required" }, { status: 400 });
    }

    const pdfBuffer = await renderQuotationPdf(data, variant);
    const suffix = variant === "both" ? "full" : variant;
    const filename = `VynTech-Quote-${data.quoteNumber}-${suffix}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
