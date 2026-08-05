-- CreateEnum
CREATE TYPE "LeadChannel" AS ENUM ('MARKET', 'SARKUTERI', 'HORECA', 'ARA_TOPTANCI');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('YENI', 'ILETISIMDE', 'NUMUNE_TEKLIF', 'MUZAKERE', 'KAZANILDI', 'KAYBEDILDI');

-- CreateTable
CREATE TABLE "lead" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "channel" "LeadChannel" NOT NULL,
    "stage" "LeadStage" NOT NULL DEFAULT 'YENI',
    "estimatedMonthlyKg" DECIMAL(10,3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);
