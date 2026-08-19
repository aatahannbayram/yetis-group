import { ConsentProvider } from "@/components/store/consent-provider";
import { CookieBanner } from "@/components/store/cookie-banner";
import { AnalyticsLoader } from "@/components/store/analytics-loader";
import { RouteProgress } from "@/components/motion/motion-shell";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      <RouteProgress />
      {children}
      <CookieBanner />
      <AnalyticsLoader
        gtmId={process.env.NEXT_PUBLIC_GTM_ID}
        ga4Id={process.env.NEXT_PUBLIC_GA4_ID}
        metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID}
      />
    </ConsentProvider>
  );
}
