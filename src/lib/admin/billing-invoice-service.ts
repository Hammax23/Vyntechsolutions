import prisma from "@/lib/prisma";
import { deriveBillingStatus } from "@/lib/admin/billing-invoice-status";
import { logBillingEvent } from "@/lib/admin/billing-invoice-map";
import { calculateBillingTotals, type BillingLineItem } from "@/lib/admin/billing-invoice-types";
import { uploadPaidInvoiceToDropbox } from "@/lib/admin/upload-paid-invoice-dropbox";

export async function sweepOverdueBillingInvoices(): Promise<number> {
  const candidates = await prisma.billingInvoice.findMany({
    where: {
      deletedAt: null,
      status: "sent",
      dueDate: { lt: new Date() },
    },
    select: {
      id: true,
      status: true,
      dueDate: true,
      amountPaid: true,
      lineItems: true,
      discountPercent: true,
      hstPercent: true,
    },
  });

  let updated = 0;
  for (const row of candidates) {
    const next = deriveBillingStatus(row);
    if (next !== row.status) {
      await prisma.billingInvoice.update({
        where: { id: row.id },
        data: { status: next },
      });
      await logBillingEvent(prisma, row.id, "overdue", { previous: row.status });
      updated += 1;
    }
  }
  return updated;
}

export async function markBillingInvoicePaid(opts: {
  invoiceId: string;
  amountPaid?: number;
  paymentMethod?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  source: string;
}) {
  const invoice = await prisma.billingInvoice.findUnique({ where: { id: opts.invoiceId } });
  if (!invoice || invoice.deletedAt) return null;

  // Cancelled invoices must not flip to Paid if an old Stripe link is still used
  if (invoice.status === "cancelled") {
    await logBillingEvent(prisma, invoice.id, "paid_ignored_cancelled", {
      source: opts.source,
      sessionId: opts.stripeCheckoutSessionId || null,
    });
    return null;
  }

  // Only Stripe (or trusted system callers) may mark paid — never manual admin
  if (opts.source !== "stripe_webhook") {
    return null;
  }

  const totals = calculateBillingTotals({
    lineItems: (invoice.lineItems as BillingLineItem[]) || [],
    discountPercent: invoice.discountPercent,
    hstPercent: invoice.hstPercent,
    amountPaid: 0,
  });

  const amountPaid = opts.amountPaid != null ? opts.amountPaid : totals.total;
  const updated = await prisma.billingInvoice.update({
    where: { id: invoice.id },
    data: {
      status: "paid",
      amountPaid,
      paidAt: new Date(),
      paymentMethod: opts.paymentMethod || invoice.paymentMethod || "Credit Card",
      stripeCheckoutSessionId: opts.stripeCheckoutSessionId || invoice.stripeCheckoutSessionId,
      stripePaymentIntentId: opts.stripePaymentIntentId || invoice.stripePaymentIntentId,
      lastSendError: null,
    },
  });

  await logBillingEvent(prisma, invoice.id, "paid", {
    source: opts.source,
    amountPaid,
  });

  if (invoice.projectPaymentId) {
    await prisma.projectPayment.update({
      where: { id: invoice.projectPaymentId },
      data: { status: "paid", paidAt: new Date() },
    });
  }

  // Archive paid PDF to Dropbox — never throw into Stripe webhook
  try {
    await uploadPaidInvoiceToDropbox({
      invoiceId: updated.id,
      force: false,
      timeoutMs: 8_000,
    });
  } catch (e) {
    console.error("dropbox archive after paid", e);
  }

  // Re-read so response includes dropbox fields when available
  const withDropbox = await prisma.billingInvoice.findUnique({ where: { id: updated.id } });
  return withDropbox || updated;
}
