-- CreateEnum
CREATE TYPE "OrderPaymentMethod" AS ENUM ('HAVALE', 'CARI', 'ONLINE');

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" "OrderPaymentMethod";
