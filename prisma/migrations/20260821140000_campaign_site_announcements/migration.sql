-- CreateEnum
CREATE TYPE "CampaignKind" AS ENUM ('DUYURU', 'KAMPANYA');

-- AlterTable
ALTER TABLE "campaign" ADD COLUMN "kind" "CampaignKind" NOT NULL DEFAULT 'KAMPANYA';
ALTER TABLE "campaign" ADD COLUMN "href" TEXT;
ALTER TABLE "campaign" ADD COLUMN "ctaLabel" TEXT;
ALTER TABLE "campaign" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "campaign" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "campaign_kind_active_sortOrder_idx" ON "campaign"("kind", "active", "sortOrder");
