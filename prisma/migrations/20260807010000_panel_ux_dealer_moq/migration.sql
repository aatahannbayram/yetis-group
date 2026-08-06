-- Membership / payment enums
CREATE TYPE "MembershipTier" AS ENUM ('STANDART', 'PREMIUM', 'VIP');
CREATE TYPE "DealerPaymentMethod" AS ENUM ('VADELI', 'PESIN', 'HAVALE', 'KARMA');

-- Dealer contact + commercial fields
ALTER TABLE "dealer" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "dealer" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "dealer" ADD COLUMN IF NOT EXISTS "addressLine" TEXT;
ALTER TABLE "dealer" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "dealer" ADD COLUMN IF NOT EXISTS "district" TEXT;
ALTER TABLE "dealer" ADD COLUMN IF NOT EXISTS "deliveryAddressLine" TEXT;
ALTER TABLE "dealer" ADD COLUMN IF NOT EXISTS "paymentMethod" "DealerPaymentMethod";
ALTER TABLE "dealer" ADD COLUMN IF NOT EXISTS "iban" TEXT;

-- Migrate membershipTier string → enum (nullable)
ALTER TABLE "dealer" ADD COLUMN IF NOT EXISTS "membershipTier_new" "MembershipTier";
UPDATE "dealer" SET "membershipTier_new" = CASE
  WHEN upper(coalesce("membershipTier", '')) IN ('PREMIUM', 'VIP') THEN upper("membershipTier")::"MembershipTier"
  WHEN "membershipTier" IS NULL OR trim("membershipTier") = '' THEN NULL
  ELSE 'STANDART'::"MembershipTier"
END;
ALTER TABLE "dealer" DROP COLUMN IF EXISTS "membershipTier";
ALTER TABLE "dealer" RENAME COLUMN "membershipTier_new" TO "membershipTier";

-- Variant MOQ
ALTER TABLE "product_variant" ADD COLUMN IF NOT EXISTS "moq" INTEGER NOT NULL DEFAULT 1;
