-- M15 SEO redirects
CREATE TABLE IF NOT EXISTS "seo_redirect" (
  "id" TEXT NOT NULL,
  "fromPath" TEXT NOT NULL,
  "toPath" TEXT NOT NULL,
  "statusCode" INTEGER NOT NULL DEFAULT 301,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "note" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "seo_redirect_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "seo_redirect_fromPath_key" ON "seo_redirect"("fromPath");
CREATE INDEX IF NOT EXISTS "seo_redirect_active_idx" ON "seo_redirect"("active");
