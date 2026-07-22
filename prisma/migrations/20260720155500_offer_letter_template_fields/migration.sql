-- AlterTable
ALTER TABLE "ClientQuotation" ADD COLUMN "introText" TEXT;
ALTER TABLE "ClientQuotation" ADD COLUMN "projectType" TEXT;
ALTER TABLE "ClientQuotation" ADD COLUMN "technology" TEXT;
ALTER TABLE "ClientQuotation" ADD COLUMN "totalPages" TEXT;
ALTER TABLE "ClientQuotation" ADD COLUMN "timeline" TEXT;
ALTER TABLE "ClientQuotation" ADD COLUMN "scopeSections" JSONB NOT NULL DEFAULT '[]';
