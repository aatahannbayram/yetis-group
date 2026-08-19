"use client";

import {
  createContext,
  useContext,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  dealerAddToCartAction,
  dealerRemoveLineAction,
  dealerSetQtyAction,
  type DealerCartView,
} from "@/app/(dealer-portal)/bayi/siparis/actions";

type DealerCartContextValue = {
  cart: DealerCartView | null;
  itemCount: number;
  totalKurus: number;
  isOpen: boolean;
  isPending: boolean;
  lastError: string | null;
  open: () => void;
  close: () => void;
  addVariant: (variantId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  setCart: (cart: DealerCartView | null) => void;
};

const DealerCartContext = createContext<DealerCartContextValue | null>(null);

export function DealerCartProvider({
  children,
  initialCart,
}: {
  children: ReactNode;
  initialCart: DealerCartView | null;
}) {
  const [cart, setCart] = useState<DealerCartView | null>(initialCart);
  const [isOpen, setIsOpen] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const value: DealerCartContextValue = {
    cart,
    itemCount: cart?.itemCount ?? 0,
    totalKurus: cart?.totalKurus ?? 0,
    isOpen,
    isPending,
    lastError,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    addVariant: (variantId, quantity) => {
      setLastError(null);
      setIsOpen(true);
      startTransition(async () => {
        const res = await dealerAddToCartAction(variantId, quantity);
        if (!res.ok) {
          setLastError(res.error);
          return;
        }
        setCart(res.cart);
      });
    },
    removeLine: (lineId) => {
      startTransition(async () => {
        const res = await dealerRemoveLineAction(lineId);
        if (res.ok) setCart(res.cart);
        else setLastError(res.error);
      });
    },
    setQuantity: (lineId, quantity) => {
      startTransition(async () => {
        const res = await dealerSetQtyAction(lineId, quantity);
        if (res.ok) setCart(res.cart);
        else setLastError(res.error);
      });
    },
    setCart,
  };

  return <DealerCartContext.Provider value={value}>{children}</DealerCartContext.Provider>;
}

export function useDealerCart() {
  const context = useContext(DealerCartContext);
  if (!context) throw new Error("useDealerCart must be used within a DealerCartProvider");
  return context;
}
