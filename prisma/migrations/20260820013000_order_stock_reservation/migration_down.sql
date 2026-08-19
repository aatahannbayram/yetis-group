DROP INDEX IF EXISTS "shipment_orderId_orderLineId_active_key";
ALTER TABLE "shipment" DROP CONSTRAINT IF EXISTS "shipment_orderLineId_fkey";
ALTER TABLE "shipment" DROP COLUMN IF EXISTS "orderLineId";
DROP TABLE IF EXISTS "order_lot_allocation";
