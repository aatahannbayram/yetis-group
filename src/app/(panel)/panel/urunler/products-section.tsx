import { getProductsForAdminList } from "@/infra/db/products";
import { getInventoryDashboardSummary, getStockSummaryByProduct } from "@/infra/db/inventory";
import { listCategories } from "@/infra/db/categories";
import { listProducers } from "@/infra/db/producers";
import { listPackagingOptions } from "@/infra/db/attributes";
import { zeroKg } from "@/domain/weight";
import { PageHeader } from "@/components/ui/page-header";
import { PillButton, StatCard } from "@/components/admin/stat-card";
import { ProductListSheet, type ProductRow } from "@/components/admin/product-list-sheet";

export async function AdminProductsSection() {
  const [products, stockByProduct, inventory, categories, producers, packagingOptions] =
    await Promise.all([
      getProductsForAdminList(),
      getStockSummaryByProduct(),
      getInventoryDashboardSummary(),
      listCategories(),
      listProducers(),
      listPackagingOptions(),
    ]);

  const { totalKg, lotCount, expiringSoonCount } = inventory;
  const variantCount = products.reduce((sum, p) => sum + p.variants.length, 0);

  const rows: ProductRow[] = products
    .filter((p) => p.variants.length > 0)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      imageUrl: p.imageUrl,
      categoryName: p.primaryCategory.name,
      stockKg: (stockByProduct.get(p.id) ?? zeroKg).toNumber(),
      variants: p.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        packSize: v.packSize,
        packagingType: v.packagingType,
        baseUnit: v.baseUnit,
        unitFactor: v.unitFactor.toString(),
        vatRateBasisPoints: v.vatRateBasisPoints,
        pricePerUnitKurus: v.pricePerUnitKurus,
      })),
      media: p.media.map((m) => ({ id: m.id, url: m.url, alt: m.alt, isPrimary: m.isPrimary })),
    }));

  return (
    <>
      <PageHeader
        title="Ürünler"
        count={products.length}
        description="Katalog, stok ve baz fiyat. Hızlı düzenleme."
        primaryAction={
          <PillButton href="/panel/fiyat-listeleri" variant="secondary">
            Fiyat listeleri
          </PillButton>
        }
      />

      <section aria-label="Özet" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam ürün" value={products.length} href="#urun-listesi" />
        <StatCard label="Toplam paket" value={variantCount} href="#urun-listesi" />
        <StatCard
          label="Sevk edilebilir"
          value={Math.round(totalKg.toNumber())}
          unit="kg"
          href="#urun-listesi"
        />
        <StatCard
          label="SKT eşiği"
          value={expiringSoonCount}
          tone={expiringSoonCount > 0 ? "warning" : "neutral"}
          href="/panel/sevkiyat"
        />
      </section>

      <div id="urun-listesi">
        <ProductListSheet
          products={rows}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          producers={producers.map((p) => ({ id: p.id, name: p.name }))}
          packagingOptions={packagingOptions}
        />
      </div>

      {lotCount === 0 ? (
        <p className="text-sm text-stone-500">
          Henüz lot kaydı yok. Ürün detayına girip lot ekleyin.
        </p>
      ) : null}
    </>
  );
}
