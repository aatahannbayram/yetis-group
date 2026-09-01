-- CreateEnum
CREATE TYPE "RequestInitiator" AS ENUM ('BAYI', 'STAFF');

-- CreateEnum
CREATE TYPE "SampleRequestStatus" AS ENUM ('TALEP_EDILDI', 'INCELENIYOR', 'ONAYLANDI', 'REDDEDILDI', 'HAZIRLANIYOR', 'SEVK_EDILDI', 'TESLIM_EDILDI', 'IPTAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'SAMPLE_REQUEST_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'SAMPLE_REQUEST_STATUS_CHANGED';

-- CreateTable
CREATE TABLE "sample_request" (
    "id" TEXT NOT NULL,
    "requestNo" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdByRole" "RequestInitiator" NOT NULL,
    "status" "SampleRequestStatus" NOT NULL DEFAULT 'TALEP_EDILDI',
    "deliveryAddressLine" TEXT NOT NULL,
    "note" TEXT,
    "rejectReason" TEXT,
    "flaggedForReview" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "cargoCompany" TEXT,
    "trackingNo" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sample_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sample_request_item" (
    "id" TEXT NOT NULL,
    "sampleRequestId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCostKurus" INTEGER,
    "totalCostKurus" INTEGER,
    "lotId" TEXT,
    "stockMovementId" TEXT,

    CONSTRAINT "sample_request_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sample_request_event" (
    "id" TEXT NOT NULL,
    "sampleRequestId" TEXT NOT NULL,
    "status" "SampleRequestStatus" NOT NULL,
    "note" TEXT,
    "actorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sample_request_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sample_conversion" (
    "id" TEXT NOT NULL,
    "sampleRequestItemId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "convertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "daysElapsed" INTEGER NOT NULL,

    CONSTRAINT "sample_conversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sample_limit_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "maxRequestsPerDealerPerMonth" INTEGER NOT NULL DEFAULT 3,
    "maxValueKurusPerDealerPerMonth" INTEGER NOT NULL DEFAULT 500000,
    "maxQtyPerProduct" INTEGER NOT NULL DEFAULT 5,
    "repeatBlockDays" INTEGER NOT NULL DEFAULT 90,
    "conversionWindowDays" INTEGER NOT NULL DEFAULT 60,
    "staleFollowupDays" INTEGER NOT NULL DEFAULT 60,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sample_limit_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sample_request_requestNo_key" ON "sample_request"("requestNo");

-- CreateIndex
CREATE INDEX "sample_request_dealerId_createdAt_idx" ON "sample_request"("dealerId", "createdAt");

-- CreateIndex
CREATE INDEX "sample_request_status_idx" ON "sample_request"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sample_request_item_stockMovementId_key" ON "sample_request_item"("stockMovementId");

-- CreateIndex
CREATE INDEX "sample_request_item_sampleRequestId_idx" ON "sample_request_item"("sampleRequestId");

-- CreateIndex
CREATE INDEX "sample_request_item_variantId_idx" ON "sample_request_item"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "sample_conversion_sampleRequestItemId_orderId_key" ON "sample_conversion"("sampleRequestItemId", "orderId");

-- AddForeignKey
ALTER TABLE "sample_request" ADD CONSTRAINT "sample_request_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_request" ADD CONSTRAINT "sample_request_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_request_item" ADD CONSTRAINT "sample_request_item_sampleRequestId_fkey" FOREIGN KEY ("sampleRequestId") REFERENCES "sample_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_request_item" ADD CONSTRAINT "sample_request_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_request_item" ADD CONSTRAINT "sample_request_item_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_request_item" ADD CONSTRAINT "sample_request_item_stockMovementId_fkey" FOREIGN KEY ("stockMovementId") REFERENCES "stock_movement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_request_event" ADD CONSTRAINT "sample_request_event_sampleRequestId_fkey" FOREIGN KEY ("sampleRequestId") REFERENCES "sample_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_conversion" ADD CONSTRAINT "sample_conversion_sampleRequestItemId_fkey" FOREIGN KEY ("sampleRequestItemId") REFERENCES "sample_request_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_conversion" ADD CONSTRAINT "sample_conversion_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

