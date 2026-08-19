DROP INDEX IF EXISTS "shipment_orderId_orderLineId_active_key";

CREATE UNIQUE INDEX "shipment_orderId_orderLineId_active_key"
    ON "shipment"("orderId", "orderLineId")
    WHERE "orderLineId" IS NOT NULL;
