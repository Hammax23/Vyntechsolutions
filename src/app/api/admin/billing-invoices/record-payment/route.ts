import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminCookieName, verifyAdminSession } from "@/lib/admin-session";
import { mapBillingInvoice, logBillingEvent } from "@/lib/admin/billing-invoice-map";
import { markBillingInvoicePaid } from "@/lib/admin/billing-invoice-service";
import { buildBillingPaymentReceivedEmail } from "@/lib/admin/billing-invoice-email";
import { renderBillingInvoicePdf } from "@/lib/admin/render-billing-invoice-pdf";
import { loadPrintLogoAttachment } from "@/lib/admin/pdf-logo";
import {
  getArchiveBccAddress,
  isValidEmail,
  MailError,
  sendMail,
} from "@/lib/mail";
import { SITE_URL } from "@/lib/company";
import {
  BILLING_OFFLINE_PAYMENT_METHODS,
  calculateBillingTotals,
  type BillingLineItem,
} from "@/lib/admin/billing-invoice-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireOwner(request: NextRequest) {
  const token = request.cookies.get(adminCookieName())?.value;
  const payload = await verifyAdminSession(token);
  if (!payload || payload.role !== "owner") return null;
  const user = await prisma.adminUser.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive || user.role !== "owner") return null;
  return { payload, user };
}

/**
 * Owner-only: record bank / e-transfer / cheque / cash payment.
 * Same Paid outcome as Stripe (Dropbox archive, project payment, audit).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwner(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Only the Owner can record offline payments" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const id = String(body.id || "").trim();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const paymentMethod = String(body.paymentMethod || "").trim();
    const paymentReference = String(body.paymentReference || "").trim();
    const paymentNote = String(body.paymentNote || "").trim();
    const sendReceipt = body.sendReceipt !== false;
    const confirmReceived = body.confirmReceived === true;

    if (!confirmReceived) {
      return NextResponse.json(
        { error: "Confirm that funds were received before recording payment" },
        { status: 400 }
      );
    }
    if (!(BILLING_OFFLINE_PAYMENT_METHODS as readonly string[]).includes(paymentMethod)) {
      return NextResponse.json(
        {
          error: `paymentMethod must be one of: ${BILLING_OFFLINE_PAYMENT_METHODS.join(", ")}`,
        },
        { status: 400 }
      );
    }
    if (paymentReference.length < 3) {
      return NextResponse.json(
        { error: "paymentReference required (bank/Interac/cheque reference)" },
        { status: 400 }
      );
    }

    const existing = await prisma.billingInvoice.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (existing.status === "cancelled") {
      return NextResponse.json({ error: "Cancelled invoices cannot be marked paid" }, { status: 400 });
    }
    if (existing.status === "paid") {
      return NextResponse.json({
        invoice: mapBillingInvoice(existing),
        alreadyPaid: true,
      });
    }
    if (!["draft", "sent", "overdue"].includes(existing.status)) {
      return NextResponse.json(
        { error: `Cannot record payment on status "${existing.status}"` },
        { status: 400 }
      );
    }

    const totals = calculateBillingTotals({
      lineItems: (existing.lineItems as BillingLineItem[]) || [],
      discountPercent: existing.discountPercent,
      hstPercent: existing.hstPercent,
      amountPaid: 0,
    });
    if (totals.total <= 0) {
      return NextResponse.json({ error: "Invoice total must be greater than zero" }, { status: 400 });
    }

    const amountPaid =
      body.amountPaid != null && body.amountPaid !== ""
        ? Number(body.amountPaid)
        : totals.total;
    if (!Number.isFinite(amountPaid) || Math.abs(amountPaid - totals.total) > 0.01) {
      return NextResponse.json(
        {
          error: `Amount must equal invoice total (${totals.total.toFixed(2)} CAD)`,
        },
        { status: 400 }
      );
    }

    let paidAt = new Date();
    if (body.paidAt) {
      const parsed = new Date(String(body.paidAt));
      if (!Number.isNaN(parsed.getTime())) paidAt = parsed;
    }

    const recordedBy = `${auth.user.name} <${auth.user.email}>`;

    const updated = await markBillingInvoicePaid({
      invoiceId: id,
      source: "admin_offline",
      paymentMethod,
      paymentReference,
      paymentNote: paymentNote || undefined,
      paymentRecordedBy: recordedBy,
      amountPaid,
      paidAt,
      dropboxTimeoutMs: 30_000,
    });

    if (!updated) {
      return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
    }

    let receiptSent = false;
    let receiptError: string | null = null;
    const mapped = mapBillingInvoice(updated);

    if (sendReceipt) {
      const to = String(updated.clientEmail || "").trim();
      if (!isValidEmail(to)) {
        receiptError = "Client email missing or invalid — receipt not sent";
      } else {
        try {
          const origin = (request.headers.get("origin") || SITE_URL).replace(/\/$/, "");
          const email = buildBillingPaymentReceivedEmail({
            invoice: mapped,
            verifyOrigin: origin,
          });
          const pdfBuffer = await renderBillingInvoicePdf({
            ...mapped,
            status: "paid",
          });
          const logoAttachment = loadPrintLogoAttachment();
          await sendMail({
            to,
            subject: email.subject,
            html: email.html,
            text: email.text,
            bcc: getArchiveBccAddress(),
            attachments: [
              logoAttachment,
              {
                filename: `VynTech-Invoice-${updated.invoiceNumber}-PAID.pdf`,
                content: Buffer.from(pdfBuffer),
                contentType: "application/pdf",
              },
            ],
          });
          receiptSent = true;
          await logBillingEvent(prisma, id, "receipt_sent", { to, kind: "offline_paid" });
        } catch (e) {
          receiptError = e instanceof MailError ? e.message : "Receipt email failed";
          await logBillingEvent(prisma, id, "receipt_failed", {
            error: receiptError,
          });
        }
      }
    }

    if (updated.projectId) {
      await prisma.activityLog.create({
        data: {
          projectId: updated.projectId,
          action: `Invoice ${updated.invoiceNumber} marked Paid (offline: ${paymentMethod})`,
          user: auth.user.name || "Owner",
        },
      });
    }

    return NextResponse.json({
      invoice: mapBillingInvoice(updated),
      receiptSent,
      receiptError,
    });
  } catch (error) {
    console.error("billing-invoice record-payment", error);
    const msg = error instanceof Error ? error.message : "Failed to record payment";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
