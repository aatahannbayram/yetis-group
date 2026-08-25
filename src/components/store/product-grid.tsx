"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductCard, type ProductListItem } from "@/components/store/product-card";
import { HoverLift } from "@/components/motion/hover-lift";
import { CatalogCategoryFilter } from "@/components/store/catalog-category-filter";
import type { CatalogFilterGroup } from "@/domain/catalog/filter-groups";
import { findFilterGroup } from "@/domain/catalog/filter-groups";

export function ProductGrid({
  products,
  filterGroups,
  totalCount,
  activeCategory,
}: {
  products: ProductListItem[];
  filterGroups: CatalogFilterGroup[];
  totalCount: number;
  activeCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLocaleLowerCase("tr-TR").includes(q) ||
        p.category.toLocaleLowerCase("tr-TR").includes(q) ||
        p.sku.toLocaleLowerCase("tr-TR").includes(q) ||
        (p.cins ?? []).some(
          (c) =>
            c.packLabel.toLocaleLowerCase("tr-TR").includes(q) ||
            c.packagingType.toLocaleLowerCase("tr-TR").includes(q),
        ),
    );
  }, [products, query]);

  const activeLabel = useMemo(() => {
    if (!activeCategory) return null;
    const hit = findFilterGroup(filterGroups, activeCategory);
    if (!hit) return activeCategory;
    return hit.activeChild?.name ?? hit.group.name;
  }, [activeCategory, filterGroups]);

  function setCategory(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("kategori", slug);
    else params.delete("kategori");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div>
      <CatalogCategoryFilter
        groups={filterGroups}
        totalCount={totalCount}
        activeCategory={activeCategory}
        onSelect={setCategory}
      />

      <div className="relative mt-5 max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mkt-ink-muted"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ürün veya kategori ara..."
          className="mkt-pill h-11 border-[color:var(--mkt-border)] bg-white pl-9"
          aria-label="Ürün veya kategori ara"
        />
      </div>

      {activeLabel ? (
        <p className="mkt-label mt-4 text-mkt-ink-muted">
          {filtered.length} ürün · {activeLabel}
          {" · "}
          <Link href="/urunler" className="text-mkt-green-text hover:underline">
            Filtreyi temizle
          </Link>
        </p>
      ) : (
        <p className="mkt-label mt-4 text-mkt-ink-muted">{filtered.length} ürün listeleniyor</p>
      )}

      {filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="mkt-body">Sonuç bulunamadı.</p>
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[13px] font-semibold text-mkt-green-text hover:underline"
            >
              Aramayı temizle
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <HoverLift key={product.id} className="h-full">
              <ProductCard product={product} />
            </HoverLift>
          ))}
        </div>
      )}
    </div>
  );
}
