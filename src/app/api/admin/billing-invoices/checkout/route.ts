import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/company";
import { mapBillingInvoice } from "@/lib/admin/billing-invoice-map";
import { ensureBillingCheckoutUrl } from "@/lib/admin/ensure-billing-checkout";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = String(body.id || "").trim();
    const force = Boolean(body.force ?? body.refresh);
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const origin =
      request.headers.get("x-forwarded-proto") && request.headers.get("x-forwarded-host")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
        : SITE_URL;

    const result = await ensureBillingCheckoutUrl({ invoiceId: id, origin, force });
    if (!result.ok) {
      const status =
        result.code === "not_configured"
          ? 503
          : result.code === "not_found"
            ? 404
            : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    const invoice = await prisma.billingInvoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    return NextResponse.json({
      invoice: mapBillingInvoice(invoice),
      checkoutUrl: result.checkoutUrl,
      alreadyPaid: Boolean(result.alreadyPaid),
      created: result.created,
    });
  } catch (error) {
    console.error("billing checkout", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
