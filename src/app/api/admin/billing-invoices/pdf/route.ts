import { NextRequest, NextResponse } from "next/server";
import { renderBillingInvoicePdf } from "@/lib/admin/render-billing-invoice-pdf";
import type { BillingInvoiceData } from "@/lib/admin/billing-invoice-types";
import { SITE_URL } from "@/lib/company";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = body.data as BillingInvoiceData;

    if (!data?.invoiceNumber || !data?.clientName) {
      return NextResponse.json(
        { error: "Invoice number and client name required" },
        { status: 400 }
      );
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;
    const pdfBuffer = await renderBillingInvoicePdf(data, origin);
    const filename = `VynTech-Invoice-${data.invoiceNumber}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Billing invoice PDF error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
