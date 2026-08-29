import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type {
  BillingInvoiceData,
  BillingInvoiceStatus,
  BillingLineItem,
} from "@/lib/admin/billing-invoice-types";
import { generateInvoiceNumber } from "@/lib/admin/billing-invoice-types";

function mapInvoice(record: {
  id: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date | null;
  clientName: string;
  companyName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  clientAddress: string | null;
  projectTitle: string | null;
  lineItems: unknown;
  discountPercent: number;
  hstPercent: number;
  amountPaid: number;
  paymentMethod: string | null;
  paymentTerms: string | null;
  notes: string | null;
  status: string;
  projectId: string | null;
}): BillingInvoiceData {
  return {
    id: record.id,
    invoiceNumber: record.invoiceNumber,
    issueDate: record.issueDate.toISOString().split("T")[0],
    dueDate: record.dueDate ? record.dueDate.toISOString().split("T")[0] : "",
    clientName: record.clientName,
    companyName: record.companyName || "",
    clientEmail: record.clientEmail || "",
    clientPhone: record.clientPhone || "",
    clientAddress: record.clientAddress || "",
    projectTitle: record.projectTitle || "",
    lineItems: (record.lineItems as BillingLineItem[]) || [],
    discountPercent: record.discountPercent,
    hstPercent: record.hstPercent,
    amountPaid: record.amountPaid,
    paymentMethod: record.paymentMethod || "",
    paymentTerms: record.paymentTerms || "",
    notes: record.notes || "",
    status: (record.status as BillingInvoiceStatus) || "draft",
    projectId: record.projectId,
  };
}

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
    invoiceNumber: data.invoiceNumber || generateInvoiceNumber(),
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
  };
}

export async function GET() {
  try {
    const invoices = await prisma.billingInvoice.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ invoices: invoices.map(mapInvoice) });
  } catch (error) {
    console.error("Error fetching billing invoices:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as BillingInvoiceData;
    if (!data.clientName?.trim()) {
      return NextResponse.json({ error: "Client name required" }, { status: 400 });
    }
    const invoice = await prisma.billingInvoice.create({ data: normalize(data) });
    return NextResponse.json({ invoice: mapInvoice(invoice) });
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
    const invoice = await prisma.billingInvoice.update({
      where: { id: data.id },
      data: normalize(data),
    });
    return NextResponse.json({ invoice: mapInvoice(invoice) });
  } catch (error) {
    console.error("Error updating billing invoice:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await prisma.billingInvoice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting billing invoice:", error);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
