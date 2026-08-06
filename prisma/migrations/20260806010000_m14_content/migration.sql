-- M14: blog/news + recipes

CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED');
CREATE TYPE "RecipeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

CREATE TABLE IF NOT EXISTS "content_post" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL DEFAULT '',
  "coverUrl" TEXT,
  "body" TEXT NOT NULL DEFAULT '',
  "category" TEXT NOT NULL DEFAULT 'genel',
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "authorName" TEXT NOT NULL DEFAULT 'Yetiş Grup',
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "readingMins" INTEGER NOT NULL DEFAULT 5,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "content_post_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "content_post_slug_key" ON "content_post"("slug");
CREATE INDEX IF NOT EXISTS "content_post_status_publishedAt_idx" ON "content_post"("status", "publishedAt");

CREATE TABLE IF NOT EXISTS "recipe" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL DEFAULT '',
  "coverUrl" TEXT,
  "servings" INTEGER NOT NULL DEFAULT 4,
  "prepMinutes" INTEGER NOT NULL DEFAULT 15,
  "cookMinutes" INTEGER NOT NULL DEFAULT 30,
  "difficulty" "RecipeDifficulty" NOT NULL DEFAULT 'MEDIUM',
  "ingredients" JSONB NOT NULL DEFAULT '[]',
  "steps" JSONB NOT NULL DEFAULT '[]',
  "tips" TEXT NOT NULL DEFAULT '',
  "authorName" TEXT NOT NULL DEFAULT 'Yetiş Grup',
  "isOfficial" BOOLEAN NOT NULL DEFAULT true,
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "recipe_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "recipe_slug_key" ON "recipe"("slug");
CREATE INDEX IF NOT EXISTS "recipe_status_publishedAt_idx" ON "recipe"("status", "publishedAt");

CREATE TABLE IF NOT EXISTS "content_post_product" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  CONSTRAINT "content_post_product_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "content_post_product_postId_productId_key" ON "content_post_product"("postId", "productId");
ALTER TABLE "content_post_product" DROP CONSTRAINT IF EXISTS "content_post_product_postId_fkey";
ALTER TABLE "content_post_product" ADD CONSTRAINT "content_post_product_postId_fkey" FOREIGN KEY ("postId") REFERENCES "content_post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_post_product" DROP CONSTRAINT IF EXISTS "content_post_product_productId_fkey";
ALTER TABLE "content_post_product" ADD CONSTRAINT "content_post_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "content_post_recipe" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "recipeId" TEXT NOT NULL,
  CONSTRAINT "content_post_recipe_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "content_post_recipe_postId_recipeId_key" ON "content_post_recipe"("postId", "recipeId");
ALTER TABLE "content_post_recipe" DROP CONSTRAINT IF EXISTS "content_post_recipe_postId_fkey";
ALTER TABLE "content_post_recipe" ADD CONSTRAINT "content_post_recipe_postId_fkey" FOREIGN KEY ("postId") REFERENCES "content_post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_post_recipe" DROP CONSTRAINT IF EXISTS "content_post_recipe_recipeId_fkey";
ALTER TABLE "content_post_recipe" ADD CONSTRAINT "content_post_recipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "recipe_product" (
  "id" TEXT NOT NULL,
  "recipeId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  CONSTRAINT "recipe_product_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "recipe_product_recipeId_productId_key" ON "recipe_product"("recipeId", "productId");
ALTER TABLE "recipe_product" DROP CONSTRAINT IF EXISTS "recipe_product_recipeId_fkey";
ALTER TABLE "recipe_product" ADD CONSTRAINT "recipe_product_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recipe_product" DROP CONSTRAINT IF EXISTS "recipe_product_productId_fkey";
ALTER TABLE "recipe_product" ADD CONSTRAINT "recipe_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
