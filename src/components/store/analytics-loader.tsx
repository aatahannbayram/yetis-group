"use client";

import { useEffect } from "react";
import { useConsent } from "@/components/store/consent-provider";
import { loadAnalytics } from "@/lib/analytics/adapter";

export function AnalyticsLoader({
  gtmId,
  ga4Id,
  metaPixelId,
}: {
  gtmId?: string;
  ga4Id?: string;
  metaPixelId?: string;
}) {
  const { consent, decided } = useConsent();

  useEffect(() => {
    if (!decided) return;
    if (!consent.analytics && !consent.marketing) return;
    loadAnalytics(
      { gtmId, ga4Id, metaPixelId },
      {
        analytics: consent.analytics,
        marketing: consent.marketing,
      },
    );
  }, [consent.analytics, consent.marketing, decided, gtmId, ga4Id, metaPixelId]);

  return null;
}
