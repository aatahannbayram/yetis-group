-- Down M16 CRM
ALTER TABLE "lead_task" DROP CONSTRAINT IF EXISTS "lead_task_assigneeId_fkey";
ALTER TABLE "lead_task" DROP CONSTRAINT IF EXISTS "lead_task_leadId_fkey";
ALTER TABLE "lead_field_value" DROP CONSTRAINT IF EXISTS "lead_field_value_fieldId_fkey";
ALTER TABLE "lead_field_value" DROP CONSTRAINT IF EXISTS "lead_field_value_leadId_fkey";
ALTER TABLE "lead" DROP CONSTRAINT IF EXISTS "lead_assigneeId_fkey";
ALTER TABLE "lead" DROP CONSTRAINT IF EXISTS "lead_interestedCategoryId_fkey";

DROP TABLE IF EXISTS "lead_task";
DROP TABLE IF EXISTS "lead_field_value";
DROP TABLE IF EXISTS "lead_field_definition";
DROP TYPE IF EXISTS "LeadFieldType";

DROP INDEX IF EXISTS "lead_assigneeId_idx";
DROP INDEX IF EXISTS "lead_source_createdAt_idx";

ALTER TABLE "lead" DROP COLUMN IF EXISTS "kvkkConsentAt";
ALTER TABLE "lead" DROP COLUMN IF EXISTS "assigneeId";
ALTER TABLE "lead" DROP COLUMN IF EXISTS "interestedCategoryId";
ALTER TABLE "lead" DROP COLUMN IF EXISTS "email";
