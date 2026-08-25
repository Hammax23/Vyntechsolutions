import { NextRequest, NextResponse } from "next/server";
import { renderInvoicePdf } from "@/lib/admin/render-invoice-pdf";
import type { InvoiceData } from "@/lib/admin/invoice-types";
import { SITE_URL } from "@/lib/company";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = body.data as InvoiceData;

    if (!data?.documentNumber || !data?.payeeName) {
      return NextResponse.json({ error: "Document number and payee name required" }, { status: 400 });
    }

    // Prefer public site URL so QR codes verify on production, not localhost
    const origin = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;

    const pdfBuffer = await renderInvoicePdf(data, origin);
    const prefix = data.expenseType === "salary" ? "Salary" : "Expense";
    const filename = `VynTech-${prefix}-${data.documentNumber}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Invoice PDF error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
