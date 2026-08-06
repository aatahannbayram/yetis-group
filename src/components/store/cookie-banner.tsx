"use client";

import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { useConsent } from "@/components/store/consent-provider";
import { cn } from "@/lib/utils";

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
      <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
        <button
          type="button"
          aria-label="Kapat"
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={closePreferences}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-prefs-title"
          className="relative z-10 w-full max-w-md rounded-t-2xl border border-[color:var(--mkt-border)] bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p id="cookie-prefs-title" className="text-[1.125rem] font-semibold tracking-[-0.02em] text-mkt-ink">
                Çerez tercihleri
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-mkt-ink-muted">
                Zorunlu çerezler oturum ve sepet için gerekir. Diğerleri yalnızca onayınızla yüklenir.
              </p>
            </div>
            <button
              type="button"
              onClick={closePreferences}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-mkt-ink-muted hover:bg-mkt-card-muted hover:text-mkt-ink"
              aria-label="Kapat"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <form
            className="mt-5 space-y-2"
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
            <PrefRow
              title="Zorunlu"
              description="Oturum, sepet ve güvenlik"
              checked
              disabled
            />
            <PrefRow
              title="Analitik"
              description="GA4 / GTM — kullanım ölçümü"
              name="analytics"
              defaultChecked={consent.analytics}
            />
            <PrefRow
              title="Pazarlama"
              description="Meta Pixel — kampanya ölçümü"
              name="marketing"
              defaultChecked={consent.marketing}
            />

            <div className="flex flex-col gap-2 pt-4 sm:flex-row-reverse">
              <button
                type="submit"
                className="mkt-pill h-11 flex-1 bg-mkt-accent text-[14px] font-semibold text-mkt-accent-ink hover:brightness-105 sm:flex-none sm:px-6"
              >
                Tercihleri kaydet
              </button>
              <button
                type="button"
                onClick={closePreferences}
                className="mkt-pill h-11 flex-1 border border-[color:var(--mkt-border)] text-[14px] font-semibold text-mkt-ink hover:bg-mkt-card-muted sm:flex-none sm:px-5"
              >
                Vazgeç
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5"
      role="region"
      aria-label="Çerez bildirimi"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl overflow-hidden rounded-2xl border border-[color:var(--mkt-border)] bg-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
          <div className="flex min-w-0 flex-1 gap-3">
            <span className="mt-0.5 hidden size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-50)] text-mkt-green-text sm:flex">
              <Cookie className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold tracking-[-0.015em] text-mkt-ink">
                Çerez kullanımı
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-mkt-ink-muted sm:text-[14px]">
                Zorunlu çerezler siteyi çalıştırır. Analitik ve pazarlama çerezleri yalnızca onayınızla
                açılır.{" "}
                <Link
                  href="/yasal/cerez-politikasi"
                  className="font-semibold text-mkt-green-text underline-offset-2 hover:underline"
                >
                  Çerez politikası
                </Link>
              </p>
            </div>
          </div>

          {/* Order: reject → preferences → accept (primary last / right) */}
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={acceptAll}
              className="mkt-pill order-1 h-11 w-full bg-mkt-accent px-5 text-[14px] font-semibold text-mkt-accent-ink hover:brightness-105 sm:order-3 sm:w-auto"
            >
              Tümünü kabul et
            </button>
            <button
              type="button"
              onClick={rejectOptional}
              className="mkt-pill order-2 h-11 w-full border border-[color:var(--mkt-border)] px-4 text-[14px] font-semibold text-mkt-ink hover:bg-mkt-card-muted sm:order-1 sm:w-auto"
            >
              Yalnızca zorunlu
            </button>
            <button
              type="button"
              onClick={openPreferences}
              className="mkt-pill order-3 h-11 w-full text-[14px] font-semibold text-mkt-ink-muted hover:bg-mkt-card-muted hover:text-mkt-ink sm:order-2 sm:w-auto sm:px-4"
            >
              Tercihler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrefRow({
  title,
  description,
  name,
  checked,
  defaultChecked,
  disabled,
}: {
  title: string;
  description: string;
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[color:var(--mkt-border)] px-4 py-3",
        disabled && "cursor-default bg-mkt-card-muted/60",
      )}
    >
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold text-mkt-ink">{title}</span>
        <span className="mt-0.5 block text-[12px] text-mkt-ink-muted">{description}</span>
      </span>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="size-4 shrink-0 rounded accent-[var(--mkt-accent)]"
      />
    </label>
  );
}
