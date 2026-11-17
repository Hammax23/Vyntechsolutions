import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/company";
import { logBillingEvent } from "@/lib/admin/billing-invoice-map";
import { calculateBillingTotals, type BillingLineItem } from "@/lib/admin/billing-invoice-types";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export type EnsureCheckoutResult =
  | { ok: true; checkoutUrl: string; created: boolean; alreadyPaid?: boolean }
  | {
      ok: false;
      error: string;
      code?: "not_configured" | "nothing_due" | "not_found" | "cancelled" | "stripe_error";
    };

/** Best-effort expire so an old emailed Stripe URL cannot still collect payment. */
export async function expireBillingCheckoutSession(
  sessionId: string | null | undefined
): Promise<void> {
  if (!sessionId || !isStripeConfigured()) return;
  try {
    await getStripe().checkout.sessions.expire(sessionId);
  } catch {
    // Already expired, completed, or not expireable — ignore
  }
}

export async function clearBillingCheckoutLink(opts: {
  invoiceId: string;
  sessionId?: string | null;
  reason: string;
}): Promise<void> {
  await expireBillingCheckoutSession(opts.sessionId);
  await prisma.billingInvoice.update({
    where: { id: opts.invoiceId },
    data: {
      checkoutUrl: null,
      stripeCheckoutSessionId: null,
    },
  });
  await logBillingEvent(prisma, opts.invoiceId, "checkout_cleared", {
    reason: opts.reason,
  });
}

/**
 * Create (or reuse) a Stripe Checkout pay link for a billing invoice.
 * Used by Get pay link + automatically when sending to the client.
 * Pass force:true to regenerate after amount edits ("Get / refresh pay link").
 */
export async function ensureBillingCheckoutUrl(opts: {
  invoiceId: string;
  origin?: string | null;
  force?: boolean;
}): Promise<EnsureCheckoutResult> {
  if (!isStripeConfigured()) {
    return { ok: false, error: "Stripe is not configured (STRIPE_SECRET_KEY)", code: "not_configured" };
  }

  const invoice = await prisma.billingInvoice.findUnique({ where: { id: opts.invoiceId } });
  if (!invoice || invoice.deletedAt) {
    return { ok: false, error: "Invoice not found", code: "not_found" };
  }
  if (invoice.status === "cancelled") {
    return { ok: false, error: "Cancelled invoice", code: "cancelled" };
  }
  if (invoice.status === "paid") {
    return {
      ok: true,
      checkoutUrl: invoice.checkoutUrl || "",
      created: false,
      alreadyPaid: true,
    };
  }

  const totals = calculateBillingTotals({
    lineItems: (invoice.lineItems as BillingLineItem[]) || [],
    discountPercent: invoice.discountPercent,
    hstPercent: invoice.hstPercent,
    amountPaid: invoice.amountPaid,
  });

  if (totals.balance <= 0) {
    return { ok: false, error: "Nothing due on this invoice", code: "nothing_due" };
  }

  // Reuse only when not forcing a refresh
  if (invoice.checkoutUrl && !opts.force) {
    return { ok: true, checkoutUrl: invoice.checkoutUrl, created: false };
  }

  if (opts.force && (invoice.stripeCheckoutSessionId || invoice.checkoutUrl)) {
    await expireBillingCheckoutSession(invoice.stripeCheckoutSessionId);
  }

  const origin = (opts.origin || SITE_URL).replace(/\/$/, "");
  let session;
  try {
    const stripe = getStripe();
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/invoice/paid?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/verify/${encodeURIComponent(invoice.invoiceNumber)}`,
      customer_email: invoice.clientEmail || undefined,
      client_reference_id: invoice.id,
      metadata: {
        billingInvoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        balanceCad: String(totals.balance),
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
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Stripe checkout failed",
      code: "stripe_error",
    };
  }

  if (!session.url) {
    return { ok: false, error: "Stripe did not return a checkout URL", code: "stripe_error" };
  }

  await prisma.billingInvoice.update({
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
    refreshed: Boolean(opts.force),
  });

  return { ok: true, checkoutUrl: session.url, created: true };
}
