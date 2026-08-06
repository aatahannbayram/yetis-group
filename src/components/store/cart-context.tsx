"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  addToCartAction,
  fetchCartAction,
  removeFromCartAction,
  setCartQuantityAction,
  type CartView,
  type CartViewLine,
} from "@/app/(store)/sepet/actions";
import { canTrackAnalytics, trackEcommerce } from "@/lib/analytics/adapter";

type CartContextValue = {
  lines: CartViewLine[];
  itemCount: number;
  totalKurus: number;
  isOpen: boolean;
  isPending: boolean;
  open: () => void;
  close: () => void;
  addVariant: (variantId: string, quantity?: number) => void;
  removeLine: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  refresh: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const next = await fetchCartAction();
      setCart(next);
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value: CartContextValue = {
    lines: cart?.lines ?? [],
    itemCount: cart?.itemCount ?? 0,
    totalKurus: cart?.totalKurus ?? 0,
    isOpen,
    isPending,
    open: () => {
      setIsOpen(true);
      if (canTrackAnalytics() && (cart?.itemCount ?? 0) > 0) {
        trackEcommerce("begin_checkout", {
          value: (cart?.totalKurus ?? 0) / 100,
          items: (cart?.lines ?? []).map((l) => ({
            item_id: l.variantId,
            item_name: l.name,
            price: l.unitPriceKurus / 100,
            quantity: l.quantity,
          })),
        });
      }
    },
    close: () => setIsOpen(false),
    addVariant: (variantId, quantity = 1) => {
      startTransition(async () => {
        const next = await addToCartAction(variantId, quantity);
        if (!next) return;
        setCart(next);
        setIsOpen(true);
        if (canTrackAnalytics()) {
          const line = next.lines.find((l) => l.variantId === variantId);
          trackEcommerce("add_to_cart", {
            value: ((line?.unitPriceKurus ?? 0) * quantity) / 100,
            items: [
              {
                item_id: variantId,
                item_name: line?.name ?? variantId,
                price: (line?.unitPriceKurus ?? 0) / 100,
                quantity,
              },
            ],
          });
        }
      });
    },
    removeLine: (lineId) => {
      startTransition(async () => {
        const next = await removeFromCartAction(lineId);
        setCart(next);
      });
    },
    setQuantity: (lineId, quantity) => {
      startTransition(async () => {
        const next = await setCartQuantityAction(lineId, quantity);
        setCart(next);
      });
    },
    refresh,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
