import { CartProvider } from "@/components/store/cart-context";
import { CartSheet } from "@/components/store/cart-sheet";
import { getPaymentSettings } from "@/infra/db/payment-settings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const payment = await getPaymentSettings();

  return (
    <CartProvider>
      {children}
      <CartSheet
        bankTransfer={
          payment.bankTransferEnabled
            ? {
                bankName: payment.bankName,
                accountHolder: payment.accountHolder,
                iban: payment.iban,
                note: payment.note,
              }
            : null
        }
      />
    </CartProvider>
  );
}
