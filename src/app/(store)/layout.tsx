import { CartProvider } from "@/components/store/cart-context";
import { CartSheet } from "@/components/store/cart-sheet";
import { ConsentProvider } from "@/components/store/consent-provider";
import { CookieBanner } from "@/components/store/cookie-banner";
import { AnalyticsLoader } from "@/components/store/analytics-loader";
import { getPaymentSettings } from "@/infra/db/payment-settings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const payment = await getPaymentSettings();

  return (
    <ConsentProvider>
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
        <CookieBanner />
        <AnalyticsLoader
          gtmId={process.env.NEXT_PUBLIC_GTM_ID}
          ga4Id={process.env.NEXT_PUBLIC_GA4_ID}
          metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID}
        />
      </CartProvider>
    </ConsentProvider>
  );
}
