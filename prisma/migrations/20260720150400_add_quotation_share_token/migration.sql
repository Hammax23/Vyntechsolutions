-- AlterTable
ALTER TABLE "ClientQuotation" ADD COLUMN     "shareToken" TEXT,
ADD COLUMN     "shareExpiresAt" TIMESTAMP(3),
ADD COLUMN     "clientSelections" JSONB NOT NULL DEFAULT '{}';

-- CreateIndex
CREATE UNIQUE INDEX "ClientQuotation_shareToken_key" ON "ClientQuotation"("shareToken");
