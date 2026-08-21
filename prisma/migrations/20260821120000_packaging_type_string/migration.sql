-- Packaging types become free strings driven by AttributeDefinition key `ambalaj`.
ALTER TABLE "product_variant" ALTER COLUMN "packagingType" DROP DEFAULT;
ALTER TABLE "product_variant" ALTER COLUMN "packagingType" TYPE TEXT USING ("packagingType"::text);
ALTER TABLE "product_variant" ALTER COLUMN "packagingType" SET DEFAULT 'KOLI';

DROP TYPE IF EXISTS "PackagingType";
