-- CreateEnum
CREATE TYPE "ProformaStatus" AS ENUM ('DRAFT', 'ISSUED', 'VOID');

-- CreateEnum
CREATE TYPE "InvoiceKind" AS ENUM ('PROFORMA', 'E_FATURA');

-- CreateTable
CREATE TABLE "proforma_invoice" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "kind" "InvoiceKind" NOT NULL DEFAULT 'PROFORMA',
    "number" TEXT NOT NULL,
    "status" "ProformaStatus" NOT NULL DEFAULT 'ISSUED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "buyerUnvan" TEXT NOT NULL,
    "buyerVergiNo" TEXT,
    "buyerVergiDairesi" TEXT,
    "buyerAddress" TEXT,
    "buyerEmail" TEXT,
    "sellerName" TEXT NOT NULL,
    "sellerEmail" TEXT,
    "sellerPhone" TEXT,
    "subtotalKurus" INTEGER NOT NULL,
    "vatKurus" INTEGER NOT NULL,
    "totalKurus" INTEGER NOT NULL,
    "note" TEXT,
    "pdfPath" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proforma_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proforma_line" (
    "id" TEXT NOT NULL,
    "proformaId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceKurus" INTEGER NOT NULL,
    "vatRateBasisPoints" INTEGER NOT NULL,
    "lineTotalKurus" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "proforma_line_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proforma_invoice_number_key" ON "proforma_invoice"("number");

-- CreateIndex
CREATE INDEX "proforma_invoice_orderId_status_idx" ON "proforma_invoice"("orderId", "status");

-- AddForeignKey
ALTER TABLE "proforma_invoice" ADD CONSTRAINT "proforma_invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proforma_line" ADD CONSTRAINT "proforma_line_proformaId_fkey" FOREIGN KEY ("proformaId") REFERENCES "proforma_invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
