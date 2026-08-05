import { CartProvider } from "@/components/store/cart-context";
import { CartSheet } from "@/components/store/cart-sheet";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartSheet />
    </CartProvider>
  );
}
