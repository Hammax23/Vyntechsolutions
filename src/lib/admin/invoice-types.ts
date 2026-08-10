export type ExpenseType = "salary" | "expense";

export type ExpenseLineKind = "earning" | "deduction" | "expense";

export type InvoiceLineItem = {
  description: string;
  amount: number;
  kind: ExpenseLineKind;
};

export type InvoiceData = {
  id?: string;
  expenseType: ExpenseType;
  documentNumber: string;
  issueDate: string;
  payeeName: string;
  payeeEmail: string;
  payeeRole: string;
  periodLabel: string;
  category: string;
  lineItems: InvoiceLineItem[];
  notes: string;
  paymentMethod: string;
  status?: string;
};

export type InvoiceTotals = {
  earnings: number;
  deductions: number;
  expenses: number;
  netPay: number;
  total: number;
};

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Tools",
  "Software",
  "Travel",
  "Marketing",
  "Office",
  "Other",
] as const;

export const PAYMENT_METHODS = ["Bank Transfer", "E-Transfer", "Cash", "Cheque"] as const;

export function calculateInvoiceTotals(data: Pick<InvoiceData, "expenseType" | "lineItems">): InvoiceTotals {
  const items = data.lineItems || [];
  const earnings = round2(
    items.filter((i) => i.kind === "earning").reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  );
  const deductions = round2(
    items.filter((i) => i.kind === "deduction").reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  );
  const expenses = round2(
    items.filter((i) => i.kind === "expense").reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  );
  const netPay = round2(earnings - deductions);
  const total = data.expenseType === "salary" ? netPay : expenses;
  return { earnings, deductions, expenses, netPay, total };
}

export function formatCad(amount: number): string {
  return `$${amount.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateDocumentNumber(type: ExpenseType): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return type === "salary" ? `SAL-${year}-${suffix}` : `EXP-${year}-${suffix}`;
}

/** @deprecated use generateDocumentNumber */
export function generateInvoiceNumber(type: ExpenseType = "expense"): string {
  return generateDocumentNumber(type);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
