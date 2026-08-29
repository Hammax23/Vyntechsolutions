import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { ExpenseType, InvoiceLineItem } from "@/lib/admin/invoice-types";
import { calculateInvoiceTotals, formatCad } from "@/lib/admin/invoice-types";
import type { BillingLineItem } from "@/lib/admin/billing-invoice-types";
import { calculateBillingTotals, formatCad as formatBillingCad } from "@/lib/admin/billing-invoice-types";

type Params = { params: { docNumber: string } };

export async function GET(_request: Request, { params }: Params) {
  try {
    const documentNumber = decodeURIComponent(params.docNumber || "").trim();
    if (!documentNumber) {
      return NextResponse.json({ error: "Document number required" }, { status: 400 });
    }

    const expense = await prisma.clientInvoice.findUnique({
      where: { documentNumber },
    });

    if (expense) {
      const expenseType = (expense.expenseType === "expense" ? "expense" : "salary") as ExpenseType;
      const lineItems = (expense.lineItems as InvoiceLineItem[]) || [];
      const totals = calculateInvoiceTotals({ expenseType, lineItems });

      return NextResponse.json({
        verified: true,
        issuedBy: "VynTech Admin",
        company: "VynTech Solutions Inc.",
        documentType: expenseType === "salary" ? "salary_slip" : "expense_voucher",
        document: {
          expenseType,
          documentNumber: expense.documentNumber,
          issueDate: expense.issueDate.toISOString().split("T")[0],
          payeeName: expense.payeeName,
          payeeRole: expense.payeeRole || "",
          periodLabel: expense.periodLabel || "",
          category: expense.category || "",
          paymentMethod: expense.paymentMethod || "",
          status: expense.status,
          amountLabel: expenseType === "salary" ? "Net Pay" : "Total",
          amount: formatCad(totals.total),
          amountValue: totals.total,
          createdAt: expense.createdAt.toISOString(),
        },
      });
    }

    const billing = await prisma.billingInvoice.findUnique({
      where: { invoiceNumber: documentNumber },
    });

    if (billing) {
      const lineItems = (billing.lineItems as BillingLineItem[]) || [];
      const totals = calculateBillingTotals({
        lineItems,
        discountPercent: billing.discountPercent,
        hstPercent: billing.hstPercent,
        amountPaid: billing.amountPaid,
      });

      return NextResponse.json({
        verified: true,
        issuedBy: "VynTech Admin",
        company: "VynTech Solutions Inc.",
        documentType: "client_invoice",
        document: {
          documentNumber: billing.invoiceNumber,
          issueDate: billing.issueDate.toISOString().split("T")[0],
          dueDate: billing.dueDate ? billing.dueDate.toISOString().split("T")[0] : "",
          payeeName: billing.clientName,
          clientName: billing.clientName,
          companyName: billing.companyName || "",
          projectTitle: billing.projectTitle || "",
          paymentMethod: billing.paymentMethod || "",
          status: billing.status,
          amountLabel: "Total Due",
          amount: formatBillingCad(totals.total),
          amountValue: totals.total,
          balance: formatBillingCad(totals.balance),
          createdAt: billing.createdAt.toISOString(),
        },
      });
    }

    return NextResponse.json(
      { error: "Document not found. This verification code is not issued by VynTech Solutions." },
      { status: 404 }
    );
  } catch (error) {
    console.error("Verify document error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
