import type { InvoiceData } from "./invoice-types";
import { generateDocumentNumber } from "./invoice-types";

function currentPeriodLabel(): string {
  return new Date().toLocaleDateString("en-CA", { month: "long", year: "numeric" });
}

export function createDefaultInvoice(expenseType: InvoiceData["expenseType"] = "salary"): InvoiceData {
  const today = new Date().toISOString().split("T")[0];

  if (expenseType === "salary") {
    return {
      expenseType: "salary",
      documentNumber: generateDocumentNumber("salary"),
      issueDate: today,
      payeeName: "",
      payeeEmail: "",
      payeeRole: "",
      periodLabel: currentPeriodLabel(),
      category: "Salary",
      lineItems: [
        { description: "Basic Salary", amount: 0, kind: "earning" },
        { description: "Tax / Deductions", amount: 0, kind: "deduction" },
      ],
      notes: "",
      paymentMethod: "Bank Transfer",
      status: "draft",
    };
  }

  return {
    expenseType: "expense",
    documentNumber: generateDocumentNumber("expense"),
    issueDate: today,
    payeeName: "",
    payeeEmail: "",
    payeeRole: "",
    periodLabel: "",
    category: "Other",
    lineItems: [{ description: "", amount: 0, kind: "expense" }],
    notes: "",
    paymentMethod: "Bank Transfer",
    status: "draft",
  };
}
