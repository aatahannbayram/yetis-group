import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  countActiveProducts,
  countActiveVariants,
  getAdminProductsPage,
} from "@/infra/db/product-list-page";
import { getShippableStockByVariant } from "@/infra/db/inventory";
import { listCategories } from "@/infra/db/categories";
import { PageHeader } from "@/components/ui/page-header";
import { PillButton, StatCard } from "@/components/admin/stat-card";
import { B2bCatalogTable } from "@/components/admin/b2b-catalog-table";
import { cn } from "@/lib/utils";

export default async function AdminB2bCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const filter = kategori ? { categorySlug: kategori } : {};

  const [catalogPage, totalProducts, totalVariants, categories, stockByVariant] =
    await Promise.all([
      getAdminProductsPage(filter),
      countActiveProducts(filter),
      countActiveVariants(filter),
      listCategories(),
      getShippableStockByVariant(),
    ]);

  const roots = categories.filter((c) => !c.parentId);
  const stockRecord = Object.fromEntries(
    [...stockByVariant.entries()].map(([id, value]) => [id, value.toNumber()]),
  );

  const loadedVariantCount = catalogPage.items.reduce(
    (sum, product) => sum + product.variants.length,
    0,
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="B2B katalog"
        count={totalProducts}
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
        <StatCard label="Toplam ürün" value={totalProducts} href="#katalog" />
        <StatCard label="Toplam cins" value={totalVariants} href="#katalog" />
        <StatCard
          label="Yüklenen cins"
          value={loadedVariantCount}
          href="#katalog"
          hint={
            catalogPage.nextCursor
              ? `${catalogPage.items.length} / ${totalProducts} ürün yüklendi`
              : undefined
          }
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
        <B2bCatalogTable
          initialProducts={catalogPage.items}
          initialNextCursor={catalogPage.nextCursor}
          totalProductCount={catalogPage.totalCount}
          stockByVariant={stockRecord}
          categorySlug={kategori}
        />
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
