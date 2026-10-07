import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type {
  BillingInvoiceData,
  BillingInvoiceStatus,
} from "@/lib/admin/billing-invoice-types";
import { calculateBillingTotals } from "@/lib/admin/billing-invoice-types";
import { allocateNextBillingInvoiceNumber } from "@/lib/admin/allocate-billing-invoice-number";
import { mapBillingInvoice, logBillingEvent } from "@/lib/admin/billing-invoice-map";
import { resolveStatusAfterSave } from "@/lib/admin/billing-invoice-status";
import { markBillingInvoicePaid, sweepOverdueBillingInvoices } from "@/lib/admin/billing-invoice-service";

function normalize(data: BillingInvoiceData) {
  const lineItems = (data.lineItems || [])
    .filter((i) => i.description?.trim())
    .map((i) => ({
      description: i.description.trim(),
      quantity: Number(i.quantity) || 0,
      rate: Number(i.rate) || 0,
    }));

  const status = (["draft", "sent", "paid", "overdue", "cancelled"].includes(data.status)
    ? data.status
    : "draft") as BillingInvoiceStatus;

  return {
    invoiceNumber: data.invoiceNumber?.trim() || "",
    issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    clientName: data.clientName.trim(),
    companyName: data.companyName?.trim() || null,
    clientEmail: data.clientEmail?.trim() || null,
    clientPhone: data.clientPhone?.trim() || null,
    clientAddress: data.clientAddress?.trim() || null,
    projectTitle: data.projectTitle?.trim() || null,
    lineItems,
    discountPercent: Number(data.discountPercent) || 0,
    hstPercent: Number(data.hstPercent) || 0,
    amountPaid: Number(data.amountPaid) || 0,
    paymentMethod: data.paymentMethod?.trim() || null,
    paymentTerms: data.paymentTerms?.trim() || null,
    notes: data.notes?.trim() || null,
    status,
    projectId: data.projectId || null,
    projectPaymentId: data.projectPaymentId || null,
  };
}

