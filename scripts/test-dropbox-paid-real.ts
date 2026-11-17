import { uploadPaidInvoiceToDropbox } from "../src/lib/admin/upload-paid-invoice-dropbox";
import prisma from "../src/lib/prisma";

async function main() {
  const paid = await prisma.billingInvoice.findFirst({
    where: { status: "paid", deletedAt: null },
    orderBy: { paidAt: "desc" },
  });
  if (!paid) {
    console.log("No paid invoice found");
    return;
  }
  console.log("Uploading", paid.invoiceNumber, paid.id);
  const result = await uploadPaidInvoiceToDropbox({
    invoiceId: paid.id,
    force: true,
    timeoutMs: 60_000,
  });
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
