-- Rollback M13 attributes/media

DROP TABLE IF EXISTS "product_attribute_selected_option";
DROP TABLE IF EXISTS "product_attribute_value";
DROP TABLE IF EXISTS "category_attribute";
DROP TABLE IF EXISTS "attribute_option";
DROP TABLE IF EXISTS "attribute_definition";
DROP TABLE IF EXISTS "product_media";

ALTER TABLE "product"
  DROP COLUMN IF EXISTS "storageCondition",
  DROP COLUMN IF EXISTS "shelfLifeDays",
  DROP COLUMN IF EXISTS "requiresColdChain",
  DROP COLUMN IF EXISTS "usageTips",
  DROP COLUMN IF EXISTS "techSheetUrl";

DROP TYPE IF EXISTS "AttributeType";
DROP TYPE IF EXISTS "MediaKind";
