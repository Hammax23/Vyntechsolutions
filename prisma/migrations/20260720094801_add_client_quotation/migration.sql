-- CreateTable
CREATE TABLE "ClientQuotation" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "companyName" TEXT,
    "quoteDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectTitle" TEXT NOT NULL,
    "projectSubtitle" TEXT,
    "includes" TEXT[],
    "optionalServices" JSONB NOT NULL DEFAULT '[]',
    "showSocialMedia" BOOLEAN NOT NULL DEFAULT true,
    "socialMediaFee" DOUBLE PRECISION NOT NULL DEFAULT 600,
    "socialIncludes" TEXT[],
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "hstPercent" DOUBLE PRECISION NOT NULL DEFAULT 13,
    "depositPercent" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "terms" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientQuotation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientQuotation_quoteNumber_key" ON "ClientQuotation"("quoteNumber");
