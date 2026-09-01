-- CreateEnum
CREATE TYPE "ReturnRequestStatus" AS ENUM ('OLUSTURULDU', 'INCELENIYOR', 'ONAYLANDI', 'REDDEDILDI', 'URUN_TESLIM_ALINDI', 'KONTROL_EDILDI', 'FATURALANDI', 'KAPANDI', 'IPTAL');

-- CreateEnum
CREATE TYPE "ReturnReason" AS ENUM ('HATALI_URUN', 'HASARLI_GELDI', 'YANLIS_URUN', 'SKT_YAKIN_GECMIS', 'BAYI_FAZLA_SIPARIS', 'MUSTERI_IADESI', 'DIGER');

-- CreateEnum
CREATE TYPE "ShippingCostResponsibility" AS ENUM ('YETIS', 'BAYI');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'RETURN_REQUEST_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'RETURN_REQUEST_STATUS_CHANGED';

-- AlterTable
ALTER TABLE "dealer" ADD COLUMN     "eFaturaMukellefi" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ledger_entry" ADD COLUMN     "returnRequestId" TEXT;

-- CreateTable
CREATE TABLE "return_request" (
    "id" TEXT NOT NULL,
    "returnNo" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdByRole" "RequestInitiator" NOT NULL,
    "status" "ReturnRequestStatus" NOT NULL DEFAULT 'OLUSTURULDU',
    "rejectReason" TEXT,
    "shippingCostResponsibility" "ShippingCostResponsibility",
    "shippingCostKurus" INTEGER,
    "cashRefundNeeded" BOOLEAN NOT NULL DEFAULT false,
    "cashRefundNote" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "invoicedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "return_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_request_item" (
    "id" TEXT NOT NULL,
    "returnRequestId" TEXT NOT NULL,
    "orderLineId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "lotNumber" TEXT,
    "expirationDate" TIMESTAMP(3),
    "requestedQty" INTEGER NOT NULL,
    "approvedQty" INTEGER,
    "acceptedGoodQty" INTEGER,
    "acceptedDamagedQty" INTEGER,
    "reason" "ReturnReason" NOT NULL,
    "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "unitPriceKurus" INTEGER NOT NULL,
    "vatRateBasisPoints" INTEGER NOT NULL,
    "note" TEXT,
    "goodStockMovementId" TEXT,
    "damagedStockMovementId" TEXT,

    CONSTRAINT "return_request_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_request_event" (
    "id" TEXT NOT NULL,
    "returnRequestId" TEXT NOT NULL,
    "status" "ReturnRequestStatus" NOT NULL,
    "note" TEXT,
    "actorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_request_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_invoice" (
    "id" TEXT NOT NULL,
    "returnRequestId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "buyerUnvan" TEXT NOT NULL,
    "buyerVergiNo" TEXT,
    "buyerVergiDairesi" TEXT,
    "buyerEFaturaMukellefi" BOOLEAN NOT NULL,
    "sellerName" TEXT NOT NULL,
    "subtotalKurus" INTEGER NOT NULL,
    "vatKurus" INTEGER NOT NULL,
    "totalKurus" INTEGER NOT NULL,
    "note" TEXT,
    "pdfPath" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "return_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_invoice_line" (
    "id" TEXT NOT NULL,
    "returnInvoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceKurus" INTEGER NOT NULL,
    "vatRateBasisPoints" INTEGER NOT NULL,
    "lineTotalKurus" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "return_invoice_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "returnWindowDays" INTEGER NOT NULL DEFAULT 14,
    "returnRatioAlertBps" INTEGER NOT NULL DEFAULT 1000,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "return_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "return_request_returnNo_key" ON "return_request"("returnNo");

-- CreateIndex
CREATE INDEX "return_request_dealerId_createdAt_idx" ON "return_request"("dealerId", "createdAt");

-- CreateIndex
CREATE INDEX "return_request_orderId_idx" ON "return_request"("orderId");

-- CreateIndex
CREATE INDEX "return_request_status_idx" ON "return_request"("status");

-- CreateIndex
CREATE UNIQUE INDEX "return_request_item_goodStockMovementId_key" ON "return_request_item"("goodStockMovementId");

-- CreateIndex
CREATE UNIQUE INDEX "return_request_item_damagedStockMovementId_key" ON "return_request_item"("damagedStockMovementId");

-- CreateIndex
CREATE INDEX "return_request_item_returnRequestId_idx" ON "return_request_item"("returnRequestId");

-- CreateIndex
CREATE INDEX "return_request_item_orderLineId_idx" ON "return_request_item"("orderLineId");

-- CreateIndex
CREATE UNIQUE INDEX "return_invoice_returnRequestId_key" ON "return_invoice"("returnRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "return_invoice_number_key" ON "return_invoice"("number");

-- AddForeignKey
ALTER TABLE "ledger_entry" ADD CONSTRAINT "ledger_entry_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "return_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_request" ADD CONSTRAINT "return_request_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_request" ADD CONSTRAINT "return_request_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_request" ADD CONSTRAINT "return_request_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_request_item" ADD CONSTRAINT "return_request_item_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "return_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_request_item" ADD CONSTRAINT "return_request_item_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "order_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_request_item" ADD CONSTRAINT "return_request_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_request_item" ADD CONSTRAINT "return_request_item_goodStockMovementId_fkey" FOREIGN KEY ("goodStockMovementId") REFERENCES "stock_movement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_request_item" ADD CONSTRAINT "return_request_item_damagedStockMovementId_fkey" FOREIGN KEY ("damagedStockMovementId") REFERENCES "stock_movement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_request_event" ADD CONSTRAINT "return_request_event_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "return_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_invoice" ADD CONSTRAINT "return_invoice_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "return_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_invoice_line" ADD CONSTRAINT "return_invoice_line_returnInvoiceId_fkey" FOREIGN KEY ("returnInvoiceId") REFERENCES "return_invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

