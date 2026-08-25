import { PageHeader } from "@/components/ui/page-header";
import { PillButton, StatCard } from "@/components/admin/stat-card";
import { PriceExcelToolbar } from "@/components/admin/price-excel-toolbar";
import { PriceListsManager } from "@/components/admin/price-lists-manager";
import { getPriceListsWithItems, listActiveVariantsForPicker } from "@/infra/db/pricing";
import { packLabel } from "@/lib/format/packaging";

export default async function AdminPriceListsPage() {
  const [priceLists, variants] = await Promise.all([
    getPriceListsWithItems(),
    listActiveVariantsForPicker(),
  ]);
  const totalItems = priceLists.reduce((sum, list) => sum + list.items.length, 0);
  const unusedLists = priceLists.filter((list) => list.dealers.length === 0).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Fiyat listeleri"
        count={priceLists.length}
        description="Bayi / müşteri gruplarına özel fiyatlar. Listeler bayi kaydına atanır."
        primaryAction={
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <PriceExcelToolbar />
            <PillButton href="/panel/bayiler" variant="secondary">
              Bayi/Müşteriler
            </PillButton>
          </div>
        }
      />

      <section aria-label="Özet" className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Liste" value={priceLists.length} href="#listeler" />
        <StatCard label="Fiyat kalemi" value={totalItems} href="#listeler" />
        <StatCard
          label="Atanmamış liste"
          value={unusedLists}
          tone={unusedLists > 0 ? "warning" : "neutral"}
          href="#listeler"
        />
      </section>

      <div id="listeler">
        <PriceListsManager
          lists={priceLists.map((list) => ({
            id: list.id,
            name: list.name,
            slug: list.slug,
            dealerNames: list.dealers.map((d) => d.unvan),
            items: list.items.map((item) => ({
              id: item.id,
              variantId: item.variantId,
              priceKurus: item.priceKurus,
              sku: item.variant.sku,
              packLabel: packLabel(item.variant.packSize, item.variant.packagingType),
              productName: item.variant.product.name,
              productSlug: item.variant.product.slug,
              imageUrl: item.variant.product.imageUrl,
            })),
          }))}
          variantOptions={variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            label: `${v.product.name} · ${v.sku} (${packLabel(v.packSize, v.packagingType)})`,
            basePriceTl: (v.pricePerUnitKurus / 100).toFixed(2),
          }))}
        />
      </div>
    </div>
  );
}
