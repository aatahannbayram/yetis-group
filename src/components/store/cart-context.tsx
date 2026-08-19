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
  enabled: boolean;
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

function patchLineQuantity(cart: CartView, lineId: string, quantity: number): CartView {
  if (quantity < 1) {
    const lines = cart.lines.filter((l) => l.id !== lineId);
    return {
      ...cart,
      lines,
      itemCount: lines.reduce((n, l) => n + l.quantity, 0),
      totalKurus: lines.reduce((n, l) => n + l.lineTotalKurus, 0),
    };
  }
  const lines = cart.lines.map((l) =>
    l.id === lineId
      ? { ...l, quantity, lineTotalKurus: l.unitPriceKurus * quantity }
      : l,
  );
  return {
    ...cart,
    lines,
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
    totalKurus: lines.reduce((n, l) => n + l.lineTotalKurus, 0),
  };
}

export function CartProvider({
  children,
  enabled = false,
}: {
  children: ReactNode;
  /** Server-side: only approved dealers get a live cart. */
  enabled?: boolean;
}) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    if (!enabled) return;
    startTransition(async () => {
      const next = await fetchCartAction();
      setCart(next);
    });
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const run = () => {
      if (!cancelled) refresh();
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const t = window.setTimeout(run, 800);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [enabled, refresh]);

  const value: CartContextValue = {
    enabled,
    lines: cart?.lines ?? [],
    itemCount: cart?.itemCount ?? 0,
    totalKurus: cart?.totalKurus ?? 0,
    isOpen,
    isPending,
    open: () => {
      if (!enabled) return;
      setIsOpen(true);
      if (!cart) refresh();
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
      if (!enabled) return;
      setIsOpen(true);
      startTransition(async () => {
        const next = await addToCartAction(variantId, quantity);
        if (!next) return;
        setCart(next);
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
      if (!enabled) return;
      setCart((prev) => (prev ? patchLineQuantity(prev, lineId, 0) : prev));
      startTransition(async () => {
        const next = await removeFromCartAction(lineId);
        setCart(next);
      });
    },
    setQuantity: (lineId, quantity) => {
      if (!enabled) return;
      setCart((prev) => (prev ? patchLineQuantity(prev, lineId, quantity) : prev));
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
