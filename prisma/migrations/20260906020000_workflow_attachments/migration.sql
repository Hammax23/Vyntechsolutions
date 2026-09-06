-- CreateTable
CREATE TABLE "WorkflowAttachment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkflowAttachment_taskId_idx" ON "WorkflowAttachment"("taskId");

-- CreateIndex
CREATE INDEX "WorkflowAttachment_uploadedById_idx" ON "WorkflowAttachment"("uploadedById");

-- AddForeignKey
ALTER TABLE "WorkflowAttachment" ADD CONSTRAINT "WorkflowAttachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "WorkflowTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowAttachment" ADD CONSTRAINT "WorkflowAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "StaffUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
