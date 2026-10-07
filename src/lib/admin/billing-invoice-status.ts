import type { BillingInvoiceStatus } from "@/lib/admin/billing-invoice-types";
import { calculateBillingTotals, type BillingLineItem } from "@/lib/admin/billing-invoice-types";

export function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

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

export function resolveStatusAfterSave(input: {
  previousStatus: string;
  requestedStatus: string;
  dueDate: Date | null;
  amountPaid: number;
  lineItems: unknown;
  discountPercent: number;
  hstPercent: number;
}): BillingInvoiceStatus {
  const requested = (["draft", "sent", "paid", "overdue", "cancelled"].includes(input.requestedStatus)
    ? input.requestedStatus
    : "draft") as BillingInvoiceStatus;

  if (requested === "cancelled") return "cancelled";

  const totals = calculateBillingTotals({
    lineItems: (input.lineItems as BillingLineItem[]) || [],
    discountPercent: input.discountPercent,
    hstPercent: input.hstPercent,
    amountPaid: input.amountPaid,
  });

  if (totals.total > 0 && totals.balance <= 0) return "paid";
  if (requested === "paid") return "paid";

  if (requested === "sent" || requested === "overdue") {
    return deriveBillingStatus({
      status: "sent",
      dueDate: input.dueDate,
      amountPaid: input.amountPaid,
      lineItems: input.lineItems,
      discountPercent: input.discountPercent,
      hstPercent: input.hstPercent,
    });
  }

  if (requested === "draft") {
    if (input.previousStatus === "paid") return "paid";
    return "draft";
  }

  return requested;
}
