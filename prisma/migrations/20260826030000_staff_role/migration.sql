-- Personel alt rolleri (Yönetici / Satış / Plasiyer / Muhasebe / Depo)
CREATE TYPE "StaffRole" AS ENUM ('YONETICI', 'SATIS', 'PLASIYER', 'MUHASEBE', 'DEPO');

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "staffRole" "StaffRole";

-- Mevcut STAFF hesaplar tam panel yetkisiyle yönetici kabul edilir
UPDATE "user" SET "staffRole" = 'YONETICI' WHERE "accountType" = 'STAFF' AND "staffRole" IS NULL;
