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
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    addVariant: (variantId, quantity = 1) => {
      startTransition(async () => {
        const next = await addToCartAction(variantId, quantity);
        setCart(next);
        setIsOpen(true);
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
