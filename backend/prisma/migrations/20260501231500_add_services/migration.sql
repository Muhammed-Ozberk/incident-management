-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");

-- CreateIndex
CREATE INDEX "Service_isActive_idx" ON "Service"("isActive");

-- Seed services from defaults and existing incident values before converting the relation.
INSERT INTO "Service" ("id", "name", "description", "isActive", "createdAt", "updatedAt")
SELECT
    md5("name"),
    "name",
    'Seeded service for incident classification',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT "name"
    FROM (
        VALUES
            ('Payment API'),
            ('Auth Service'),
            ('Notification Worker'),
            ('Search Service'),
            ('Database'),
            ('Event Pipeline'),
            ('Cache Service'),
            ('API Gateway'),
            ('General')
    ) AS defaults("name")
    UNION
    SELECT DISTINCT "service" AS "name"
    FROM "Incident"
    WHERE "service" IS NOT NULL AND trim("service") <> ''
) AS services
ON CONFLICT ("name") DO NOTHING;

-- AlterTable
ALTER TABLE "Incident" ADD COLUMN "serviceId" TEXT;

UPDATE "Incident" AS incident
SET "serviceId" = service."id"
FROM "Service" AS service
WHERE service."name" = incident."service";

ALTER TABLE "Incident" ALTER COLUMN "serviceId" SET NOT NULL;

-- DropIndex
DROP INDEX IF EXISTS "Incident_service_idx";

-- AlterTable
ALTER TABLE "Incident" DROP COLUMN "service";

-- CreateIndex
CREATE INDEX "Incident_serviceId_idx" ON "Incident"("serviceId");

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
