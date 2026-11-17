import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mapBillingInvoice } from "@/lib/admin/billing-invoice-map";
import { uploadPaidInvoiceToDropbox } from "@/lib/admin/upload-paid-invoice-dropbox";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Manual / retry archive of a paid invoice PDF to Dropbox.
 * Body: { id: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = String(body.id || "").trim();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const existing = await prisma.billingInvoice.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (existing.status !== "paid") {
      return NextResponse.json(
        { error: "Only paid invoices can be saved to Dropbox" },
        { status: 400 }
      );
    }

    const result = await uploadPaidInvoiceToDropbox({
      invoiceId: id,
      force: true,
      timeoutMs: 45_000,
    });

    const invoice = await prisma.billingInvoice.findUnique({ where: { id } });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (!result.ok) {
      const status = result.code === "not_configured" ? 503 : 400;
      return NextResponse.json(
        {
          error: result.error,
          invoice: mapBillingInvoice(invoice),
        },
        { status }
      );
    }

    return NextResponse.json({
      invoice: mapBillingInvoice(invoice),
      path: result.path,
      skipped: Boolean(result.skipped),
    });
  } catch (error) {
    console.error("billing-invoice dropbox", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Dropbox upload failed" },
      { status: 500 }
    );
  }
}
