import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { ExpenseType, InvoiceLineItem } from "@/lib/admin/invoice-types";
import { calculateInvoiceTotals, formatCad } from "@/lib/admin/invoice-types";

type Params = { params: { docNumber: string } };

export async function GET(_request: Request, { params }: Params) {
  try {
    const documentNumber = decodeURIComponent(params.docNumber || "").trim();
    if (!documentNumber) {
      return NextResponse.json({ error: "Document number required" }, { status: 400 });
    }

    const record = await prisma.clientInvoice.findUnique({
      where: { documentNumber },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Document not found. This verification code is not issued by VynTech Solutions." },
        { status: 404 }
      );
    }

    const expenseType = (record.expenseType === "expense" ? "expense" : "salary") as ExpenseType;
    const lineItems = (record.lineItems as InvoiceLineItem[]) || [];
    const totals = calculateInvoiceTotals({ expenseType, lineItems });

    return NextResponse.json({
      verified: true,
      issuedBy: "VynTech Admin",
      company: "VynTech Solutions Inc.",
      document: {
        expenseType,
        documentNumber: record.documentNumber,
        issueDate: record.issueDate.toISOString().split("T")[0],
        payeeName: record.payeeName,
        payeeRole: record.payeeRole || "",
        periodLabel: record.periodLabel || "",
        category: record.category || "",
        paymentMethod: record.paymentMethod || "",
        status: record.status,
        amountLabel: expenseType === "salary" ? "Net Pay" : "Total",
        amount: formatCad(totals.total),
        amountValue: totals.total,
        createdAt: record.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Verify document error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
