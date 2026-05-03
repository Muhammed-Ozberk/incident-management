-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "IncidentAuditLog" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IncidentAuditLog_incidentId_idx" ON "IncidentAuditLog"("incidentId");

-- CreateIndex
CREATE INDEX "Incident_deletedAt_idx" ON "Incident"("deletedAt");

-- AddForeignKey
ALTER TABLE "IncidentAuditLog" ADD CONSTRAINT "IncidentAuditLog_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
