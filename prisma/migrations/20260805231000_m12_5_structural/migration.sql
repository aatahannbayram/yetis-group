-- M12.5 structural migration (atomic).
-- Order: Category → Variant → Lot/PriceList FKs → Dealer → Lead → Cart.
-- Companion down script: migration_down.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helpers: cuid-like ids
CREATE OR REPLACE FUNCTION m125_id() RETURNS TEXT AS $$
  SELECT 'c' || substr(encode(gen_random_bytes(12), 'hex'), 1, 24);
$$ LANGUAGE sql VOLATILE;

-- ========== ENUMS ==========
CREATE TYPE "PackagingType" AS ENUM ('TENEKE', 'VAKUM', 'KOLI', 'KUTU', 'DOKME');
CREATE TYPE "BaseUnit" AS ENUM ('KG');
CREATE TYPE "DealerType" AS ENUM ('BAYI', 'HORECA', 'ZINCIR', 'ARA_TOPTANCI');
CREATE TYPE "DealerStatus" AS ENUM ('BASVURU', 'INCELEME', 'ONAYLI', 'AKTIF', 'RISKLI', 'BLOKE', 'PASIF');
CREATE TYPE "DealerRole" AS ENUM ('YETKILI', 'SATIN_ALMA', 'MUHASEBE', 'DEPO');
CREATE TYPE "LeadSource" AS ENUM ('ILETISIM_FORMU', 'BAYILIK_BASVURUSU', 'MALIYET_HESAPLAYICI', 'BULTEN', 'WHATSAPP', 'NUMUNE_TALEBI', 'MANUEL');

-- Additive LeadStage values (keep existing)
ALTER TYPE "LeadStage" ADD VALUE IF NOT EXISTS 'NITELIKLI';
ALTER TYPE "LeadStage" ADD VALUE IF NOT EXISTS 'NUMUNE';
ALTER TYPE "LeadStage" ADD VALUE IF NOT EXISTS 'TEKLIF';

-- Additive stock movement
ALTER TYPE "StockMovementType" ADD VALUE IF NOT EXISTS 'REPACK';

-- ========== 1. PRODUCER + CATEGORY ==========
CREATE TABLE "producer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "region" TEXT,
    "productionMethod" TEXT,
    "geoIndication" TEXT,
    "imageUrl" TEXT,
    "story" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "producer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "producer_slug_key" ON "producer"("slug");

INSERT INTO "producer" ("id", "name", "slug", "region", "story", "createdAt", "updatedAt")
VALUES (m125_id(), 'Yetiş Üretim', 'yetis-uretim', 'Türkiye', 'Yetiş Grup kendi üretim ve seçilmiş yöresel ürün portföyü.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "canonicalPath" TEXT,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "category_slug_key" ON "category"("slug");
ALTER TABLE "category" ADD CONSTRAINT "category_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Distinct product.category → Category rows
INSERT INTO "category" ("id", "name", "slug", "sortOrder", "createdAt", "updatedAt")
SELECT m125_id(), d.category,
  lower(regexp_replace(translate(d.category, 'çğıöşüÇĞİÖŞÜ ', 'cgiosuCGIOSU-'), '[^a-zA-Z0-9-]+', '-', 'g')),
  0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "category" FROM "product") d;

CREATE TABLE "product_category" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "product_category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "product_category_productId_categoryId_key" ON "product_category"("productId", "categoryId");

-- ========== 2. PRODUCTVARIANT + reshape Product ==========
CREATE TABLE "product_variant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "packagingType" "PackagingType" NOT NULL DEFAULT 'KOLI',
    "packSize" TEXT,
    "baseUnit" "BaseUnit" NOT NULL DEFAULT 'KG',
    "unitFactor" DECIMAL(10,3) NOT NULL,
    "pricePerUnitKurus" INTEGER NOT NULL,
    "vatRateBasisPoints" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_variant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "product_variant_sku_key" ON "product_variant"("sku");

-- Map: old product id → new category id / variant id
CREATE TEMP TABLE _m125_prod_cat AS
SELECT p.id AS product_id, c.id AS category_id, p."category" AS cat_name
FROM "product" p
JOIN "category" c ON c."name" = p."category";

ALTER TABLE "product" ADD COLUMN "producerId" TEXT;
ALTER TABLE "product" ADD COLUMN "primaryCategoryId" TEXT;

UPDATE "product" p
SET "producerId" = (SELECT id FROM "producer" WHERE slug = 'yetis-uretim' LIMIT 1),
    "primaryCategoryId" = m.category_id
FROM _m125_prod_cat m
WHERE p.id = m.product_id;

