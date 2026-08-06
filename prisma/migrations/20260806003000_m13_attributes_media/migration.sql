-- M13: attributes, product media, PDP depth fields

CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'VIDEO');
CREATE TYPE "AttributeType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTI_SELECT');

ALTER TABLE "product"
  ADD COLUMN IF NOT EXISTS "storageCondition" TEXT,
  ADD COLUMN IF NOT EXISTS "shelfLifeDays" INTEGER,
  ADD COLUMN IF NOT EXISTS "requiresColdChain" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "usageTips" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "techSheetUrl" TEXT;

CREATE TABLE IF NOT EXISTS "product_media" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL DEFAULT 'IMAGE',
  "alt" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_media_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "product_media_productId_sortOrder_idx"
  ON "product_media"("productId", "sortOrder");

ALTER TABLE "product_media"
  DROP CONSTRAINT IF EXISTS "product_media_productId_fkey";
ALTER TABLE "product_media"
  ADD CONSTRAINT "product_media_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "attribute_definition" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "AttributeType" NOT NULL DEFAULT 'TEXT',
  "unit" TEXT,
  "filterable" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "attribute_definition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "attribute_definition_key_key"
  ON "attribute_definition"("key");

CREATE TABLE IF NOT EXISTS "attribute_option" (
  "id" TEXT NOT NULL,
  "attributeId" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "attribute_option_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "attribute_option_attributeId_value_key"
  ON "attribute_option"("attributeId", "value");

ALTER TABLE "attribute_option"
  DROP CONSTRAINT IF EXISTS "attribute_option_attributeId_fkey";
ALTER TABLE "attribute_option"
  ADD CONSTRAINT "attribute_option_attributeId_fkey"
  FOREIGN KEY ("attributeId") REFERENCES "attribute_definition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "category_attribute" (
  "id" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "attributeId" TEXT NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "category_attribute_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "category_attribute_categoryId_attributeId_key"
  ON "category_attribute"("categoryId", "attributeId");

ALTER TABLE "category_attribute"
  DROP CONSTRAINT IF EXISTS "category_attribute_categoryId_fkey";
ALTER TABLE "category_attribute"
  ADD CONSTRAINT "category_attribute_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "category_attribute"
  DROP CONSTRAINT IF EXISTS "category_attribute_attributeId_fkey";
ALTER TABLE "category_attribute"
  ADD CONSTRAINT "category_attribute_attributeId_fkey"
  FOREIGN KEY ("attributeId") REFERENCES "attribute_definition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "product_attribute_value" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "attributeId" TEXT NOT NULL,
  "valueText" TEXT,
  "valueNumber" DECIMAL(12,3),
  "valueBoolean" BOOLEAN,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_attribute_value_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "product_attribute_value_productId_attributeId_key"
  ON "product_attribute_value"("productId", "attributeId");

ALTER TABLE "product_attribute_value"
  DROP CONSTRAINT IF EXISTS "product_attribute_value_productId_fkey";
ALTER TABLE "product_attribute_value"
  ADD CONSTRAINT "product_attribute_value_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_attribute_value"
  DROP CONSTRAINT IF EXISTS "product_attribute_value_attributeId_fkey";
ALTER TABLE "product_attribute_value"
  ADD CONSTRAINT "product_attribute_value_attributeId_fkey"
  FOREIGN KEY ("attributeId") REFERENCES "attribute_definition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "product_attribute_selected_option" (
  "id" TEXT NOT NULL,
  "valueId" TEXT NOT NULL,
  "optionId" TEXT NOT NULL,
  CONSTRAINT "product_attribute_selected_option_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "product_attribute_selected_option_valueId_optionId_key"
  ON "product_attribute_selected_option"("valueId", "optionId");

ALTER TABLE "product_attribute_selected_option"
  DROP CONSTRAINT IF EXISTS "product_attribute_selected_option_valueId_fkey";
ALTER TABLE "product_attribute_selected_option"
  ADD CONSTRAINT "product_attribute_selected_option_valueId_fkey"
  FOREIGN KEY ("valueId") REFERENCES "product_attribute_value"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_attribute_selected_option"
  DROP CONSTRAINT IF EXISTS "product_attribute_selected_option_optionId_fkey";
ALTER TABLE "product_attribute_selected_option"
  ADD CONSTRAINT "product_attribute_selected_option_optionId_fkey"
  FOREIGN KEY ("optionId") REFERENCES "attribute_option"("id") ON DELETE CASCADE ON UPDATE CASCADE;
