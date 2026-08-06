"use client";

import Link from "next/link";
import { useConsent } from "@/components/store/consent-provider";

export function CookieBanner() {
  const {
    decided,
    acceptAll,
    rejectOptional,
    openPreferences,
    preferencesOpen,
    closePreferences,
    consent,
    save,
  } = useConsent();

  if (decided && !preferencesOpen) return null;

  if (preferencesOpen) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6">
        <div className="mx-auto max-w-lg rounded-[1.25rem] border border-[color:var(--mkt-border)] bg-white p-5 shadow-lg">
          <p className="text-[1.05rem] font-medium text-mkt-ink">Çerez tercihleri</p>
          <p className="mkt-body mt-2 text-[13px]">
            Zorunlu çerezler oturum ve sepet için gereklidir. Analitik ve pazarlama çerezleri yalnızca
            onayınızla yüklenir.
          </p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save({
                analytics: fd.get("analytics") === "on",
                marketing: fd.get("marketing") === "on",
              });
              closePreferences();
            }}
          >
            <label className="flex items-center justify-between gap-3 text-[14px] text-mkt-ink">
              <span>Zorunlu</span>
              <input type="checkbox" checked disabled className="size-4" />
            </label>
            <label className="flex items-center justify-between gap-3 text-[14px] text-mkt-ink">
              <span>Analitik (GA4 / GTM)</span>
              <input
                type="checkbox"
                name="analytics"
                defaultChecked={consent.analytics}
                className="size-4"
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-[14px] text-mkt-ink">
              <span>Pazarlama (Meta Pixel)</span>
              <input
                type="checkbox"
                name="marketing"
                defaultChecked={consent.marketing}
                className="size-4"
              />
            </label>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="submit"
                className="mkt-pill bg-mkt-accent px-4 py-2 text-[13px] font-medium text-mkt-accent-ink"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={closePreferences}
                className="mkt-pill border border-[color:var(--mkt-border)] px-4 py-2 text-[13px]"
              >
                Kapat
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-[1.25rem] border border-[color:var(--mkt-border)] bg-white p-5 shadow-lg sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[1.05rem] font-medium text-mkt-ink">Çerezler</p>
          <p className="mkt-body mt-1 text-[13px]">
            Deneyimi ölçmek için analitik çerezler kullanabiliriz. Rıza vermeden izleme yüklenmez.{" "}
            <Link href="/yasal/cerez-politikasi" className="text-mkt-green-text underline-offset-2 hover:underline">
              Çerez politikası
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={rejectOptional}
            className="mkt-pill border border-[color:var(--mkt-border)] px-4 py-2 text-[13px] text-mkt-ink"
          >
            Yalnızca zorunlu
          </button>
          <button
            type="button"
            onClick={openPreferences}
            className="mkt-pill border border-[color:var(--mkt-border)] px-4 py-2 text-[13px] text-mkt-ink"
          >
            Tercihler
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="mkt-pill bg-mkt-accent px-4 py-2 text-[13px] font-medium text-mkt-accent-ink"
          >
            Tümünü kabul et
          </button>
        </div>
      </div>
    </div>
  );
}
