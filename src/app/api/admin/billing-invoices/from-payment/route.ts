import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { allocateNextBillingInvoiceNumber } from "@/lib/admin/allocate-billing-invoice-number";
import { DEFAULT_PAYMENT_TERMS } from "@/lib/admin/billing-invoice-types";
import { mapBillingInvoice, logBillingEvent } from "@/lib/admin/billing-invoice-map";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const projectId = String(body.projectId || "").trim();
    const paymentId = String(body.paymentId || "").trim();
    if (!projectId || !paymentId) {
      return NextResponse.json({ error: "projectId and paymentId required" }, { status: 400 });
    }

    const existing = await prisma.billingInvoice.findUnique({
      where: { projectPaymentId: paymentId },
    });
    if (existing) {
      return NextResponse.json({
        invoice: mapBillingInvoice(existing),
        existing: true,
      });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const payment = await prisma.projectPayment.findFirst({
      where: { id: paymentId, projectId },
    });
    if (!payment) {
      return NextResponse.json({ error: "Payment milestone not found" }, { status: 404 });
    }

    const today = new Date();
    const due = payment.dueDate
      ? new Date(payment.dueDate)
      : new Date(today.getTime() + 15 * 86400000);

    const invoice = await prisma.billingInvoice.create({
      data: {
        invoiceNumber: await allocateNextBillingInvoiceNumber(),
        issueDate: today,
        dueDate: due,
        clientName: project.clientName,
        companyName: project.companyName || null,
        clientEmail: project.clientEmail || null,
        clientPhone: project.clientPhone || null,
        clientAddress: null,
        projectTitle: project.projectName,
        lineItems: [
          {
            description: payment.label,
            quantity: 1,
            rate: Number(payment.amount) || 0,
          },
        ],
        discountPercent: 0,
        hstPercent: 13,
        amountPaid: 0,
        paymentMethod: "Credit Card",
        paymentTerms: DEFAULT_PAYMENT_TERMS,
        notes: null,
        status: "draft",
        projectId: project.id,
        projectPaymentId: payment.id,
      },
    });

    await logBillingEvent(prisma, invoice.id, "created", {
      source: "from_payment",
      paymentId: payment.id,
    });

    await prisma.activityLog.create({
      data: {
        projectId: project.id,
        action: `Invoice ${invoice.invoiceNumber} created for milestone “${payment.label}”`,
        user: "Admin",
      },
    });

    return NextResponse.json({ invoice: mapBillingInvoice(invoice), existing: false });
  } catch (error) {
    console.error("from-payment invoice", error);
    return NextResponse.json({ error: "Failed to create invoice from payment" }, { status: 500 });
  }
}
