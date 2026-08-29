import type { BillingInvoiceData } from "./billing-invoice-types";
import { DEFAULT_PAYMENT_TERMS, generateInvoiceNumber } from "./billing-invoice-types";

export function createDefaultBillingInvoice(): BillingInvoiceData {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 15);

  return {
    invoiceNumber: generateInvoiceNumber(),
    issueDate: today.toISOString().split("T")[0],
    dueDate: due.toISOString().split("T")[0],
    clientName: "",
    companyName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    projectTitle: "",
    lineItems: [{ description: "", quantity: 1, rate: 0 }],
    discountPercent: 0,
    hstPercent: 13,
    amountPaid: 0,
    paymentMethod: "E-Transfer",
    paymentTerms: DEFAULT_PAYMENT_TERMS,
    notes: "",
    status: "draft",
    projectId: null,
  };
}