export async function GET(request: NextRequest) {
  try {
    await sweepOverdueBillingInvoices();
    const invoices = await prisma.billingInvoice.findMany({ orderBy: { createdAt: "desc" } });
    const mapped = invoices.map(mapBillingInvoice);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let outstanding = 0;
    const kpis = { draft: 0, sent: 0, overdue: 0, paidMonth: 0, outstanding: 0 };

    for (const inv of mapped) {
      if (inv.status === "draft") kpis.draft += 1;
      if (inv.status === "sent") kpis.sent += 1;
      if (inv.status === "overdue") kpis.overdue += 1;
      if (inv.status === "paid" && inv.paidAt && new Date(inv.paidAt) >= monthStart) {
        kpis.paidMonth += 1;
      }
      if (inv.status === "sent" || inv.status === "overdue") {
        outstanding += calculateBillingTotals(inv).balance;
      }
    }
    kpis.outstanding = Math.round(outstanding * 100) / 100;

    const id = request.nextUrl.searchParams.get("id");
    if (id) {
      const row = invoices.find((i) => i.id === id);
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const events = await prisma.billingInvoiceEvent.findMany({
        where: { invoiceId: id },
        orderBy: { createdAt: "desc" },
        take: 30,
      });
      return NextResponse.json({
        invoice: mapBillingInvoice(row),
        events: events.map((e) => ({
          id: e.id,
          type: e.type,
          meta: e.meta,
          createdAt: e.createdAt.toISOString(),
        })),
        kpis,
      });
    }

    return NextResponse.json({ invoices: mapped, kpis });
  } catch (error) {
    console.error("Error fetching billing invoices:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body?.action === "record_payment" && body.id) {
      const amount = Number(body.amountPaid);
      const updated = await markBillingInvoicePaid({
        invoiceId: String(body.id),
        amountPaid: Number.isFinite(amount) ? amount : undefined,
        paymentMethod: body.paymentMethod ? String(body.paymentMethod) : undefined,
        source: "manual",
      });
      if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ invoice: mapBillingInvoice(updated) });
    }

    const data = body as BillingInvoiceData;
    if (!data.clientName?.trim()) {
      return NextResponse.json({ error: "Client name required" }, { status: 400 });
    }
    const payload = normalize(data);
    payload.status = resolveStatusAfterSave({
      previousStatus: "draft",
      requestedStatus: payload.status,
      dueDate: payload.dueDate,
      amountPaid: payload.amountPaid,
      lineItems: payload.lineItems,
      discountPercent: payload.discountPercent,
      hstPercent: payload.hstPercent,
    });

    const requested = payload.invoiceNumber;
    if (requested) {
      const taken = await prisma.billingInvoice.findUnique({
        where: { invoiceNumber: requested },
        select: { id: true },
      });
      if (taken) payload.invoiceNumber = await allocateNextBillingInvoiceNumber();
    } else {
      payload.invoiceNumber = await allocateNextBillingInvoiceNumber();
    }

    if (payload.projectPaymentId) {
      const existingLink = await prisma.billingInvoice.findUnique({
        where: { projectPaymentId: payload.projectPaymentId },
        select: { id: true },
      });
      if (existingLink) {
        return NextResponse.json(
          { error: "An invoice already exists for this payment milestone", invoiceId: existingLink.id },
          { status: 409 }
        );
      }
    }

    try {
      const invoice = await prisma.billingInvoice.create({
        data: {
          ...payload,
          paidAt: payload.status === "paid" ? new Date() : null,
        },
      });
      await logBillingEvent(prisma, invoice.id, "created", {
        invoiceNumber: invoice.invoiceNumber,
      });
      return NextResponse.json({ invoice: mapBillingInvoice(invoice) });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "P2002") {
        payload.invoiceNumber = await allocateNextBillingInvoiceNumber();
        const invoice = await prisma.billingInvoice.create({
          data: {
            ...payload,
            paidAt: payload.status === "paid" ? new Date() : null,
          },
        });
        await logBillingEvent(prisma, invoice.id, "created", {
          invoiceNumber: invoice.invoiceNumber,
        });
        return NextResponse.json({ invoice: mapBillingInvoice(invoice) });
      }
      throw err;
    }
  } catch (error) {
    console.error("Error creating billing invoice:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = (await request.json()) as BillingInvoiceData & { id: string };
    if (!data.id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    if (!data.clientName?.trim()) {
      return NextResponse.json({ error: "Client name required" }, { status: 400 });
    }

    const existing = await prisma.billingInvoice.findUnique({ where: { id: data.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const payload = normalize(data);
    if (!payload.invoiceNumber) {
      payload.invoiceNumber =
        existing.invoiceNumber || (await allocateNextBillingInvoiceNumber());
    }

    if (existing.status === "paid") {
      // After paid: only notes / cancel / payment method notes-ish fields
      const invoice = await prisma.billingInvoice.update({
        where: { id: data.id },
        data: {
          notes: payload.notes,
          status: payload.status === "cancelled" ? "cancelled" : existing.status,
          paymentMethod: payload.paymentMethod,
          paymentTerms: payload.paymentTerms,
        },
      });
      return NextResponse.json({ invoice: mapBillingInvoice(invoice) });
    }

    payload.status = resolveStatusAfterSave({
      previousStatus: existing.status,
      requestedStatus: payload.status,
      dueDate: payload.dueDate,
      amountPaid: payload.amountPaid,
      lineItems: payload.lineItems,
      discountPercent: payload.discountPercent,
      hstPercent: payload.hstPercent,
    });

    const invoice = await prisma.billingInvoice.update({
      where: { id: data.id },
      data: {
        ...payload,
        paidAt:
          payload.status === "paid"
            ? existing.paidAt || new Date()
            : null,
        projectPaymentId: payload.projectPaymentId || existing.projectPaymentId,
      },
    });

    if (payload.status === "paid" && existing.status !== "paid") {
      await logBillingEvent(prisma, invoice.id, "payment_recorded", { source: "admin_edit" });
      if (invoice.projectPaymentId) {
        await prisma.projectPayment.update({
          where: { id: invoice.projectPaymentId },
          data: { status: "paid", paidAt: new Date() },
        });
      }
    }

    return NextResponse.json({ invoice: mapBillingInvoice(invoice) });
  } catch (error) {
    console.error("Error updating billing invoice:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const existing = await prisma.billingInvoice.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.status === "paid") {
      return NextResponse.json(
        { error: "Paid invoices cannot be deleted. Cancel instead if needed." },
        { status: 400 }
      );
    }
    await prisma.billingInvoice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting billing invoice:", error);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