INSERT INTO "product_category" ("id", "productId", "categoryId")
SELECT m125_id(), product_id, category_id FROM _m125_prod_cat;

-- Default variant per product
CREATE TEMP TABLE _m125_variants AS
SELECT
  p.id AS product_id,
  m125_id() AS variant_id,
  p.sku,
  p."kgPerUnit",
  p."pricePerUnitKurus",
  p."vatRateBasisPoints",
  p."unitLabel",
  CASE
    WHEN lower(p."unitLabel") LIKE '%teneke%' THEN 'TENEKE'::"PackagingType"
    WHEN lower(p."unitLabel") LIKE '%vakum%' THEN 'VAKUM'::"PackagingType"
    WHEN lower(p."unitLabel") LIKE '%kutu%' THEN 'KUTU'::"PackagingType"
    WHEN lower(p."unitLabel") LIKE '%dökme%' OR lower(p."unitLabel") LIKE '%dokme%' THEN 'DOKME'::"PackagingType"
    ELSE 'KOLI'::"PackagingType"
  END AS packaging
FROM "product" p;

INSERT INTO "product_variant" (
  "id", "productId", "sku", "packagingType", "packSize", "baseUnit", "unitFactor",
  "pricePerUnitKurus", "vatRateBasisPoints", "isActive", "sortOrder", "createdAt", "updatedAt"
)
SELECT
  variant_id, product_id, sku, packaging, "unitLabel", 'KG'::"BaseUnit", "kgPerUnit",
  "pricePerUnitKurus", "vatRateBasisPoints", true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM _m125_variants;

ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product" ALTER COLUMN "producerId" SET NOT NULL;
ALTER TABLE "product" ALTER COLUMN "primaryCategoryId" SET NOT NULL;
ALTER TABLE "product" ADD CONSTRAINT "product_producerId_fkey"
  FOREIGN KEY ("producerId") REFERENCES "producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product" ADD CONSTRAINT "product_primaryCategoryId_fkey"
  FOREIGN KEY ("primaryCategoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========== 3. Lot + PriceListItem → variantId ==========
ALTER TABLE "lot" ADD COLUMN "variantId" TEXT;

UPDATE "lot" l
SET "variantId" = v.variant_id
FROM _m125_variants v
WHERE l."productId" = v.product_id;

ALTER TABLE "lot" ALTER COLUMN "variantId" SET NOT NULL;
ALTER TABLE "lot" DROP CONSTRAINT IF EXISTS "lot_productId_lotNumber_key";
ALTER TABLE "lot" DROP CONSTRAINT IF EXISTS "lot_productId_fkey";
DROP INDEX IF EXISTS "lot_productId_lotNumber_key";
ALTER TABLE "lot" DROP COLUMN "productId";
CREATE UNIQUE INDEX "lot_variantId_lotNumber_key" ON "lot"("variantId", "lotNumber");
ALTER TABLE "lot" ADD CONSTRAINT "lot_variantId_fkey"
  FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "price_list_item" ADD COLUMN "variantId" TEXT;

UPDATE "price_list_item" pli
SET "variantId" = v.variant_id
FROM _m125_variants v
WHERE pli."productId" = v.product_id;

ALTER TABLE "price_list_item" ALTER COLUMN "variantId" SET NOT NULL;
ALTER TABLE "price_list_item" DROP CONSTRAINT IF EXISTS "price_list_item_priceListId_productId_key";
DROP INDEX IF EXISTS "price_list_item_priceListId_productId_key";
ALTER TABLE "price_list_item" DROP CONSTRAINT IF EXISTS "price_list_item_productId_fkey";
ALTER TABLE "price_list_item" DROP COLUMN "productId";
CREATE UNIQUE INDEX "price_list_item_priceListId_variantId_key" ON "price_list_item"("priceListId", "variantId");
ALTER TABLE "price_list_item" ADD CONSTRAINT "price_list_item_variantId_fkey"
  FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop legacy product columns
ALTER TABLE "product" DROP COLUMN "sku";
ALTER TABLE "product" DROP COLUMN "category";
ALTER TABLE "product" DROP COLUMN "unitLabel";
ALTER TABLE "product" DROP COLUMN "kgPerUnit";
ALTER TABLE "product" DROP COLUMN "pricePerUnitKurus";
ALTER TABLE "product" DROP COLUMN "vatRateBasisPoints";

-- ========== 4. DEALER ==========
CREATE TABLE "dealer" (
    "id" TEXT NOT NULL,
    "unvan" TEXT NOT NULL,
    "vergiNo" TEXT,
    "vergiDairesi" TEXT,
    "dealerType" "DealerType" NOT NULL,
    "status" "DealerStatus" NOT NULL DEFAULT 'BASVURU',
    "membershipTier" TEXT,
    "creditLimitKurus" INTEGER,
    "paymentTermDays" INTEGER,
    "deliveryZoneCode" TEXT,
    "priceListId" TEXT,
    "salesRepId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dealer_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "dealer" ADD CONSTRAINT "dealer_priceListId_fkey"
  FOREIGN KEY ("priceListId") REFERENCES "price_list"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "dealer" ADD CONSTRAINT "dealer_salesRepId_fkey"
  FOREIGN KEY ("salesRepId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "dealer_user_role" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "DealerRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dealer_user_role_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "dealer_user_role_dealerId_userId_key" ON "dealer_user_role"("dealerId", "userId");
ALTER TABLE "dealer_user_role" ADD CONSTRAINT "dealer_user_role_dealerId_fkey"
  FOREIGN KEY ("dealerId") REFERENCES "dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dealer_user_role" ADD CONSTRAINT "dealer_user_role_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user" ADD COLUMN "dealerId" TEXT;
ALTER TABLE "user" ADD CONSTRAINT "user_dealerId_fkey"
  FOREIGN KEY ("dealerId") REFERENCES "dealer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed dealers for existing DEALER users
DO $$
DECLARE
  r RECORD;
  did TEXT;
  dtype "DealerType";
BEGIN
  FOR r IN SELECT id, email, name, "priceListId", "accountType" FROM "user" WHERE "accountType" = 'DEALER' LOOP
    did := m125_id();
    IF r.email LIKE 'horeca%' THEN dtype := 'HORECA'; ELSE dtype := 'BAYI'; END IF;
    INSERT INTO "dealer" ("id", "unvan", "dealerType", "status", "priceListId", "createdAt", "updatedAt")
    VALUES (did, COALESCE(r.name, r.email), dtype, 'AKTIF', r."priceListId", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    UPDATE "user" SET "dealerId" = did WHERE id = r.id;
    INSERT INTO "dealer_user_role" ("id", "dealerId", "userId", "role", "createdAt")
    VALUES (m125_id(), did, r.id, 'YETKILI', CURRENT_TIMESTAMP);
  END LOOP;
END $$;

-- ========== 5. LEAD bridge ==========
ALTER TABLE "lead" ADD COLUMN "source" "LeadSource" NOT NULL DEFAULT 'MANUEL';
ALTER TABLE "lead" ADD COLUMN "lostReason" TEXT;
ALTER TABLE "lead" ADD COLUMN "convertedDealerId" TEXT;
ALTER TABLE "lead" ADD CONSTRAINT "lead_convertedDealerId_fkey"
  FOREIGN KEY ("convertedDealerId") REFERENCES "dealer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "lead_stage_audit" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "fromStage" "LeadStage",
    "toStage" "LeadStage" NOT NULL,
    "reason" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_stage_audit_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "lead_stage_audit" ADD CONSTRAINT "lead_stage_audit_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lead_stage_audit" ADD CONSTRAINT "lead_stage_audit_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ========== 6. CART ==========
CREATE TABLE "cart" (
    "id" TEXT NOT NULL,
    "guestKey" TEXT,
    "userId" TEXT,
    "dealerId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cart_guestKey_key" ON "cart"("guestKey");
CREATE INDEX "cart_userId_idx" ON "cart"("userId");
ALTER TABLE "cart" ADD CONSTRAINT "cart_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart" ADD CONSTRAINT "cart_dealerId_fkey"
  FOREIGN KEY ("dealerId") REFERENCES "dealer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "cart_line" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "lotId" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPriceKurus" INTEGER NOT NULL,
    "discountBreakdown" JSONB NOT NULL DEFAULT '[]',
    "vatRateBasisPoints" INTEGER NOT NULL DEFAULT 100,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cart_line_pkey" PRIMARY KEY ("id")
);
-- Unique: treat NULL lotId as '' via expression index for guest lines without lot
CREATE UNIQUE INDEX "cart_line_cart_variant_lot_key"
  ON "cart_line" ("cartId", "variantId", COALESCE("lotId", ''));
ALTER TABLE "cart_line" ADD CONSTRAINT "cart_line_cartId_fkey"
  FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_line" ADD CONSTRAINT "cart_line_variantId_fkey"
  FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cart_line" ADD CONSTRAINT "cart_line_lotId_fkey"
  FOREIGN KEY ("lotId") REFERENCES "lot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DROP FUNCTION IF EXISTS m125_id();
