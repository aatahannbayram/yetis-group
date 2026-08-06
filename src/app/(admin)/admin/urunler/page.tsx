import { getProducts } from "@/infra/db/products";
import { getInventoryDashboardSummary, getStockSummaryByProduct } from "@/infra/db/inventory";
import { listCategories } from "@/infra/db/categories";
import { listProducers } from "@/infra/db/producers";
import { zeroKg } from "@/domain/weight";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PillButton, StatCard } from "@/components/admin/stat-card";
import { ProductListSheet, type ProductRow } from "@/components/admin/product-list-sheet";

export default async function AdminProductsPage() {
  const [products, stockByProduct, inventory, categories, producers] = await Promise.all([
    getProducts(),
    getStockSummaryByProduct(),
    getInventoryDashboardSummary(),
    listCategories(),
    listProducers(),
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
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Ürünler"
        description="Baz fiyatlar varsayılan varyant üzerinden düzenlenir. Lot/SKT varyant seviyesindedir."
        actions={
          <>
            <PillButton href="/admin/fiyat-listeleri" variant="secondary">
              Fiyat Listeleri
            </PillButton>
          </>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam Ürün" value={products.length} href="#urun-listesi" featured />
        <StatCard label="Toplam Varyant" value={variantCount} href="#urun-listesi" />
        <StatCard
          label="Toplam Stok"
          value={Math.round(totalKg.toNumber())}
          suffix=" kg"
          href="#urun-listesi"
        />
        <StatCard
          label="SKT Yaklaşan (14 gün)"
          value={expiringSoonCount}
          warn={expiringSoonCount > 0}
          href="#urun-listesi"
        />
      </div>

      <div
        id="urun-listesi"
        className="mt-6 overflow-x-auto rounded-3xl border border-border bg-card shadow-sm"
      >
        <ProductListSheet
          products={rows}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          producers={producers.map((p) => ({ id: p.id, name: p.name }))}
        />
      </div>

      {lotCount === 0 ? (
        <p className="mt-3 text-caption text-muted-foreground">
          Henüz lot kaydı yok. Ürün detayına girip lot ekleyin.
        </p>
      ) : null}
    </div>
  );
}
