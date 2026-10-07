import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mapBillingInvoice, logBillingEvent } from "@/lib/admin/billing-invoice-map";
import { buildBillingInvoiceEmail } from "@/lib/admin/billing-invoice-email";
import { renderBillingInvoicePdf } from "@/lib/admin/render-billing-invoice-pdf";
import { loadPrintLogoAttachment } from "@/lib/admin/pdf-logo";
import {
  getAdminTestAddress,
  getArchiveBccAddress,
  isValidEmail,
  MailError,
  sendMail,
} from "@/lib/mail";
import { SITE_URL } from "@/lib/company";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = String(body.id || "").trim();
    const kind = body.kind === "test" ? "test" : "client";
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const row = await prisma.billingInvoice.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    if (row.status === "cancelled") {
      return NextResponse.json({ error: "Cancelled invoices cannot be sent" }, { status: 400 });
    }

    const invoice = mapBillingInvoice(row);
    const to =
      kind === "test"
        ? getAdminTestAddress()
        : String(invoice.clientEmail || "").trim();

    if (!isValidEmail(to)) {
      return NextResponse.json(
        {
          error:
            kind === "test"
              ? "Admin test email not configured"
              : "Client email required before sending",
        },
        { status: 400 }
      );
    }

    const origin =
      request.headers.get("x-forwarded-proto") && request.headers.get("x-forwarded-host")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
        : SITE_URL;

    const email = buildBillingInvoiceEmail({
      invoice,
      payUrl: invoice.checkoutUrl,
      verifyOrigin: origin,
    });

    const pdfBuffer = await renderBillingInvoicePdf(invoice);
    const logoAttachment = loadPrintLogoAttachment();
    const bcc = kind === "client" ? getArchiveBccAddress() : null;

    try {
      await sendMail({
        to,
        subject: kind === "test" ? `[TEST] ${email.subject}` : email.subject,
        html: email.html,
        text: email.text,
        bcc,
        attachments: [
          logoAttachment,
          {
            filename: `VynTech-Invoice-${invoice.invoiceNumber}.pdf`,
            content: Buffer.from(pdfBuffer),
            contentType: "application/pdf",
          },
        ],
      });
    } catch (e) {
      const msg = e instanceof MailError ? e.message : "Email failed";
      await prisma.billingInvoice.update({
        where: { id },
        data: { lastSendError: msg },
      });
      await logBillingEvent(prisma, id, "send_failed", { kind, error: msg });
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    if (kind === "client") {
      const updated = await prisma.billingInvoice.update({
        where: { id },
        data: {
          status: row.status === "paid" ? "paid" : row.status === "overdue" ? "overdue" : "sent",
          sentAt: new Date(),
          sentTo: to,
          lastSendError: null,
        },
      });
      await logBillingEvent(prisma, id, "sent", { to, kind });
      if (updated.projectId) {
        await prisma.activityLog.create({
          data: {
            projectId: updated.projectId,
            action: `Invoice ${updated.invoiceNumber} emailed to ${to}`,
            user: "Admin",
          },
        });
      }
      return NextResponse.json({
        invoice: mapBillingInvoice(updated),
        sentTo: to,
        testTo: getAdminTestAddress(),
      });
    }

    await logBillingEvent(prisma, id, "sent_test", { to });
    return NextResponse.json({
      invoice: mapBillingInvoice(row),
      sentTo: to,
      testTo: to,
    });
  } catch (error) {
    console.error("billing-invoice send", error);
    return NextResponse.json({ error: "Failed to send invoice" }, { status: 500 });
  }
}
