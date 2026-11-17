import type { BillingInvoiceStatus } from "@/lib/admin/billing-invoice-types";
import { calculateBillingTotals, type BillingLineItem } from "@/lib/admin/billing-invoice-types";

export function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/**
 * System-side status derivation (overdue sweep, post-Stripe).
 * May return "paid" only when amountPaid already covers the total (set by Stripe webhook).
 */
export function deriveBillingStatus(input: {
  status: string;
  dueDate: Date | null;
  amountPaid: number;
  lineItems: unknown;
  discountPercent: number;
  hstPercent: number;
}): BillingInvoiceStatus {
  const current = (["draft", "sent", "paid", "overdue", "cancelled"].includes(input.status)
    ? input.status
    : "draft") as BillingInvoiceStatus;

  if (current === "cancelled") return "cancelled";

  const totals = calculateBillingTotals({
    lineItems: (input.lineItems as BillingLineItem[]) || [],
    discountPercent: input.discountPercent,
    hstPercent: input.hstPercent,
    amountPaid: input.amountPaid,
  });

  // Paid only when payment was recorded (Stripe) — balance cleared
  if (totals.total > 0 && totals.balance <= 0) return "paid";
  if (current === "paid") return "paid";
  if (current === "draft") return "draft";

  if (input.dueDate) {
    const due = new Date(input.dueDate);
    const dueDay = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
    if (dueDay < startOfTodayUtc().getTime()) return "overdue";
  }

  if (current === "overdue") return "overdue";
  return "sent";
}

/**
 * Admin create/update status rules.
 * IMPORTANT: Admin can NEVER mark an invoice paid — only Stripe webhook can.
 */
export function resolveStatusAfterSave(input: {
  previousStatus: string;
  requestedStatus: string;
  dueDate: Date | null;
  amountPaid: number;
  lineItems: unknown;
  discountPercent: number;
  hstPercent: number;
}): BillingInvoiceStatus {
  const previous = (["draft", "sent", "paid", "overdue", "cancelled"].includes(input.previousStatus)
    ? input.previousStatus
    : "draft") as BillingInvoiceStatus;

  // Once paid via Stripe, stay paid (admin cannot undo via save)
  if (previous === "paid") return "paid";

  const requested = (["draft", "sent", "paid", "overdue", "cancelled"].includes(input.requestedStatus)
    ? input.requestedStatus
    : "draft") as BillingInvoiceStatus;

  if (requested === "cancelled") return "cancelled";

  // Ignore admin requesting "paid" or stuffing amountPaid to clear balance
  if (requested === "draft") return "draft";

  // sent / overdue / ignored "paid" → derive sent vs overdue only (never paid from save)
  const derived = deriveBillingStatus({
    status: "sent",
    dueDate: input.dueDate,
    // Use 0 so balance-based paid cannot trigger from admin payload
    amountPaid: 0,
    lineItems: input.lineItems,
    discountPercent: input.discountPercent,
    hstPercent: input.hstPercent,
  });

  if (derived === "paid") return "sent";
  return derived;
}
