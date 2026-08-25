-- Catalog list performance indexes
CREATE INDEX IF NOT EXISTS "product_active_idx" ON "product"("active");
CREATE INDEX IF NOT EXISTS "product_primaryCategoryId_idx" ON "product"("primaryCategoryId");
CREATE INDEX IF NOT EXISTS "product_variant_productId_isActive_sortOrder_idx" ON "product_variant"("productId", "isActive", "sortOrder");
CREATE INDEX IF NOT EXISTS "product_category_categoryId_idx" ON "product_category"("categoryId");
