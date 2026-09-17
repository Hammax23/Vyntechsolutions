import prisma from "@/lib/prisma";
import { nextInvoiceNumberFromExisting } from "@/lib/admin/billing-invoice-types";

/** Allocate next INV-{year}-{n} from BillingInvoice rows (server-side). */
export async function allocateNextBillingInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const rows = await prisma.billingInvoice.findMany({
    where: { invoiceNumber: { startsWith: prefix } },
    select: { invoiceNumber: true },
  });
  return nextInvoiceNumberFromExisting(rows.map((r) => r.invoiceNumber));
}
