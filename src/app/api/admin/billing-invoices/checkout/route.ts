import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/company";
import { mapBillingInvoice, logBillingEvent } from "@/lib/admin/billing-invoice-map";
import { calculateBillingTotals, type BillingLineItem } from "@/lib/admin/billing-invoice-types";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe is not configured (STRIPE_SECRET_KEY)" },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const id = String(body.id || "").trim();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const invoice = await prisma.billingInvoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    if (invoice.status === "cancelled") {
      return NextResponse.json({ error: "Cancelled invoice" }, { status: 400 });
    }
    if (invoice.status === "paid") {
      return NextResponse.json({
        invoice: mapBillingInvoice(invoice),
        checkoutUrl: invoice.checkoutUrl,
        alreadyPaid: true,
      });
    }

    const totals = calculateBillingTotals({
      lineItems: (invoice.lineItems as BillingLineItem[]) || [],
      discountPercent: invoice.discountPercent,
      hstPercent: invoice.hstPercent,
      amountPaid: invoice.amountPaid,
    });

    if (totals.balance <= 0) {
      return NextResponse.json({ error: "Nothing due on this invoice" }, { status: 400 });
    }

    const origin =
      request.headers.get("x-forwarded-proto") && request.headers.get("x-forwarded-host")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
        : SITE_URL;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/invoice/paid?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/verify/${encodeURIComponent(invoice.invoiceNumber)}`,
      customer_email: invoice.clientEmail || undefined,
      client_reference_id: invoice.id,
      metadata: {
        billingInvoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: Math.round(totals.balance * 100),
            product_data: {
              name: `Invoice ${invoice.invoiceNumber}`,
              description:
                invoice.projectTitle ||
                `Payment to VynTech Solutions${invoice.clientName ? ` — ${invoice.clientName}` : ""}`,
            },
          },
        },
      ],
    });

    const updated = await prisma.billingInvoice.update({
      where: { id: invoice.id },
      data: {
        stripeCheckoutSessionId: session.id,
        checkoutUrl: session.url,
        paymentMethod: invoice.paymentMethod || "Credit Card",
      },
    });

    await logBillingEvent(prisma, invoice.id, "checkout_created", {
      sessionId: session.id,
      balance: totals.balance,
    });

    return NextResponse.json({
      invoice: mapBillingInvoice(updated),
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("billing checkout", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
