-- CreateTable
CREATE TABLE "ClientInvoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "customerName" TEXT NOT NULL,
    "companyName" TEXT,
    "customerEmail" TEXT,
    "customerAddress" TEXT,
    "projectName" TEXT,
    "lineItems" JSONB NOT NULL DEFAULT '[]',
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hstPercent" DOUBLE PRECISION NOT NULL DEFAULT 13,
    "notes" TEXT,
    "paymentTerms" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientInvoice_invoiceNumber_key" ON "ClientInvoice"("invoiceNumber");
