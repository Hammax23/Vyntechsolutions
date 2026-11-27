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
  /** stripe | offline — set when paid */
  paymentSource?: string;
  paymentReference?: string;
  paymentNote?: string;
  paymentRecordedBy?: string;
  paymentTerms: string;
  notes: string;
  status: BillingInvoiceStatus;
  projectId?: string | null;
  projectPaymentId?: string | null;
  checkoutUrl?: string;
  paidAt?: string;
  sentAt?: string;
  sentTo?: string;
  lastSendError?: string;
  dropboxPath?: string;
  dropboxUploadedAt?: string;
  dropboxError?: string;
};

export type BillingInvoiceEventData = {
  id: string;
  type: string;
  meta?: Record<string, unknown> | null;
  createdAt: string;
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
  "Credit Card",
  "E-Transfer",
  "Wire Transfer",
  "Bank Transfer",
  "Cheque",
  "Cash",
] as const;

/** Offline methods shown in the Record offline payment UI. */
export const BILLING_OFFLINE_PAYMENT_METHODS = [
  "E-Transfer",
  "Wire Transfer",
  "Cheque",
  "Cash",
] as const;

/** Accepted by API — includes legacy "Bank Transfer" on older paid rows. */
export const BILLING_OFFLINE_PAYMENT_METHODS_ACCEPTED = [
  ...BILLING_OFFLINE_PAYMENT_METHODS,
  "Bank Transfer",
] as const;

export type BillingOfflinePaymentMethod =
  (typeof BILLING_OFFLINE_PAYMENT_METHODS)[number];

export type BillingOfflinePaymentMethodAccepted =
  (typeof BILLING_OFFLINE_PAYMENT_METHODS_ACCEPTED)[number];

export function isAcceptedOfflinePaymentMethod(
  method: string
): method is BillingOfflinePaymentMethodAccepted {
  return (BILLING_OFFLINE_PAYMENT_METHODS_ACCEPTED as readonly string[]).includes(
    method
  );
}

export function offlineReferencePlaceholder(method: string): string {
  switch (method) {
    case "E-Transfer":
      return "e.g. Interac confirmation / reference ID";
    case "Wire Transfer":
    case "Bank Transfer":
      return "e.g. wire / bank confirmation number";
    case "Cheque":
      return "e.g. cheque number";
    case "Cash":
      return 'e.g. cash receipt # or "Cash received"';
    default:
      return "Payment reference (min 3 characters)";
  }
}

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
  const discountPct = Math.min(100, Math.max(0, Number(data.discountPercent) || 0));
  const hstPct = Math.min(100, Math.max(0, Number(data.hstPercent) || 0));
  const discount = round2(subtotal * (discountPct / 100));
  const taxable = round2(subtotal - discount);
  const hst = round2(taxable * (hstPct / 100));
  const total = round2(taxable + hst);
  const balance = round2(Math.max(0, total - (Number(data.amountPaid) || 0)));
  return { subtotal, discount, taxable, hst, total, balance };
}

export function formatCad(amount: number): string {
  return `$${amount.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Next INV-{year}-{n} from existing numbers (same calendar year, sequential). */
export function nextInvoiceNumberFromExisting(existing: string[]): string {
  const year = new Date().getFullYear();
  let max = 0;
  for (const raw of existing) {
    const m = String(raw || "")
      .trim()
      .match(/^INV-(\d{4})-(\d+)$/i);
    if (!m) continue;
    if (Number(m[1]) !== year) continue;
    max = Math.max(max, Number(m[2]));
  }
  return `INV-${year}-${max + 1}`;
}

/** @deprecated prefer nextInvoiceNumberFromExisting with DB/list numbers */
export function generateInvoiceNumber(): string {
  return nextInvoiceNumberFromExisting([]);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
