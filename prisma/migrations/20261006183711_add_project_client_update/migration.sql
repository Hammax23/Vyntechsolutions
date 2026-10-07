-- CreateTable
CREATE TABLE "ProjectClientUpdate" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sentTo" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "messageNote" TEXT,
    "snapshot" JSONB NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'client',
    "status" TEXT NOT NULL DEFAULT 'sent',
    "errorMessage" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "bccTo" TEXT,
    "sentBy" TEXT NOT NULL DEFAULT 'Admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectClientUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectClientUpdate_idempotencyKey_key" ON "ProjectClientUpdate"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ProjectClientUpdate_projectId_createdAt_idx" ON "ProjectClientUpdate"("projectId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProjectClientUpdate" ADD CONSTRAINT "ProjectClientUpdate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
