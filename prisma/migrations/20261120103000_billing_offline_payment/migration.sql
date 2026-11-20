-- AlterTable
ALTER TABLE "BillingInvoice" ADD COLUMN IF NOT EXISTS "paymentSource" TEXT;
ALTER TABLE "BillingInvoice" ADD COLUMN IF NOT EXISTS "paymentReference" TEXT;
ALTER TABLE "BillingInvoice" ADD COLUMN IF NOT EXISTS "paymentNote" TEXT;
ALTER TABLE "BillingInvoice" ADD COLUMN IF NOT EXISTS "paymentRecordedBy" TEXT;
