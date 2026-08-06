"use client";

/**
 * Consent-gated analytics adapter.
 * Scripts load only after the matching consent category is true.
 * Ecommerce helpers no-op without analytics consent.
 */

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
    fbq?: (...args: unknown[]) => void;
  }
}

export type AnalyticsIds = {
  gtmId?: string;
  ga4Id?: string;
  metaPixelId?: string;
};

let loaded = { gtm: false, ga4: false, meta: false };

function pushDataLayer(...args: unknown[]) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(args);
}

export function loadAnalytics(ids: AnalyticsIds, consent: { analytics: boolean; marketing: boolean }) {
  if (typeof window === "undefined") return;

  if (consent.analytics) {
    if (ids.gtmId && !loaded.gtm) {
      loaded.gtm = true;
      window.dataLayer = window.dataLayer ?? [];
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(ids.gtmId)}`;
      document.head.appendChild(s);
    }
    if (ids.ga4Id && !loaded.ga4) {
      loaded.ga4 = true;
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ids.ga4Id)}`;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer ?? [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", ids.ga4Id, { anonymize_ip: true });
    }
  }

  if (consent.marketing && ids.metaPixelId && !loaded.meta) {
    loaded.meta = true;
    const w = window as Window & { _fbq?: unknown };
    if (!w.fbq) {
      const n = function (...args: unknown[]) {
        const fbq = w.fbq as ((...a: unknown[]) => void) & {
          callMethod?: (...a: unknown[]) => void;
          queue: unknown[];
        };
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue.push(args);
      } as ((...args: unknown[]) => void) & {
        push: unknown;
        loaded: boolean;
        version: string;
        queue: unknown[];
        callMethod?: (...args: unknown[]) => void;
      };
      w.fbq = n;
      if (!w._fbq) w._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
    }
    window.fbq?.("init", ids.metaPixelId);
    window.fbq?.("track", "PageView");
  }
}

export function trackEcommerce(
  event: "view_item" | "add_to_cart" | "begin_checkout" | "purchase",
  payload: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  if (!window.gtag && !window.dataLayer) return;

  const ecommerce = {
    currency: "TRY",
    ...payload,
  };

  if (window.gtag) {
    window.gtag("event", event, ecommerce);
  } else {
    pushDataLayer({ event, ecommerce });
  }

  if (window.fbq) {
    const map: Record<string, string> = {
      view_item: "ViewContent",
      add_to_cart: "AddToCart",
      begin_checkout: "InitiateCheckout",
      purchase: "Purchase",
    };
    window.fbq("track", map[event] ?? event, ecommerce);
  }
}

export function canTrackAnalytics(): boolean {
  try {
    const raw = window.localStorage.getItem("yg_consent_v1");
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { analytics?: boolean };
    return Boolean(parsed.analytics);
  } catch {
    return false;
  }
}
