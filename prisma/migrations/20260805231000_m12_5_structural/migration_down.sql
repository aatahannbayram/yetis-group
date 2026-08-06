-- Manual down for M12.5. Not applied by `prisma migrate` automatically.
-- Run only after taking a fresh backup. Restores pre-variant product shape.

-- Drop cart
DROP TABLE IF EXISTS "cart_line";
DROP TABLE IF EXISTS "cart";

-- Drop lead audit + bridge columns
DROP TABLE IF EXISTS "lead_stage_audit";
ALTER TABLE "lead" DROP CONSTRAINT IF EXISTS "lead_convertedDealerId_fkey";
ALTER TABLE "lead" DROP COLUMN IF EXISTS "convertedDealerId";
ALTER TABLE "lead" DROP COLUMN IF EXISTS "lostReason";
ALTER TABLE "lead" DROP COLUMN IF EXISTS "source";

-- Dealer unwind
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "user_dealerId_fkey";
ALTER TABLE "user" DROP COLUMN IF EXISTS "dealerId";
DROP TABLE IF EXISTS "dealer_user_role";
DROP TABLE IF EXISTS "dealer";

-- Restore product columns from default variant (1:1)
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "sku" TEXT;
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "unitLabel" TEXT;
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "kgPerUnit" DECIMAL(10,3);
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "pricePerUnitKurus" INTEGER;
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "vatRateBasisPoints" INTEGER DEFAULT 100;

UPDATE "product" p
SET
  sku = v.sku,
  "unitLabel" = COALESCE(v."packSize", 'birim'),
  "kgPerUnit" = v."unitFactor",
  "pricePerUnitKurus" = v."pricePerUnitKurus",
  "vatRateBasisPoints" = v."vatRateBasisPoints",
  "category" = c.name
FROM "product_variant" v
JOIN "category" c ON c.id = p."primaryCategoryId"
WHERE v."productId" = p.id AND v."sortOrder" = 0;

-- Price list items back to productId
ALTER TABLE "price_list_item" ADD COLUMN IF NOT EXISTS "productId" TEXT;
UPDATE "price_list_item" pli
SET "productId" = v."productId"
FROM "product_variant" v
WHERE pli."variantId" = v.id;
ALTER TABLE "price_list_item" DROP CONSTRAINT IF EXISTS "price_list_item_variantId_fkey";
DROP INDEX IF EXISTS "price_list_item_priceListId_variantId_key";
ALTER TABLE "price_list_item" DROP COLUMN IF EXISTS "variantId";
CREATE UNIQUE INDEX IF NOT EXISTS "price_list_item_priceListId_productId_key"
  ON "price_list_item"("priceListId", "productId");
ALTER TABLE "price_list_item" ADD CONSTRAINT "price_list_item_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Lots back to productId
ALTER TABLE "lot" ADD COLUMN IF NOT EXISTS "productId" TEXT;
UPDATE "lot" l
SET "productId" = v."productId"
FROM "product_variant" v
WHERE l."variantId" = v.id;
ALTER TABLE "lot" DROP CONSTRAINT IF EXISTS "lot_variantId_fkey";
DROP INDEX IF EXISTS "lot_variantId_lotNumber_key";
ALTER TABLE "lot" DROP COLUMN IF EXISTS "variantId";
CREATE UNIQUE INDEX IF NOT EXISTS "lot_productId_lotNumber_key" ON "lot"("productId", "lotNumber");
ALTER TABLE "lot" ADD CONSTRAINT "lot_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE IF EXISTS "product_variant";
DROP TABLE IF EXISTS "product_category";

ALTER TABLE "product" DROP CONSTRAINT IF EXISTS "product_producerId_fkey";
ALTER TABLE "product" DROP CONSTRAINT IF EXISTS "product_primaryCategoryId_fkey";
ALTER TABLE "product" DROP COLUMN IF EXISTS "producerId";
ALTER TABLE "product" DROP COLUMN IF EXISTS "primaryCategoryId";

ALTER TABLE "product" ALTER COLUMN "sku" SET NOT NULL;
ALTER TABLE "product" ALTER COLUMN "category" SET NOT NULL;
ALTER TABLE "product" ALTER COLUMN "unitLabel" SET NOT NULL;
ALTER TABLE "product" ALTER COLUMN "kgPerUnit" SET NOT NULL;
ALTER TABLE "product" ALTER COLUMN "pricePerUnitKurus" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "product_sku_key" ON "product"("sku");

DROP TABLE IF EXISTS "category";
DROP TABLE IF EXISTS "producer";

DROP TYPE IF EXISTS "PackagingType";
DROP TYPE IF EXISTS "BaseUnit";
DROP TYPE IF EXISTS "DealerType";
DROP TYPE IF EXISTS "DealerStatus";
DROP TYPE IF EXISTS "DealerRole";
DROP TYPE IF EXISTS "LeadSource";
-- Note: additive LeadStage / StockMovementType enum values cannot be removed safely in PG.
