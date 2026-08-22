-- COD payment methods + POS slip fields
ALTER TYPE "OrderPaymentMethod" ADD VALUE IF NOT EXISTS 'KAPIDA_NAKIT';
ALTER TYPE "OrderPaymentMethod" ADD VALUE IF NOT EXISTS 'KAPIDA_POS';

ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "paymentSlipUrl" TEXT;
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "paymentSlipUploadedAt" TIMESTAMP(3);
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "codCollectedAt" TIMESTAMP(3);

-- Dealer coordinates
ALTER TABLE "dealer" ADD COLUMN IF NOT EXISTS "lat" DECIMAL(10,7);
ALTER TABLE "dealer" ADD COLUMN IF NOT EXISTS "lng" DECIMAL(10,7);
ALTER TABLE "dealer" ADD COLUMN IF NOT EXISTS "geocodedAt" TIMESTAMP(3);

-- Depot on payment settings
ALTER TABLE "payment_settings" ADD COLUMN IF NOT EXISTS "depotLabel" TEXT NOT NULL DEFAULT 'Yetiş Grup Depo';
ALTER TABLE "payment_settings" ADD COLUMN IF NOT EXISTS "depotLat" DECIMAL(10,7);
ALTER TABLE "payment_settings" ADD COLUMN IF NOT EXISTS "depotLng" DECIMAL(10,7);

-- Delivery routes
CREATE TYPE "DeliveryRouteStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DONE', 'CANCELLED');
CREATE TYPE "DeliveryStopStatus" AS ENUM ('PENDING', 'EN_ROUTE', 'DONE', 'SKIPPED');

CREATE TABLE "delivery_route" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "DeliveryRouteStatus" NOT NULL DEFAULT 'DRAFT',
    "depotLabel" TEXT NOT NULL DEFAULT '',
    "depotLat" DECIMAL(10,7) NOT NULL,
    "depotLng" DECIMAL(10,7) NOT NULL,
    "assignedUserId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "delivery_route_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "delivery_stop" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "status" "DeliveryStopStatus" NOT NULL DEFAULT 'PENDING',
    "distanceKm" DECIMAL(10,3),
    "note" TEXT,
    "arrivedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_stop_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "delivery_stop_order" (
    "id" TEXT NOT NULL,
    "stopId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "delivery_stop_order_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "shipment" ADD COLUMN IF NOT EXISTS "deliveryStopId" TEXT;

CREATE INDEX "delivery_route_date_status_idx" ON "delivery_route"("date", "status");
CREATE INDEX "delivery_stop_routeId_sequence_idx" ON "delivery_stop"("routeId", "sequence");
CREATE INDEX "shipment_deliveryStopId_idx" ON "shipment"("deliveryStopId");

CREATE UNIQUE INDEX "delivery_stop_routeId_dealerId_key" ON "delivery_stop"("routeId", "dealerId");
CREATE UNIQUE INDEX "delivery_stop_order_stopId_orderId_key" ON "delivery_stop_order"("stopId", "orderId");

ALTER TABLE "delivery_route" ADD CONSTRAINT "delivery_route_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "delivery_stop" ADD CONSTRAINT "delivery_stop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "delivery_route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delivery_stop" ADD CONSTRAINT "delivery_stop_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delivery_stop_order" ADD CONSTRAINT "delivery_stop_order_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "delivery_stop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delivery_stop_order" ADD CONSTRAINT "delivery_stop_order_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_deliveryStopId_fkey" FOREIGN KEY ("deliveryStopId") REFERENCES "delivery_stop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
