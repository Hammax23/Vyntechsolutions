import prisma from "@/lib/prisma";
import { deriveBillingStatus } from "@/lib/admin/billing-invoice-status";
import { logBillingEvent } from "@/lib/admin/billing-invoice-map";
import { calculateBillingTotals, type BillingLineItem } from "@/lib/admin/billing-invoice-types";

export async function sweepOverdueBillingInvoices(): Promise<number> {
  const candidates = await prisma.billingInvoice.findMany({
    where: {
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
  if (!invoice) return null;

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

  return updated;
}
