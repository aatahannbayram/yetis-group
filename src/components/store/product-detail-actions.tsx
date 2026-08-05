"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/store/cart-context";
import type { ProductListItem } from "@/components/store/product-card";

export function ProductDetailActions({ product }: { product: ProductListItem }) {
  const { addLine } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          aria-label="Azalt"
        >
          <Minus />
        </Button>
        <span className="w-8 text-center tabular-nums text-body-lg font-medium">{quantity}</span>
        <Button variant="outline" size="icon" onClick={() => setQuantity((q) => q + 1)} aria-label="Artır">
          <Plus />
        </Button>
      </div>

      <Button
        size="lg"
        className="h-11 text-base"
        onClick={() => {
          addLine(
            {
              productId: product.id,
              name: product.name,
              unitLabel: product.unitLabel,
              priceKurus: product.unitPrice,
              kgPerUnit: product.kgPerUnit,
            },
            quantity,
          );
          setAdded(true);
          setTimeout(() => setAdded(false), 1600);
        }}
      >
        {added ? "Sepete Eklendi" : "Sepete Ekle"}
      </Button>
    </div>
  );
}
