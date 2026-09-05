-- AlterTable
ALTER TABLE "WorkflowTask" ADD COLUMN "cycleStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill: existing tasks keep their original create time as the cycle start
UPDATE "WorkflowTask" SET "cycleStartedAt" = "createdAt";
