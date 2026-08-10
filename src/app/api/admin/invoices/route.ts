import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { ExpenseType, InvoiceData, InvoiceLineItem } from "@/lib/admin/invoice-types";
import { generateDocumentNumber } from "@/lib/admin/invoice-types";

function mapInvoice(record: {
  id: string;
  expenseType: string;
  documentNumber: string;
  issueDate: Date;
  payeeName: string;
  payeeEmail: string | null;
  payeeRole: string | null;
  periodLabel: string | null;
  category: string | null;
  lineItems: unknown;
  notes: string | null;
  paymentMethod: string | null;
  status: string;
}): InvoiceData {
  return {
    id: record.id,
    expenseType: (record.expenseType === "expense" ? "expense" : "salary") as ExpenseType,
    documentNumber: record.documentNumber,
    issueDate: record.issueDate.toISOString().split("T")[0],
    payeeName: record.payeeName,
    payeeEmail: record.payeeEmail || "",
    payeeRole: record.payeeRole || "",
    periodLabel: record.periodLabel || "",
    category: record.category || "",
    lineItems: (record.lineItems as InvoiceLineItem[]) || [],
    notes: record.notes || "",
    paymentMethod: record.paymentMethod || "",
    status: record.status,
  };
}

function normalize(data: InvoiceData) {
  const expenseType: ExpenseType = data.expenseType === "expense" ? "expense" : "salary";
  const filtered = (data.lineItems || []).filter((i) => i.description?.trim());

  return {
    expenseType,
    documentNumber: data.documentNumber || generateDocumentNumber(expenseType),
    issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
    payeeName: data.payeeName,
    payeeEmail: data.payeeEmail || null,
    payeeRole: data.payeeRole || null,
    periodLabel: expenseType === "salary" ? data.periodLabel || null : null,
    category: expenseType === "salary" ? "Salary" : data.category || "Other",
    lineItems: filtered.map((i) => ({
      description: i.description,
      amount: Number(i.amount) || 0,
      kind:
        expenseType === "salary"
          ? i.kind === "deduction"
            ? "deduction"
            : "earning"
          : "expense",
    })),
    notes: data.notes || null,
    paymentMethod: data.paymentMethod || null,
    status: data.status || "draft",
  };
}

export async function GET() {
  try {
    const invoices = await prisma.clientInvoice.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ invoices: invoices.map(mapInvoice) });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as InvoiceData;
    if (!data.payeeName?.trim()) {
      return NextResponse.json({ error: "Payee name required" }, { status: 400 });
    }
    const invoice = await prisma.clientInvoice.create({ data: normalize(data) });
    return NextResponse.json({ invoice: mapInvoice(invoice) });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = (await request.json()) as InvoiceData & { id: string };
    if (!data.id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    if (!data.payeeName?.trim()) {
      return NextResponse.json({ error: "Payee name required" }, { status: 400 });
    }
    const invoice = await prisma.clientInvoice.update({
      where: { id: data.id },
      data: normalize(data),
    });
    return NextResponse.json({ invoice: mapInvoice(invoice) });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await prisma.clientInvoice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
