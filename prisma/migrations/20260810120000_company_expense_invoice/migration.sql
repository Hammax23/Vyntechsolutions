-- Reshape ClientInvoice for internal company expenses (salary / expense vouchers)
DROP TABLE IF EXISTS "ClientInvoice";

CREATE TABLE "ClientInvoice" (
    "id" TEXT NOT NULL,
    "expenseType" TEXT NOT NULL DEFAULT 'salary',
    "documentNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payeeName" TEXT NOT NULL,
    "payeeEmail" TEXT,
    "payeeRole" TEXT,
    "periodLabel" TEXT,
    "category" TEXT,
    "lineItems" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "paymentMethod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientInvoice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClientInvoice_documentNumber_key" ON "ClientInvoice"("documentNumber");
