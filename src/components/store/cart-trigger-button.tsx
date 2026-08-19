"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/store/cart-context";

/** Visible only for approved dealers (CartProvider.enabled). */
export function CartTriggerButton() {
  const { enabled, itemCount, open } = useCart();
  if (!enabled) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={open}
      aria-label="Sepeti aç"
      className="relative size-11 shrink-0 rounded-full"
    >
      <ShoppingBag className="size-5" strokeWidth={2} />
      {itemCount > 0 ? (
        <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-brand-700 text-[10px] font-semibold text-white tabular-nums ring-2 ring-white">
          {itemCount}
        </span>
      ) : null}
    </Button>
  );
}
