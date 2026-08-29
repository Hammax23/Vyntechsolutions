export type BillingInvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type BillingLineItem = {
  description: string;
  quantity: number;
  rate: number;
};

export type BillingInvoiceData = {
  id?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  companyName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  projectTitle: string;
  lineItems: BillingLineItem[];
  discountPercent: number;
  hstPercent: number;
  amountPaid: number;
  paymentMethod: string;
  paymentTerms: string;
  notes: string;
  status: BillingInvoiceStatus;
  projectId?: string | null;
};

export type BillingInvoiceTotals = {
  subtotal: number;
  discount: number;
  taxable: number;
  hst: number;
  total: number;
  balance: number;
};

export const BILLING_STATUSES: { value: BillingInvoiceStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

export const BILLING_PAYMENT_METHODS = [
  "Bank Transfer",
  "E-Transfer",
  "Credit Card",
  "Cheque",
  "Cash",
] as const;

export const DEFAULT_PAYMENT_TERMS =
  "Payment is due within 15 days of the invoice date. Late payments may incur a 1.5% monthly service charge.";

export function lineAmount(item: BillingLineItem): number {
  return round2((Number(item.quantity) || 0) * (Number(item.rate) || 0));
}

export function calculateBillingTotals(
  data: Pick<BillingInvoiceData, "lineItems" | "discountPercent" | "hstPercent" | "amountPaid">
): BillingInvoiceTotals {
  const subtotal = round2(
    (data.lineItems || []).reduce((sum, item) => sum + lineAmount(item), 0)
  );
  const discount = round2(subtotal * ((Number(data.discountPercent) || 0) / 100));
  const taxable = round2(subtotal - discount);
  const hst = round2(taxable * ((Number(data.hstPercent) || 0) / 100));
  const total = round2(taxable + hst);
  const balance = round2(Math.max(0, total - (Number(data.amountPaid) || 0)));
  return { subtotal, discount, taxable, hst, total, balance };
}

export function formatCad(amount: number): string {
  return `$${amount.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${suffix}`;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
