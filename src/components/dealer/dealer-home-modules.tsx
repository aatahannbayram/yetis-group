"use client";

import { useTransition, useState } from "react";
import { repeatLastCartAction } from "@/features/dealer/actions";
import type { HomeModule } from "@/features/dealer/dealerProfiles";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import Link from "next/link";

export function DealerHomeModules({
  modules,
  creditLimitKurus,
  balanceKurus,
  paymentTermDays,
  openCartLines,
  lastCartSummary,
  dealerTypeLabel,
}: {
  modules: HomeModule[];
  creditLimitKurus: number | null;
  balanceKurus: number;
  paymentTermDays: number | null;
  openCartLines: number;
  lastCartSummary: string | null;
  dealerTypeLabel: string;
}) {
  return (
    <div className="space-y-4 pb-20 sm:pb-6">
      {modules.map((mod) => {
        switch (mod) {
          case "riskBanner":
            return (
              <div
                key={mod}
                className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--skt-critical)_40%,transparent)] bg-[var(--danger-bg)] px-4 py-3 text-[length:var(--panel-font-size)] text-[var(--danger-fg)]"
                role="alert"
              >
                Hesabınız riskli durumda. Yeni sipariş öncesi tahsilat veya limit güncellemesi gerekebilir.
              </div>
            );
          case "onboarding":
            return (
              <section key={mod} className="rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-white p-4">
                <h2 className="font-semibold text-[var(--panel-ink)]">Hoş geldiniz</h2>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                  <li>Firma bilgilerinizi kontrol edin</li>
                  <li>İlk siparişinizi verin veya geçen siparişi tekrarlayın</li>
                  <li>Teslimat bölgenizi doğrulayın</li>
                </ol>
              </section>
            );
          case "winback":
            return (
              <section key={mod} className="rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-white p-4">
                <h2 className="font-semibold">Sizi özledik</h2>
                <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                  Uzun süredir sipariş yok. Size özel fırsatlara göz atın.
                </p>
                <Link href="/bayi/firsatlar" className="mt-2 inline-block font-semibold text-[var(--panel-accent-action)]">
                  Fırsatları gör
                </Link>
              </section>
            );
          case "statusStrip":
            return (
              <StatusStrip
                key={mod}
                creditLimitKurus={creditLimitKurus}
                balanceKurus={balanceKurus}
                paymentTermDays={paymentTermDays}
                openCartLines={openCartLines}
              />
            );
          case "repeatLastOrder":
            return <RepeatLastOrder key={mod} summary={lastCartSummary} />;
          case "savedLists":
            return (
              <section key={mod} className="rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-white p-4">
                <h2 className="font-semibold">Kayıtlı listelerim</h2>
                <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                  Henüz kayıtlı liste yok. Sipariş Ver ekranından oluşturabilirsiniz.
                </p>
              </section>
            );
          case "offers":
            return (
              <section key={mod} className="rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-white p-4">
                <h2 className="font-semibold">Size özel fırsatlar</h2>
                <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                  SKT ve kampanya fırsatları burada kişiselleştirilecek.
                </p>
                <Link href="/bayi/firsatlar" className="mt-2 inline-block font-semibold text-[var(--panel-accent-action)]">
                  Tüm fırsatlar
                </Link>
              </section>
            );
          case "orderTimeline":
            return (
              <section key={mod} className="rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-white p-4">
                <h2 className="font-semibold">Son sipariş durumu</h2>
                <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                  Sipariş akışı bağlandığında canlı zaman çizelgesi burada görünecek.
                </p>
                <Link href="/bayi/siparislerim" className="mt-2 inline-block font-semibold text-[var(--panel-accent-action)]">
                  Siparişlerim
                </Link>
              </section>
            );
          case "monthSummary":
            return (
              <section key={mod} className="rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-white p-4">
                <h2 className="font-semibold">Bu ay özeti</h2>
                <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                  Alınan kg ve tutar sipariş verisiyle doldurulacak.
                </p>
              </section>
            );
          case "menuCost":
            return (
              <section key={mod} className="rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-white p-4">
                <h2 className="font-semibold">Menü maliyeti</h2>
                <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                  Kayıtlı reçetelerin maliyeti fiyat değişince burada uyarı verecek.
                </p>
              </section>
            );
          case "shelfRotation":
            return (
              <section key={mod} className="rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-white p-4">
                <h2 className="font-semibold">Raf rotasyonu</h2>
                <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                  Tükenme hızı ve yeniden sipariş önerileri burada görünecek.
                </p>
              </section>
            );
          case "volumeTier":
            return (
              <section key={mod} className="rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-white p-4">
                <h2 className="font-semibold">Hacim kademesi</h2>
                <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                  Bir üst kademeye kalan kg burada gösterilecek.
                </p>
              </section>
            );
          case "branchOverview":
            return (
              <section key={mod} className="rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-white p-4">
                <h2 className="font-semibold">Şube özeti</h2>
                <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                  Çok şubeli konsolide görünüm burada olacak ({dealerTypeLabel}).
                </p>
              </section>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function StatusStrip({
  creditLimitKurus,
  balanceKurus,
  paymentTermDays,
  openCartLines,
}: {
  creditLimitKurus: number | null;
  balanceKurus: number;
  paymentTermDays: number | null;
  openCartLines: number;
}) {
  const remaining =
    creditLimitKurus != null ? Math.max(0, creditLimitKurus - balanceKurus) : null;
  const pct =
    creditLimitKurus && creditLimitKurus > 0
      ? Math.min(100, Math.round((balanceKurus / creditLimitKurus) * 100))
      : 0;
  const danger = creditLimitKurus != null && balanceKurus > creditLimitKurus * 0.85;

  return (
    <section className="rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-white p-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-caption text-[var(--panel-ink-muted)]">Kalan kredi limiti</p>
          <p className={`text-xl font-bold tabular-nums ${danger ? "text-[var(--skt-critical)]" : "text-[var(--panel-ink)]"}`}>
            {remaining != null ? formatMoney(money(remaining)) : "Tanımsız"}
          </p>
        </div>
        <div className="text-right text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
          <p>Vade: {paymentTermDays != null ? `${paymentTermDays} gün` : "—"}</p>
          <p>Açık sepet: {openCartLines} satır</p>
        </div>
      </div>
      {creditLimitKurus != null ? (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100" aria-hidden>
          <div
            className={`h-full rounded-full ${danger ? "bg-[var(--skt-critical)]" : "bg-[var(--stage-progress)]"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
    </section>
  );
}

function RepeatLastOrder({ summary }: { summary: string | null }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <section className="rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-white p-4">
      <h2 className="font-semibold text-[var(--panel-ink)]">Geçen siparişi tekrarla</h2>
      <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
        {summary ?? "Önceki sepet satırlarını tek tıkla sepete yükleyin."}
      </p>
      <button
        type="button"
        disabled={pending}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-sm)] bg-[var(--panel-accent-action)] px-4 text-[length:var(--panel-font-size)] font-semibold text-white hover:bg-brand-800 disabled:opacity-60 sm:w-auto"
        onClick={() => {
          start(async () => {
            const res = await repeatLastCartAction();
            setMessage(
              res.ok
                ? `${res.lines} satır sepete eklendi`
                : res.error,
            );
          });
        }}
      >
        {pending ? "Yükleniyor…" : "Geçen siparişi tekrarla"}
      </button>
      {message ? (
        <p className="mt-2 text-caption text-[var(--panel-ink-muted)]" role="status">
          {message}
        </p>
      ) : null}
      <Link
        href="/bayi/siparis"
        className="mt-2 block text-center text-caption font-medium text-[var(--panel-accent-action)] sm:text-left"
      >
        Sipariş ekranına git
      </Link>
    </section>
  );
}
