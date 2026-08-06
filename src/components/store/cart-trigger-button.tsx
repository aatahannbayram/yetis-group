"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/store/cart-context";

export function CartTriggerButton() {
  const { itemCount, open } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={open}
      aria-label="Sepeti aç"
      className="relative size-11 shrink-0"
    >
      <ShoppingBag />
      {itemCount > 0 ? (
        <span className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full bg-brand-700 text-[10px] font-semibold text-white tabular-nums">
          {itemCount}
        </span>
      ) : null}
    </Button>
  );
}
