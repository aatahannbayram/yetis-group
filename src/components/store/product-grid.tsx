"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductCard, type ProductListItem } from "@/components/store/product-card";
import { HoverLift } from "@/components/motion/hover-lift";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  categories,
  activeCategory,
}: {
  products: ProductListItem[];
  categories: { slug: string; name: string }[];
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

  function setCategory(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("kategori", slug);
    else params.delete("kategori");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div>
      <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={cn(
            "mkt-pill mkt-label shrink-0 px-4 py-2",
            !activeCategory
              ? "bg-mkt-accent text-mkt-accent-ink"
              : "bg-mkt-card-muted text-mkt-ink-muted",
          )}
        >
          Tümü
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setCategory(cat.slug)}
            className={cn(
              "mkt-pill mkt-label shrink-0 px-4 py-2",
              activeCategory === cat.slug
                ? "bg-mkt-accent text-mkt-accent-ink"
                : "bg-mkt-card-muted text-mkt-ink-muted",
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mkt-ink-muted"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ürün veya kategori ara..."
          className="mkt-pill h-11 border-[color:var(--mkt-border)] bg-mkt-card-muted pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mkt-body mt-10">Sonuç bulunamadı.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <HoverLift key={product.id} className="h-full">
              <ProductCard product={product} />
            </HoverLift>
          ))}
        </div>
      )}

      {activeCategory ? (
        <p className="mkt-label mt-8 text-mkt-ink-muted">
          Filtre:{" "}
          <Link href="/urunler" className="text-mkt-green-text hover:underline">
            temizle
          </Link>
        </p>
      ) : null}
    </div>
  );
}
