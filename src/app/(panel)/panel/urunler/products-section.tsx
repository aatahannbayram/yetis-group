import {
  countActiveProducts,
  countActiveVariants,
  getAdminProductsPage,
} from "@/infra/db/product-list-page";
import { getInventoryDashboardSummary } from "@/infra/db/inventory";
import { listCategories } from "@/infra/db/categories";
import { listProducers } from "@/infra/db/producers";
import { listPackagingOptions } from "@/infra/db/attributes";
import { PageHeader } from "@/components/ui/page-header";
import { PillButton, StatCard } from "@/components/admin/stat-card";
import { ProductListSheet, type ProductRow } from "@/components/admin/product-list-sheet";

export async function AdminProductsSection() {
  const [catalogPage, totalProducts, variantCount, inventory, categories, producers, packagingOptions] =
    await Promise.all([
      getAdminProductsPage(),
      countActiveProducts(),
      countActiveVariants(),
      getInventoryDashboardSummary(),
      listCategories(),
      listProducers(),
      listPackagingOptions(),
    ]);

  const { totalKg, lotCount, expiringSoonCount } = inventory;
  const rows: ProductRow[] = catalogPage.items;

  return (
    <>
      <PageHeader
        title="Ürünler"
        count={totalProducts}
        description="Katalog, stok ve baz fiyat. Hızlı düzenleme."
        primaryAction={
          <PillButton href="/panel/fiyat-listeleri" variant="secondary">
            Fiyat listeleri
          </PillButton>
        }
      />

      <section aria-label="Özet" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam ürün" value={totalProducts} href="#urun-listesi" />
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
          initialProducts={rows}
          initialNextCursor={catalogPage.nextCursor}
          totalProductCount={catalogPage.totalCount}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          producers={producers.map((p) => ({ id: p.id, name: p.name }))}
          packagingOptions={packagingOptions}
        />
      </div>

      {lotCount === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">
          Henüz lot kaydı yok. Ürün detayına girip lot ekleyin.
        </p>
      ) : null}
    </>
  );
}
