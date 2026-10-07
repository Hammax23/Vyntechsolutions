import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { markBillingInvoicePaid } from "@/lib/admin/billing-invoice-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secret = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("stripe webhook signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const seen = await prisma.stripeWebhookEvent.findUnique({ where: { id: event.id } });
  if (seen) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as {
        id: string;
        payment_intent?: string | null;
        metadata?: { billingInvoiceId?: string };
        amount_total?: number | null;
      };
      const invoiceId = session.metadata?.billingInvoiceId;
      if (invoiceId) {
        await markBillingInvoicePaid({
          invoiceId,
          amountPaid:
            typeof session.amount_total === "number"
              ? session.amount_total / 100
              : undefined,
          paymentMethod: "Credit Card",
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: session.payment_intent
            ? String(session.payment_intent)
            : undefined,
          source: "stripe_webhook",
        });
      }
    }

    await prisma.stripeWebhookEvent.create({
      data: { id: event.id, type: event.type },
    });
  } catch (error) {
    console.error("stripe webhook handler", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
