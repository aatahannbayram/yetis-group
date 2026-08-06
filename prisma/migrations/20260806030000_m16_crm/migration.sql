-- M16 CRM deepen: lead contact fields, custom fields, tasks, activity types

ALTER TABLE "lead" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "lead" ADD COLUMN IF NOT EXISTS "interestedCategoryId" TEXT;
ALTER TABLE "lead" ADD COLUMN IF NOT EXISTS "assigneeId" TEXT;
ALTER TABLE "lead" ADD COLUMN IF NOT EXISTS "kvkkConsentAt" TIMESTAMP(3);

DO $$ BEGIN
  ALTER TYPE "LeadActivityType" ADD VALUE IF NOT EXISTS 'EMAIL';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TYPE "LeadActivityType" ADD VALUE IF NOT EXISTS 'WHATSAPP';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TYPE "LeadActivityType" ADD VALUE IF NOT EXISTS 'FORM';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TYPE "LeadActivityType" ADD VALUE IF NOT EXISTS 'GOREV';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TYPE "LeadActivityType" ADD VALUE IF NOT EXISTS 'HATIRLATMA';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "LeadFieldType" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'BOOLEAN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "lead_field_definition" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "type" "LeadFieldType" NOT NULL DEFAULT 'TEXT',
  "options" JSONB NOT NULL DEFAULT '[]',
  "required" BOOLEAN NOT NULL DEFAULT false,
  "formVisible" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "lead_field_definition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "lead_field_definition_key_key" ON "lead_field_definition"("key");

CREATE TABLE IF NOT EXISTS "lead_field_value" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "fieldId" TEXT NOT NULL,
  "valueText" TEXT,
  "valueNum" DECIMAL(14,3),
  "valueDate" TIMESTAMP(3),
  "valueJson" JSONB,
  CONSTRAINT "lead_field_value_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "lead_field_value_leadId_fieldId_key" ON "lead_field_value"("leadId", "fieldId");

CREATE TABLE IF NOT EXISTS "lead_task" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "dueAt" TIMESTAMP(3),
  "doneAt" TIMESTAMP(3),
  "assigneeId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "lead_task_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "lead_task_leadId_doneAt_idx" ON "lead_task"("leadId", "doneAt");
CREATE INDEX IF NOT EXISTS "lead_source_createdAt_idx" ON "lead"("source", "createdAt");
CREATE INDEX IF NOT EXISTS "lead_assigneeId_idx" ON "lead"("assigneeId");

DO $$ BEGIN
  ALTER TABLE "lead" ADD CONSTRAINT "lead_interestedCategoryId_fkey"
    FOREIGN KEY ("interestedCategoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "lead" ADD CONSTRAINT "lead_assigneeId_fkey"
    FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "lead_field_value" ADD CONSTRAINT "lead_field_value_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "lead_field_value" ADD CONSTRAINT "lead_field_value_fieldId_fkey"
    FOREIGN KEY ("fieldId") REFERENCES "lead_field_definition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "lead_task" ADD CONSTRAINT "lead_task_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "lead_task" ADD CONSTRAINT "lead_task_assigneeId_fkey"
    FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
