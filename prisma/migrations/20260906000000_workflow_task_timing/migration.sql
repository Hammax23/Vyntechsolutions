-- AlterTable
ALTER TABLE "WorkflowTask" ADD COLUMN "statusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "WorkflowTask" ADD COLUMN "startedAt" TIMESTAMP(3);
ALTER TABLE "WorkflowTask" ADD COLUMN "completedAt" TIMESTAMP(3);
ALTER TABLE "WorkflowTask" ADD COLUMN "firstBlockedAt" TIMESTAMP(3);
ALTER TABLE "WorkflowTask" ADD COLUMN "todoMs" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "WorkflowTask" ADD COLUMN "inProgressMs" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "WorkflowTask" ADD COLUMN "blockedMs" INTEGER NOT NULL DEFAULT 0;

-- Backfill: treat existing tasks as if current status began at creation
UPDATE "WorkflowTask" SET "statusChangedAt" = "createdAt";
UPDATE "WorkflowTask" SET "startedAt" = "createdAt" WHERE "status" IN ('in_progress', 'done', 'blocked');
UPDATE "WorkflowTask" SET "completedAt" = "updatedAt" WHERE "status" = 'done';
UPDATE "WorkflowTask" SET "firstBlockedAt" = "updatedAt" WHERE "status" = 'blocked';
