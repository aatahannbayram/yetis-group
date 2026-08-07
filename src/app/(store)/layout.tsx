import { Suspense } from "react";
import { CartProvider } from "@/components/store/cart-context";
import { CartSheet } from "@/components/store/cart-sheet";
import { ConsentProvider } from "@/components/store/consent-provider";
import { CookieBanner } from "@/components/store/cookie-banner";
import { AnalyticsLoader } from "@/components/store/analytics-loader";
import { getPaymentSettings } from "@/infra/db/payment-settings";

async function DeferredCartSheet() {
  const payment = await getPaymentSettings();
  return (
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
  );
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      <CartProvider>
        {children}
        <Suspense fallback={null}>
          <DeferredCartSheet />
        </Suspense>
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
