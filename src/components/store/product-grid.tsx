"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductCard, type ProductListItem } from "@/components/store/product-card";

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLocaleLowerCase("tr-TR").includes(q) ||
        p.category.toLocaleLowerCase("tr-TR").includes(q),
    );
  }, [products, query]);

  return (
    <div>
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ürün veya kategori ara..."
          className="h-10 pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-body-sm text-neutral-400">Sonuç bulunamadı.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
