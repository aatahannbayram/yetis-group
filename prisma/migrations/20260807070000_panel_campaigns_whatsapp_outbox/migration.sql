-- CreateEnum
CREATE TYPE "WhatsAppMessageStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_outbox_message" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT,
    "toPhone" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "status" "WhatsAppMessageStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "providerResponse" TEXT,
    "costKurus" INTEGER,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_outbox_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_outbox_message_idempotencyKey_key" ON "whatsapp_outbox_message"("idempotencyKey");

-- CreateIndex
CREATE INDEX "whatsapp_outbox_message_status_createdAt_idx" ON "whatsapp_outbox_message"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "whatsapp_outbox_message" ADD CONSTRAINT "whatsapp_outbox_message_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
