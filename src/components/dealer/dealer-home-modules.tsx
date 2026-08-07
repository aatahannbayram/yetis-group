"use client";

import { useTransition, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bookmark,
  Building2,
  ChefHat,
  CheckCircle2,
  Clock,
  HeartHandshake,
  RefreshCw,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { repeatLastCartAction } from "@/features/dealer/actions";
import type { HomeModule } from "@/features/dealer/dealerProfiles";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { Reveal } from "@/components/store/reveal";
import { MOTION } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { DealerCard } from "@/components/dealer/dealer-card";

const ModuleCard = DealerCard;

export function DealerHomeModules({
  modules,
  dealerName,
  dealerTypeLabel,
  creditLimitKurus,
  balanceKurus,
  paymentTermDays,
  openCartLines,
  lastCartSummary,
  lastCartThumbnails,
}: {
  modules: HomeModule[];
  dealerName: string;
  dealerTypeLabel: string;
  creditLimitKurus: number | null;
  balanceKurus: number;
  paymentTermDays: number | null;
  openCartLines: number;
  lastCartSummary: string | null;
  lastCartThumbnails: string[];
}) {
  return (
    <div className="space-y-4 pb-24 sm:pb-6">
      <Hero dealerName={dealerName} dealerTypeLabel={dealerTypeLabel} />

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((mod, index) => {
          const delay = Math.min(index, 6) * MOTION.stagger;
          switch (mod) {
            case "riskBanner":
              return (
                <ModuleCard key={mod} icon={AlertTriangle} tone="danger" delay={delay} className="sm:col-span-2">
                  <h2 className="font-semibold text-[var(--danger-text)]">Hesabınız riskli durumda</h2>
                  <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                    Yeni sipariş öncesi tahsilat veya limit güncellemesi gerekebilir.
                  </p>
                  <Link
                    href="/bayi/cari"
                    className="mt-2 inline-flex items-center gap-1 text-caption font-semibold text-[var(--danger-text)] hover:underline"
                  >
                    Cari hesabıma bak <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </ModuleCard>
              );
            case "onboarding":
              return (
                <ModuleCard key={mod} icon={CheckCircle2} delay={delay} className="sm:col-span-2">
                  <h2 className="font-semibold text-[var(--panel-ink)]">Hoş geldiniz</h2>
                  <ol className="mt-3 space-y-2.5">
                    {[
                      "Firma bilgilerinizi kontrol edin",
                      "İlk siparişinizi verin veya geçen siparişi tekrarlayın",
                      "Teslimat bölgenizi doğrulayın",
                    ].map((step, i) => (
                      <li key={step} className="flex items-center gap-2.5 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-solid)] text-[10px] font-bold text-white">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </ModuleCard>
              );
            case "winback":
              return (
                <ModuleCard key={mod} icon={HeartHandshake} delay={delay}>
                  <h2 className="font-semibold text-[var(--panel-ink)]">Sizi özledik</h2>
                  <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                    Uzun süredir sipariş yok. Size özel fırsatlara göz atın.
                  </p>
                  <Link
                    href="/bayi/firsatlar"
                    className="mt-2 inline-flex items-center gap-1 text-caption font-semibold text-[var(--primary-text)] hover:underline"
                  >
                    Fırsatları gör <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </ModuleCard>
              );
            case "statusStrip":
              return (
                <StatusStrip
                  key={mod}
                  delay={delay}
                  creditLimitKurus={creditLimitKurus}
                  balanceKurus={balanceKurus}
                  paymentTermDays={paymentTermDays}
                  openCartLines={openCartLines}
                />
              );
            case "repeatLastOrder":
              return (
                <RepeatLastOrder
                  key={mod}
                  delay={delay}
                  summary={lastCartSummary}
                  thumbnails={lastCartThumbnails}
                />
              );
            case "savedLists":
              return (
                <ModuleCard key={mod} icon={Bookmark} delay={delay}>
                  <h2 className="font-semibold text-[var(--panel-ink)]">Kayıtlı listelerim</h2>
                  <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                    Henüz kayıtlı liste yok. Sipariş Ver ekranından oluşturabilirsiniz.
                  </p>
                </ModuleCard>
              );
            case "offers":
              return (
                <ModuleCard key={mod} icon={Sparkles} delay={delay}>
                  <h2 className="font-semibold text-[var(--panel-ink)]">Size özel fırsatlar</h2>
                  <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                    SKT ve kampanya fırsatları burada kişiselleştirilecek.
                  </p>
                  <Link
                    href="/bayi/firsatlar"
                    className="mt-2 inline-flex items-center gap-1 text-caption font-semibold text-[var(--primary-text)] hover:underline"
                  >
                    Tüm fırsatlar <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </ModuleCard>
              );
            case "orderTimeline":
              return (
                <ModuleCard key={mod} icon={Clock} delay={delay}>
                  <h2 className="font-semibold text-[var(--panel-ink)]">Son sipariş durumu</h2>
                  <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                    Sipariş akışı bağlandığında canlı zaman çizelgesi burada görünecek.
                  </p>
                  <Link
                    href="/bayi/siparislerim"
                    className="mt-2 inline-flex items-center gap-1 text-caption font-semibold text-[var(--primary-text)] hover:underline"
                  >
                    Siparişlerim <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </ModuleCard>
              );
            case "monthSummary":
              return (
                <ModuleCard key={mod} icon={BarChart3} delay={delay}>
                  <h2 className="font-semibold text-[var(--panel-ink)]">Bu ay özeti</h2>
                  <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                    Alınan kg ve tutar sipariş verisiyle doldurulacak.
                  </p>
                </ModuleCard>
              );
            case "menuCost":
              return (
                <ModuleCard key={mod} icon={ChefHat} delay={delay}>
                  <h2 className="font-semibold text-[var(--panel-ink)]">Menü maliyeti</h2>
                  <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                    Kayıtlı reçetelerin maliyeti fiyat değişince burada uyarı verecek.
                  </p>
                </ModuleCard>
              );
            case "shelfRotation":
              return (
                <ModuleCard key={mod} icon={RefreshCw} delay={delay}>
                  <h2 className="font-semibold text-[var(--panel-ink)]">Raf rotasyonu</h2>
                  <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                    Tükenme hızı ve yeniden sipariş önerileri burada görünecek.
                  </p>
                </ModuleCard>
              );
            case "volumeTier":
              return (
                <ModuleCard key={mod} icon={TrendingUp} delay={delay}>
                  <h2 className="font-semibold text-[var(--panel-ink)]">Hacim kademesi</h2>
                  <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                    Bir üst kademeye kalan kg burada gösterilecek.
                  </p>
                </ModuleCard>
              );
            case "branchOverview":
              return (
                <ModuleCard key={mod} icon={Building2} delay={delay}>
                  <h2 className="font-semibold text-[var(--panel-ink)]">Şube özeti</h2>
                  <p className="mt-1 text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
                    Çok şubeli konsolide görünüm burada olacak ({dealerTypeLabel}).
                  </p>
                </ModuleCard>
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}

function Hero({ dealerName, dealerTypeLabel }: { dealerName: string; dealerTypeLabel: string }) {
  return (
    <Reveal>
      <section className="relative overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]">
        <div className="absolute inset-0">
          <Image
            src="/scenes/delivery.jpg"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 1152px, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,color-mix(in_srgb,var(--brand-900)_92%,transparent)_0%,color-mix(in_srgb,var(--brand-700)_78%,transparent)_45%,color-mix(in_srgb,var(--brand-600)_35%,transparent)_100%)]" />
        </div>
        <div className="relative px-5 py-7 sm:px-8 sm:py-9">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
            {dealerTypeLabel}
          </span>
          <h1 className="mt-3 max-w-md text-2xl font-semibold text-white sm:text-3xl">
            Hoş geldiniz, {dealerName}
          </h1>
          <p className="mt-2 max-w-sm text-[length:var(--panel-font-size)] text-white/80">
            Siparişlerinizi, cari hesabınızı ve fırsatlarınızı tek yerden yönetin.
          </p>
        </div>
      </section>
    </Reveal>
  );
}

function StatusStrip({
  creditLimitKurus,
  balanceKurus,
  paymentTermDays,
  openCartLines,
  delay,
}: {
  creditLimitKurus: number | null;
  balanceKurus: number;
  paymentTermDays: number | null;
  openCartLines: number;
  delay: number;
}) {
  const remaining =
    creditLimitKurus != null ? Math.max(0, creditLimitKurus - balanceKurus) : null;
  const pct =
    creditLimitKurus && creditLimitKurus > 0
      ? Math.min(100, Math.round((balanceKurus / creditLimitKurus) * 100))
      : 0;
  const over = creditLimitKurus != null && pct >= 85;
  const barColor =
    pct >= 85
      ? "bg-[var(--danger-solid)]"
      : pct >= 60
        ? "bg-[var(--warning-solid)]"
        : "bg-[var(--success-solid)]";

  return (
    <ModuleCard icon={Wallet} tone={over ? "danger" : "neutral"} delay={delay} className="sm:col-span-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-caption text-[var(--panel-ink-muted)]">Kalan kredi limiti</p>
          <p
            className={cn(
              "text-2xl font-bold tabular-nums",
              over ? "text-[var(--danger-text)]" : "text-[var(--panel-ink)]",
            )}
          >
            {remaining != null ? formatMoney(money(remaining)) : "Tanımsız"}
          </p>
        </div>
        <div className="text-right text-[length:var(--panel-font-size)] text-[var(--panel-ink-muted)]">
          <p>Vade: {paymentTermDays != null ? `${paymentTermDays} gün` : "-"}</p>
          <p>Açık sepet: {openCartLines} satır</p>
        </div>
      </div>
      {creditLimitKurus != null ? (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]" aria-hidden>
          <div
            className={cn("h-full rounded-full transition-[width] duration-700 ease-out", barColor)}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
    </ModuleCard>
  );
}

function RepeatLastOrder({
  summary,
  thumbnails,
  delay,
}: {
  summary: string | null;
  thumbnails: string[];
  delay: number;
}) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <ModuleCard icon={RotateCcw} tone="feature" delay={delay}>
      <h2 className="font-semibold text-white">Geçen siparişi tekrarla</h2>
      {thumbnails.length > 0 ? (
        <div className="mt-2 flex items-center -space-x-2.5">
          {thumbnails.map((url, i) => (
            <span
              key={url}
              className="relative size-9 overflow-hidden rounded-full border-2 border-white/70 shadow-[var(--shadow-sm)]"
              style={{ zIndex: thumbnails.length - i }}
            >
              <Image src={url} alt="" fill className="object-cover" sizes="36px" />
            </span>
          ))}
        </div>
      ) : null}
      <p className="mt-2 text-[length:var(--panel-font-size)] text-white/75">
        {summary ?? "Önceki sepet satırlarını tek tıkla sepete yükleyin."}
      </p>
      <button
        type="button"
        disabled={pending}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-white px-4 text-[length:var(--panel-font-size)] font-semibold text-[var(--brand-800)] shadow-[var(--shadow-sm)] transition-[transform,opacity] duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 sm:w-auto"
        onClick={() => {
          start(async () => {
            const res = await repeatLastCartAction();
            setMessage(res.ok ? `${res.lines} satır sepete eklendi` : res.error);
          });
        }}
      >
        <RotateCcw className={cn("size-4", pending && "animate-spin")} aria-hidden />
        {pending ? "Yükleniyor…" : "Geçen siparişi tekrarla"}
      </button>
      {message ? (
        <p className="mt-2 text-caption text-white/75" role="status">
          {message}
        </p>
      ) : null}
      <Link
        href="/bayi/siparis"
        className="mt-2 inline-flex items-center gap-1 text-caption font-medium text-white underline-offset-2 hover:underline"
      >
        Sipariş ekranına git <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </ModuleCard>
  );
}
