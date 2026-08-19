-- AlterTable
ALTER TABLE "shipment" ADD COLUMN "orderLineId" TEXT;

-- CreateTable
CREATE TABLE "order_lot_allocation" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderLineId" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "quantityKg" DECIMAL(10,3) NOT NULL,
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_lot_allocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_lot_allocation_orderLineId_lotId_key" ON "order_lot_allocation"("orderLineId", "lotId");

-- CreateIndex
CREATE INDEX "order_lot_allocation_orderId_idx" ON "order_lot_allocation"("orderId");

-- CreateIndex
CREATE INDEX "order_lot_allocation_lotId_idx" ON "order_lot_allocation"("lotId");

-- One active shipment per order line (NULL orderLineId stays unrestricted for ad-hoc dispatch)
CREATE UNIQUE INDEX "shipment_orderId_orderLineId_active_key"
    ON "shipment"("orderId", "orderLineId")
    WHERE "orderLineId" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "order_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "order_lot_allocation" ADD CONSTRAINT "order_lot_allocation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_lot_allocation" ADD CONSTRAINT "order_lot_allocation_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "order_line"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_lot_allocation" ADD CONSTRAINT "order_lot_allocation_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
