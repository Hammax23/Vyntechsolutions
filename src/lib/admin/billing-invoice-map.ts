import type {
  BillingInvoiceData,
  BillingInvoiceStatus,
  BillingLineItem,
} from "@/lib/admin/billing-invoice-types";

export type BillingInvoiceRecord = {
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
  projectPaymentId?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  checkoutUrl?: string | null;
  paidAt?: Date | null;
  sentAt?: Date | null;
  sentTo?: string | null;
  lastSendError?: string | null;
};

export function mapBillingInvoice(record: BillingInvoiceRecord): BillingInvoiceData {
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
    projectPaymentId: record.projectPaymentId ?? null,
    checkoutUrl: record.checkoutUrl || "",
    paidAt: record.paidAt ? record.paidAt.toISOString() : "",
    sentAt: record.sentAt ? record.sentAt.toISOString() : "",
    sentTo: record.sentTo || "",
    lastSendError: record.lastSendError || "",
  };
}

export async function logBillingEvent(
  prisma: {
    billingInvoiceEvent: {
      create: (args: {
        data: { invoiceId: string; type: string; meta?: object | undefined };
      }) => Promise<unknown>;
    };
  },
  invoiceId: string,
  type: string,
  meta?: Record<string, unknown>
) {
  await prisma.billingInvoiceEvent.create({
    data: {
      invoiceId,
      type,
      ...(meta ? { meta } : {}),
    },
  });
}
