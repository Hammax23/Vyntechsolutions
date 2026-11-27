import prisma from "@/lib/prisma";
import { deriveBillingStatus } from "@/lib/admin/billing-invoice-status";
import { logBillingEvent } from "@/lib/admin/billing-invoice-map";
import {
  BILLING_OFFLINE_PAYMENT_METHODS,
  calculateBillingTotals,
  type BillingLineItem,
  type BillingOfflinePaymentMethod,
} from "@/lib/admin/billing-invoice-types";
import { uploadPaidInvoiceToDropbox } from "@/lib/admin/upload-paid-invoice-dropbox";
import { clearBillingCheckoutLink } from "@/lib/admin/ensure-billing-checkout";

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

function isOfflineMethod(method: string): method is BillingOfflinePaymentMethod {
  return (BILLING_OFFLINE_PAYMENT_METHODS as readonly string[]).includes(method);
}

/** Sync linked ProjectPayment → paid; ActivityLog only when status actually changes. */
async function ensureProjectPaymentPaidFromInvoice(opts: {
  projectPaymentId: string;
  projectId: string | null;
  invoiceNumber: string;
  paidAt: Date;
  actor: string;
  logActivity: boolean;
}) {
  const payment = await prisma.projectPayment.findUnique({
    where: { id: opts.projectPaymentId },
    select: { id: true, status: true, label: true },
  });
  if (!payment) return;
  if (payment.status === "paid") return;

  await prisma.projectPayment.update({
    where: { id: payment.id },
    data: { status: "paid", paidAt: opts.paidAt },
  });

  if (opts.logActivity && opts.projectId) {
    await prisma.activityLog.create({
      data: {
        projectId: opts.projectId,
        action: `Payment milestone marked paid via invoice ${opts.invoiceNumber}${
          payment.label ? ` (${payment.label})` : ""
        }`,
        user: opts.actor || "System",
      },
    });
  }
}

export type MarkPaidSource = "stripe_webhook" | "admin_offline";

export async function markBillingInvoicePaid(opts: {
  invoiceId: string;
  amountPaid?: number;
  paymentMethod?: string;
  paymentReference?: string;
  paymentNote?: string;
  paymentRecordedBy?: string;
  paidAt?: Date;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  source: MarkPaidSource;
  /** Dropbox soft timeout — webhook short, offline admin longer */
  dropboxTimeoutMs?: number;
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

  // Already paid — idempotent (Stripe retry or double-click)
  if (invoice.status === "paid") {
    await logBillingEvent(prisma, invoice.id, "paid_ignored_already_paid", {
      source: opts.source,
      existingSource: invoice.paymentSource || null,
    });
    // Repair: ensure linked ProjectPayment is paid if invoice already is
    if (invoice.projectPaymentId) {
      await ensureProjectPaymentPaidFromInvoice({
        projectPaymentId: invoice.projectPaymentId,
        projectId: invoice.projectId,
        invoiceNumber: invoice.invoiceNumber,
        paidAt: invoice.paidAt || new Date(),
        actor:
          opts.source === "stripe_webhook"
            ? "Stripe"
            : opts.paymentRecordedBy?.trim() || "System",
        logActivity: true,
      });
    }
    return invoice;
  }

  if (opts.source !== "stripe_webhook" && opts.source !== "admin_offline") {
    return null;
  }

  const totals = calculateBillingTotals({
    lineItems: (invoice.lineItems as BillingLineItem[]) || [],
    discountPercent: invoice.discountPercent,
    hstPercent: invoice.hstPercent,
    amountPaid: 0,
  });

  if (opts.source === "admin_offline") {
    const method = String(opts.paymentMethod || "").trim();
    if (!isOfflineMethod(method)) {
      throw new Error(
        "Offline payment method must be E-Transfer, Bank Transfer, Cheque, or Cash"
      );
    }
    const reference = String(opts.paymentReference || "").trim();
    if (reference.length < 3) {
      throw new Error("Payment reference is required (min 3 characters)");
    }
    const amountPaid =
      opts.amountPaid != null ? Number(opts.amountPaid) : totals.total;
    if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
      throw new Error("Amount paid must be greater than zero");
    }
    if (Math.abs(amountPaid - totals.total) > 0.01) {
      throw new Error(
        `Amount must equal invoice total (${totals.total.toFixed(2)} CAD). Partial payments are not supported.`
      );
    }
    if (!opts.paymentRecordedBy?.trim()) {
      throw new Error("paymentRecordedBy required for offline payment");
    }

    // Kill Stripe pay link so client cannot double-pay
    if (invoice.checkoutUrl || invoice.stripeCheckoutSessionId) {
      await clearBillingCheckoutLink({
        invoiceId: invoice.id,
        sessionId: invoice.stripeCheckoutSessionId,
        reason: "offline_paid",
      });
    }

    const paidAt = opts.paidAt && !Number.isNaN(opts.paidAt.getTime()) ? opts.paidAt : new Date();
    const updated = await prisma.billingInvoice.update({
      where: { id: invoice.id },
      data: {
        status: "paid",
        amountPaid: Math.round(amountPaid * 100) / 100,
        paidAt,
        paymentMethod: method,
        paymentSource: "offline",
        paymentReference: reference,
        paymentNote: opts.paymentNote?.trim() || null,
        paymentRecordedBy: opts.paymentRecordedBy.trim(),
        checkoutUrl: null,
        lastSendError: null,
      },
    });

    await logBillingEvent(prisma, invoice.id, "paid", {
      source: "admin_offline",
      amountPaid: updated.amountPaid,
      paymentMethod: method,
      paymentReference: reference,
      recordedBy: opts.paymentRecordedBy.trim(),
    });

    if (invoice.projectPaymentId) {
      await ensureProjectPaymentPaidFromInvoice({
        projectPaymentId: invoice.projectPaymentId,
        projectId: invoice.projectId,
        invoiceNumber: invoice.invoiceNumber,
        paidAt,
        actor: opts.paymentRecordedBy.trim(),
        logActivity: true,
      });
    }

    try {
      await uploadPaidInvoiceToDropbox({
        invoiceId: updated.id,
        force: false,
        timeoutMs: opts.dropboxTimeoutMs ?? 30_000,
      });
    } catch (e) {
      console.error("dropbox archive after offline paid", e);
    }

    const withDropbox = await prisma.billingInvoice.findUnique({ where: { id: updated.id } });
    return withDropbox || updated;
  }

  // —— Stripe webhook path ——
  const amountPaid = opts.amountPaid != null ? opts.amountPaid : totals.total;
  const stripePaidAt = new Date();
  const updated = await prisma.billingInvoice.update({
    where: { id: invoice.id },
    data: {
      status: "paid",
      amountPaid,
      paidAt: stripePaidAt,
      paymentMethod: opts.paymentMethod || invoice.paymentMethod || "Credit Card",
      paymentSource: "stripe",
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
    await ensureProjectPaymentPaidFromInvoice({
      projectPaymentId: invoice.projectPaymentId,
      projectId: invoice.projectId,
      invoiceNumber: invoice.invoiceNumber,
      paidAt: stripePaidAt,
      actor: "Stripe",
      logActivity: true,
    });
  }

  try {
    await uploadPaidInvoiceToDropbox({
      invoiceId: updated.id,
      force: false,
      timeoutMs: opts.dropboxTimeoutMs ?? 8_000,
    });
  } catch (e) {
    console.error("dropbox archive after paid", e);
  }

  const withDropbox = await prisma.billingInvoice.findUnique({ where: { id: updated.id } });
  return withDropbox || updated;
}
