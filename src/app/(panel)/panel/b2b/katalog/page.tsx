import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Package, Pencil } from "lucide-react";
import { getProducts } from "@/infra/db/products";
import { getShippableStockByVariant } from "@/infra/db/inventory";
import { listCategories } from "@/infra/db/categories";
import { kg } from "@/domain/weight";
import { money } from "@/domain/money";
import { formatMoney } from "@/lib/format/money";
import { formatKg } from "@/lib/format/weight";
import { packLabel, salesUnitLabel } from "@/lib/format/packaging";
import { PageHeader } from "@/components/ui/page-header";
import { PillButton, StatCard } from "@/components/admin/stat-card";
import { cn } from "@/lib/utils";

export default async function AdminB2bCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const [products, stockByVariant, categories] = await Promise.all([
    getProducts(kategori ? { categorySlug: kategori } : undefined),
    getShippableStockByVariant(),
    listCategories(),
  ]);

  const roots = categories.filter((c) => !c.parentId);
  const rows = products.flatMap((product) =>
    product.variants.map((variant) => ({
      product,
      variant,
      stock: stockByVariant.get(variant.id)?.toNumber() ?? 0,
    })),
  );
  const variantCount = rows.length;
  const inStockCount = products.filter((p) =>
    p.variants.some((v) => (stockByVariant.get(v.id)?.toNumber() ?? 0) > 0),
  ).length;
  const outOfStockCount = products.length - inStockCount;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="B2B katalog"
        count={products.length}
        description="Bayinin gördüğü ürün yüzeyi. Düzenlemek için ürün yönetimine, önizlemek için mağazaya gidin."
        primaryAction={
          <div className="flex flex-wrap gap-2">
            <PillButton href="/panel/urunler" variant="secondary">
              Ürün yönetimi
            </PillButton>
            <PillButton href="/urunler" className="gap-1.5">
              Mağaza
              <ExternalLink className="size-3.5" aria-hidden />
            </PillButton>
          </div>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Gösterilen ürün" value={products.length} href="#katalog" />
        <StatCard label="Varyant" value={variantCount} href="#katalog" />
        <StatCard
          label="Stoksuz ürün"
          value={outOfStockCount}
          href="#katalog"
          tone={outOfStockCount > 0 ? "warning" : "neutral"}
          hint={outOfStockCount > 0 ? `${inStockCount} üründe stok var` : undefined}
        />
      </div>

      {roots.length > 0 ? (
        <nav
          aria-label="Kategori filtresi"
          className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <FilterChip href="/panel/b2b/katalog" label="Tümü" active={!kategori} />
          {roots.map((cat) => (
            <FilterChip
              key={cat.id}
              href={`/panel/b2b/katalog?kategori=${encodeURIComponent(cat.slug)}`}
              label={cat.name}
              active={kategori === cat.slug}
            />
          ))}
        </nav>
      ) : null}

      <div
        id="katalog"
        className="mt-6 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]"
      >
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
              <th className="px-3 py-2.5 text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
                Ürün
              </th>
              <th className="px-3 py-2.5 text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
                SKU
              </th>
              <th className="px-3 py-2.5 text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
                Cins
              </th>
              <th className="px-3 py-2.5 text-right text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
                Birim fiyat
              </th>
              <th className="px-3 py-2.5 text-right text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
                Stok
              </th>
              <th className="px-3 py-2.5 text-right text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
                KDV
              </th>
              <th className="px-3 py-2.5 text-right text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
                Net kg
              </th>
              <th className="px-3 py-2.5 text-right text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
                Min.
              </th>
              <th className="px-3 py-2.5 text-right text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
                <span className="sr-only">İşlemler</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, variant, stock }) => {
              const cover = product.media.find((m) => m.isPrimary)?.url ?? product.imageUrl;
              const moq = variant.moq ?? 1;
              const vatPercent = variant.vatRateBasisPoints / 100;
              const extraCins = product.variants.length - 1;

              return (
                <tr
                  key={variant.id}
                  className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-2)]"
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--surface-3)]">
                        {cover ? (
                          <Image
                            src={cover}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-[var(--text-muted)]">
                            <Package className="size-4 opacity-50" aria-hidden />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[length:var(--text-body)] font-medium text-[var(--text-primary)]">
                          {product.name}
                        </p>
                        <p className="truncate text-[length:var(--text-caption)] text-[var(--text-muted)]">
                          {product.primaryCategory.name}
                          {extraCins > 0 ? ` · +${extraCins} cins` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-[length:var(--text-caption)] font-medium tabular-nums text-[var(--text-secondary)]">
                    {variant.sku}
                  </td>
                  <td className="px-3 py-2 text-[length:var(--text-caption)] text-[var(--text-secondary)]">
                    {packLabel(variant.packSize, variant.packagingType)}
                  </td>
                  <td className="px-3 py-2 text-right text-[length:var(--text-body)] font-semibold tabular-nums text-[var(--text-primary)]">
                    {formatMoney(money(variant.pricePerUnitKurus))}
                    <span className="ml-1 font-normal text-[var(--text-muted)]">
                      / {salesUnitLabel(variant.packagingType)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-[length:var(--text-caption)] tabular-nums text-[var(--text-secondary)]">
                    {Math.round(stock)} kg
                  </td>
                  <td className="px-3 py-2 text-right text-[length:var(--text-caption)] tabular-nums text-[var(--text-secondary)]">
                    %{vatPercent}
                  </td>
                  <td className="px-3 py-2 text-right text-[length:var(--text-caption)] tabular-nums text-[var(--text-secondary)]">
                    {formatKg(kg(variant.unitFactor.toString()))}
                  </td>
                  <td className="px-3 py-2 text-right text-[length:var(--text-caption)] tabular-nums text-[var(--text-secondary)]">
                    {moq}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/panel/urunler/${product.slug}`}
                        className="inline-flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
                        aria-label="Düzenle"
                        title="Düzenle"
                      >
                        <Pencil className="size-3.5" aria-hidden />
                      </Link>
                      <Link
                        href={`/urunler/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
                        aria-label="Mağazada aç"
                        title="Mağazada aç"
                      >
                        <ExternalLink className="size-3.5" aria-hidden />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {products.length === 0 ? (
          <p className="px-4 py-10 text-center text-[length:var(--text-body-sm)] text-[var(--text-muted)]">
            Bu filtrede ürün yok.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "inline-flex h-8 shrink-0 items-center rounded-full px-3 text-[length:var(--text-caption)] font-medium transition-colors",
        active
          ? "bg-[var(--text-primary)] text-[var(--surface)]"
          : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-2)]",
      )}
    >
      {label}
    </Link>
  );
}
