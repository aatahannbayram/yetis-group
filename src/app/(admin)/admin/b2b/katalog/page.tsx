import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Package, Pencil } from "lucide-react";
import { getProducts } from "@/infra/db/products";
import { getStockSummaryByProduct } from "@/infra/db/inventory";
import { listCategories } from "@/infra/db/categories";
import { zeroKg } from "@/domain/weight";
import { money } from "@/domain/money";
import { formatMoney } from "@/lib/format/money";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PillButton, StatCard } from "@/components/admin/stat-card";
import { cn } from "@/lib/utils";

export default async function AdminB2bCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const [products, stockByProduct, categories] = await Promise.all([
    getProducts(kategori ? { categorySlug: kategori } : undefined),
    getStockSummaryByProduct(),
    listCategories(),
  ]);

  const roots = categories.filter((c) => !c.parentId);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="B2B Katalog"
        description="Bayinin gördüğü ürün yüzeyi. Düzenlemek için ürün yönetimine, önizlemek için mağazaya gidin."
        actions={
          <>
            <PillButton href="/admin/urunler" variant="secondary">
              Ürün yönetimi
            </PillButton>
            <PillButton href="/urunler" className="gap-1.5">
              Mağaza
              <ExternalLink className="size-3.5" aria-hidden />
            </PillButton>
          </>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Gösterilen ürün" value={products.length} href="#katalog" featured />
        <StatCard
          label="Varyant"
          value={products.reduce((s, p) => s + p.variants.length, 0)}
          href="#katalog"
        />
        <StatCard
          label="Stoklu ürün"
          value={products.filter((p) => (stockByProduct.get(p.id) ?? zeroKg).toNumber() > 0).length}
          href="#katalog"
        />
      </div>

      {roots.length > 0 ? (
        <nav
          aria-label="Kategori filtresi"
          className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <FilterChip href="/admin/b2b/katalog" label="Tümü" active={!kategori} />
          {roots.map((cat) => (
            <FilterChip
              key={cat.id}
              href={`/admin/b2b/katalog?kategori=${encodeURIComponent(cat.slug)}`}
              label={cat.name}
              active={kategori === cat.slug}
            />
          ))}
        </nav>
      ) : null}

      <div id="katalog" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const variant = product.variants[0];
          const stock = (stockByProduct.get(product.id) ?? zeroKg).toNumber();
          const cover = product.media.find((m) => m.isPrimary)?.url ?? product.imageUrl;

          return (
            <article
              key={product.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
            >
              <div className="relative aspect-[16/10] bg-muted">
                {cover ? (
                  <Image
                    src={cover}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <Package className="size-8 opacity-40" aria-hidden />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <p className="text-caption font-medium text-muted-foreground">
                  {product.primaryCategory.name}
                </p>
                <h2 className="mt-1 text-body font-semibold tracking-[-0.015em] text-foreground">
                  {product.name}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted-foreground">
                  {variant ? (
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatMoney(money(variant.pricePerUnitKurus))}
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        / {variant.baseUnit.toLowerCase()}
                      </span>
                    </span>
                  ) : (
                    <span>Varyant yok</span>
                  )}
                  <span className="tabular-nums">{Math.round(stock)} kg stok</span>
                </div>
                <div className="mt-4 flex gap-2 border-t border-border pt-3">
                  <Link
                    href={`/admin/urunler/${product.slug}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-700 px-3 py-2 text-caption font-semibold text-white hover:bg-brand-800"
                  >
                    <Pencil className="size-3.5" aria-hidden />
                    Düzenle
                  </Link>
                  <Link
                    href={`/urunler/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-caption font-semibold text-foreground hover:bg-muted"
                  >
                    <ExternalLink className="size-3.5" aria-hidden />
                    Mağaza
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {products.length === 0 ? (
        <p className="mt-10 text-center text-body-sm text-muted-foreground">
          Bu filtrede ürün yok.
        </p>
      ) : null}
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
        "inline-flex shrink-0 rounded-full px-3.5 py-2 text-caption font-semibold transition-colors",
        active
          ? "bg-foreground text-background"
          : "border border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      {label}
    </Link>
  );
}
