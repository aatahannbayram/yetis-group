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
  CalendarDays,
  ChefHat,
  CheckCircle2,
  Clock,
  HeartHandshake,
  RefreshCw,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { repeatLastCartAction } from "@/features/dealer/actions";
import type { HomeModule } from "@/features/dealer/dealerProfiles";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { Reveal } from "@/components/store/reveal";
import { MOTION } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { WeeklyAnnouncements } from "@/components/store/weekly-announcements";
import type { SiteAnnouncement } from "@/domain/campaigns/live";

const MODULE_SCENE: Partial<Record<HomeModule, string>> = {
  savedLists: "/hero-dairy-2.jpg",
  offers: "/scenes/offer-board-2.jpg",
  orderTimeline: "/scenes/truck-close.jpg",
  monthSummary: "/scenes/warehouse.jpg",
  shelfRotation: "/scenes/story-field.jpg",
  menuCost: "/scenes/kitchen.jpg",
  volumeTier: "/scenes/cold-chain.jpg",
  branchOverview: "/scenes/how-sales-2.jpg",
  winback: "/scenes/whatsapp-desk.jpg",
  repeatLastOrder: "/scenes/promo-beyaz-counter.jpg",
};

const FULL_WIDTH: HomeModule[] = [
  "riskBanner",
  "onboarding",
  "statusStrip",
  "repeatLastOrder",
];

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
  announcements = [],
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
  announcements?: SiteAnnouncement[];
}) {
  const wide = modules.filter((m) => FULL_WIDTH.includes(m));
  const tiles = modules.filter((m) => !FULL_WIDTH.includes(m));

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      <Hero dealerName={dealerName} dealerTypeLabel={dealerTypeLabel} />
      <WeeklyAnnouncements items={announcements} variant="dealer" />

      <div className="space-y-4">
        {wide.map((mod, index) => {
          const delay = Math.min(index, 4) * MOTION.stagger;
          return (
            <WideModule
              key={mod}
              mod={mod}
              delay={delay}
              dealerTypeLabel={dealerTypeLabel}
              creditLimitKurus={creditLimitKurus}
              balanceKurus={balanceKurus}
              paymentTermDays={paymentTermDays}
              openCartLines={openCartLines}
              lastCartSummary={lastCartSummary}
              lastCartThumbnails={lastCartThumbnails}
            />
          );
        })}
      </div>

      {tiles.length > 0 ? (
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((mod, index) => (
            <TileModule
              key={mod}
              mod={mod}
              delay={Math.min(index + 2, 8) * MOTION.stagger}
              dealerTypeLabel={dealerTypeLabel}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function WideModule({
  mod,
  delay,
  dealerTypeLabel,
  creditLimitKurus,
  balanceKurus,
  paymentTermDays,
  openCartLines,
  lastCartSummary,
  lastCartThumbnails,
}: {
  mod: HomeModule;
  delay: number;
  dealerTypeLabel: string;
  creditLimitKurus: number | null;
  balanceKurus: number;
  paymentTermDays: number | null;
  openCartLines: number;
  lastCartSummary: string | null;
  lastCartThumbnails: string[];
}) {
  switch (mod) {
    case "riskBanner":
      return (
        <AlertBanner delay={delay} />
      );
    case "onboarding":
      return <OnboardingCard delay={delay} />;
    case "statusStrip":
      return (
        <StatusStrip
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
          delay={delay}
          summary={lastCartSummary}
          thumbnails={lastCartThumbnails}
        />
      );
    default:
      return (
        <TileModule mod={mod} delay={delay} dealerTypeLabel={dealerTypeLabel} />
      );
  }
}

function TileModule({
  mod,
  delay,
  dealerTypeLabel,
}: {
  mod: HomeModule;
  delay: number;
  dealerTypeLabel: string;
}) {
  const scene = MODULE_SCENE[mod];

  switch (mod) {
    case "savedLists":
      return (
        <SceneTile
          delay={delay}
          icon={Bookmark}
          title="Kayıtlı listelerim"
          body="Henüz kayıtlı liste yok. Sipariş ekranından oluşturabilirsiniz."
          href="/bayi/siparis"
          cta="Siparişe git"
          scene={scene}
        />
      );
    case "offers":
      return (
        <SceneTile
          delay={delay}
          icon={Sparkles}
          title="Size özel fırsatlar"
          body="SKT ve kampanya fırsatları burada kişiselleştirilecek."
          href="/bayi/firsatlar"
          cta="Tüm fırsatlar"
          scene={scene}
          accent
        />
      );
    case "orderTimeline":
      return (
        <SceneTile
          delay={delay}
          icon={Clock}
          title="Son sipariş durumu"
          body="Sipariş akışı bağlandığında canlı zaman çizelgesi burada görünecek."
          href="/bayi/siparislerim"
          cta="Siparişlerim"
          scene={scene}
        />
      );
    case "monthSummary":
      return (
        <SceneTile
          delay={delay}
          icon={BarChart3}
          title="Bu ay özeti"
          body="Alınan kg ve tutar sipariş verisiyle doldurulacak."
          scene={scene}
        />
      );
    case "menuCost":
      return (
        <SceneTile
          delay={delay}
          icon={ChefHat}
          title="Menü maliyeti"
          body="Kayıtlı reçetelerin maliyeti fiyat değişince burada uyarı verecek."
          scene={scene}
        />
      );
    case "shelfRotation":
      return (
        <SceneTile
          delay={delay}
          icon={RefreshCw}
          title="Raf rotasyonu"
          body="Tükenme hızı ve yeniden sipariş önerileri burada görünecek."
          scene={scene}
        />
      );
    case "volumeTier":
      return (
        <SceneTile
          delay={delay}
          icon={TrendingUp}
          title="Hacim kademesi"
          body="Bir üst kademeye kalan kg burada gösterilecek."
          scene={scene}
        />
      );
    case "branchOverview":
      return (
        <SceneTile
          delay={delay}
          icon={Building2}
          title="Şube özeti"
          body={`Çok şubeli konsolide görünüm burada olacak (${dealerTypeLabel}).`}
          scene={scene}
        />
      );
    case "winback":
      return (
        <SceneTile
          delay={delay}
          icon={HeartHandshake}
          title="Sizi özledik"
          body="Uzun süredir sipariş yok. Size özel fırsatlara göz atın."
          href="/bayi/firsatlar"
          cta="Fırsatları gör"
          scene={scene}
          accent
        />
      );
    default:
      return null;
  }
}

function Hero({ dealerName, dealerTypeLabel }: { dealerName: string; dealerTypeLabel: string }) {
  return (
    <Reveal>
      <section className="relative overflow-hidden rounded-[1.35rem] shadow-[0_16px_40px_-20px_rgb(12_40_28/0.55)]">
        <div className="absolute inset-0">
          <Image
            src="/scenes/yetis-grup-bayi-welcome.jpg"
            alt=""
            fill
            priority
            className="object-cover object-[center_40%] scale-105"
            sizes="(min-width: 1024px) 1152px, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgb(8_32_22/0.92)_0%,rgb(12_70_45/0.78)_52%,rgb(16_80_50/0.35)_100%)]" />
        </div>
        <div className="relative flex flex-col gap-6 px-5 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-10">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-[var(--panel-surface)]/12 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-white uppercase ring-1 ring-white/20 backdrop-blur-sm">
              {dealerTypeLabel}
            </span>
            <h1 className="mt-4 max-w-lg text-[1.85rem] font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Hoş geldiniz, {dealerName}
            </h1>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-white/78">
              Sipariş, cari ve fırsatlar tek yerde. Bugünkü işi buradan yürütün.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link
              href="/bayi/siparis"
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-5 text-[14px] font-semibold text-[var(--brand-800)] shadow-sm hover:bg-white/92"
            >
              <ShoppingCart className="size-4" aria-hidden />
              Sipariş ver
            </Link>
            <Link
              href="/bayi/cari"
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[var(--panel-surface)]/12 px-5 text-[14px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm hover:bg-[var(--panel-surface)]/18"
            >
              <Wallet className="size-4" aria-hidden />
              Cari
            </Link>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function SceneTile({
  icon: Icon,
  title,
  body,
  href,
  cta,
  scene,
  delay,
  accent = false,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  href?: string;
  cta?: string;
  scene?: string;
  delay: number;
  accent?: boolean;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <section
        className={cn(
          "group relative flex h-full min-h-[176px] flex-col overflow-hidden rounded-2xl border border-[var(--panel-border)] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
          accent ? "ring-1 ring-[color-mix(in_srgb,var(--brand-600)_35%,transparent)]" : "",
        )}
      >
        {scene ? (
          <div className="absolute inset-0" aria-hidden>
            <Image
              src={scene}
              alt=""
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(28,25,23,0.88)_0%,rgba(28,25,23,0.72)_42%,rgba(28,25,23,0.55)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--brand-600)_28%,transparent),transparent_55%)]" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[var(--panel-surface)]" aria-hidden />
        )}

        <div className="relative flex h-full flex-col p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--panel-surface)]/12 text-white ring-1 ring-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
              <Icon className="size-4.5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold tracking-tight text-white">{title}</h2>
              <p className="mt-1.5 text-[length:var(--panel-font-size)] leading-relaxed text-white/72">
                {body}
              </p>
            </div>
          </div>

          {href && cta ? (
            <Link
              href={href}
              className="mt-auto inline-flex items-center gap-1.5 pt-4 text-caption font-semibold text-white/95 transition-colors hover:text-white"
            >
              {cta}
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          ) : (
            <div className="mt-auto pt-4" aria-hidden />
          )}
        </div>
      </section>
    </Reveal>
  );
}

function AlertBanner({ delay }: { delay: number }) {
  return (
    <Reveal delay={delay}>
      <section className="relative overflow-hidden rounded-2xl border border-[var(--panel-border)] border-l-[3px] border-l-[var(--danger-solid)] bg-[var(--panel-surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--danger-subtle)] text-[var(--danger-solid)]">
            <AlertTriangle className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
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
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function OnboardingCard({ delay }: { delay: number }) {
  const steps = [
    {
      n: 1,
      title: "Firma",
      body: "Unvan ve iletişim bilgilerini kontrol edin",
      href: "/bayi/firmam",
      icon: Building2,
    },
    {
      n: 2,
      title: "İlk sipariş",
      body: "Katalogdan ekleyin veya geçen siparişi tekrarlayın",
      href: "/bayi/siparis",
      icon: ShoppingCart,
    },
    {
      n: 3,
      title: "Teslimat",
      body: "Bölge ve gününüzün açık olduğunu doğrulayın",
      href: "/bayi/teslimat",
      icon: Truck,
    },
  ] as const;
  const done = 0;
  const total = steps.length;
  const progress = Math.round((done / total) * 100);

  return (
    <Reveal delay={delay}>
      <section className="overflow-hidden rounded-[1.35rem] border border-[var(--panel-border)] bg-[var(--panel-surface)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--panel-border)] bg-[linear-gradient(135deg,var(--primary-subtle),transparent_60%)] px-5 pt-4 pb-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-[var(--panel-surface)] text-[var(--primary-text)] shadow-[var(--shadow-sm)] ring-1 ring-[var(--panel-border)]">
                <CheckCircle2 className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--panel-ink)]">
                  Kuruluma devam
                </h2>
                <p className="mt-0.5 text-[13px] text-[var(--panel-ink-muted)]">
                  Üç kısa adım, sonra sipariş akışı açılır
                </p>
              </div>
            </div>
            <span className="rounded-full bg-[var(--panel-surface)] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[var(--panel-ink-muted)] ring-1 ring-[var(--panel-border)]">
              {done} / {total}
            </span>
          </div>
          <div
            className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Kurulum ilerlemesi"
          >
            <div
              className="h-full rounded-full bg-[var(--primary-solid)] transition-[width] duration-500"
              style={{ width: `${Math.max(progress, 8)}%` }}
            />
          </div>
        </div>

        <ol className="grid gap-0 sm:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li
                key={step.href}
                className={cn(
                  "relative",
                  i < steps.length - 1 &&
                    "border-b border-[var(--panel-border)] sm:border-r sm:border-b-0",
                )}
              >
                <Link
                  href={step.href}
                  className="group flex h-full flex-col gap-3.5 p-5 transition-colors hover:bg-[var(--surface-2)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="relative flex size-11 items-center justify-center rounded-2xl bg-[var(--primary-subtle)] text-[var(--primary-text)] ring-1 ring-[var(--primary-solid)]/15 transition-transform duration-200 group-hover:scale-[1.04]">
                      <Icon className="size-5" strokeWidth={1.55} aria-hidden />
                      <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[var(--brand-700)] text-[10px] font-bold text-white shadow-sm dark:bg-[var(--primary-solid)] dark:text-[#06231a]">
                        {step.n}
                      </span>
                    </span>
                    <span className="mt-1 inline-flex size-7 items-center justify-center rounded-full text-[var(--panel-ink-muted)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100">
                      <ArrowRight className="size-4" aria-hidden />
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold tracking-[-0.015em] text-[var(--panel-ink)] group-hover:text-[var(--primary-text)]">
                      {step.title}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--panel-ink-muted)]">
                      {step.body}
                    </p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--primary-text)]">
                    Adıma git
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
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
  const usedPct =
    creditLimitKurus && creditLimitKurus > 0
      ? Math.min(100, Math.round((balanceKurus / creditLimitKurus) * 100))
      : 0;
  const remainingPct =
    creditLimitKurus && creditLimitKurus > 0 && remaining != null
      ? Math.min(100, Math.round((remaining / creditLimitKurus) * 100))
      : 0;
  const over = creditLimitKurus != null && remainingPct <= 15;
  const barColor =
    remainingPct <= 15
      ? "bg-[var(--danger-solid)]"
      : remainingPct <= 40
        ? "bg-[var(--warning-solid)]"
        : "bg-[var(--success-solid)]";

  return (
    <Reveal delay={delay}>
      <section className="rounded-[1.35rem] border border-[var(--panel-border)] bg-[var(--panel-surface)] p-2 shadow-[var(--shadow-sm)] sm:p-2.5">
        <div className="grid gap-2 sm:grid-cols-3">
          <div
            className={cn(
              "rounded-[1.1rem] p-4 ring-1 ring-[var(--panel-border)]/80 sm:p-5",
              over
                ? "bg-[linear-gradient(180deg,var(--danger-subtle),var(--panel-surface)_72%)]"
                : "bg-[var(--surface-2)]",
            )}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl ring-1",
                  over
                    ? "bg-[var(--danger-subtle)] text-[var(--danger-text)] ring-[var(--danger-solid)]/20"
                    : "bg-[var(--panel-surface)] text-[var(--panel-ink-muted)] ring-[var(--panel-border)]",
                )}
              >
                <Wallet className="size-4" strokeWidth={1.6} aria-hidden />
              </span>
              <p className="text-[12px] font-semibold tracking-wide text-[var(--panel-ink-muted)] uppercase">
                Kalan kredi
              </p>
            </div>
            <p
              className={cn(
                "mt-3 text-[1.85rem] font-bold tracking-[-0.03em] tabular-nums",
                over ? "text-[var(--danger-text)]" : "text-[var(--panel-ink)]",
              )}
            >
              {remaining != null ? formatMoney(money(remaining)) : "Tanımsız"}
            </p>
            {creditLimitKurus != null ? (
              <div
                className="mt-3.5 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]"
                role="progressbar"
                aria-valuenow={remainingPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Kalan kredi oranı"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-700 ease-out",
                    barColor,
                  )}
                  style={{ width: `${remainingPct}%` }}
                />
              </div>
            ) : null}
            {over ? (
              <p className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-[var(--danger-subtle)] px-2 py-0.5 text-[11px] font-semibold text-[var(--danger-text)] ring-1 ring-[var(--danger-solid)]/15">
                <AlertTriangle className="size-3" aria-hidden />
                Limit doldu
              </p>
            ) : creditLimitKurus != null ? (
              <p className="mt-2.5 text-[12px] text-[var(--panel-ink-muted)]">
                Kullanılan %{usedPct}
              </p>
            ) : null}
          </div>

          <div className="rounded-[1.1rem] bg-[var(--surface-2)] p-4 ring-1 ring-[var(--panel-border)]/80 sm:p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--panel-surface)] text-[var(--panel-ink-muted)] ring-1 ring-[var(--panel-border)]">
                <CalendarDays className="size-4" strokeWidth={1.6} aria-hidden />
              </span>
              <p className="text-[12px] font-semibold tracking-wide text-[var(--panel-ink-muted)] uppercase">
                Vade
              </p>
            </div>
            <p className="mt-3 text-[1.85rem] font-bold tracking-[-0.03em] tabular-nums text-[var(--panel-ink)]">
              {paymentTermDays != null ? paymentTermDays : "—"}
              {paymentTermDays != null ? (
                <span className="ml-1.5 text-[15px] font-semibold text-[var(--panel-ink-muted)]">
                  gün
                </span>
              ) : null}
            </p>
            <p className="mt-2.5 text-[13px] leading-snug text-[var(--panel-ink-muted)]">
              Fatura vadesi cari hesapta.
            </p>
          </div>

          <Link
            href="/bayi/siparis"
            className="group rounded-[1.1rem] bg-[var(--surface-2)] p-4 ring-1 ring-[var(--panel-border)]/80 transition-colors hover:bg-[var(--primary-subtle)]/50 hover:ring-[var(--primary-solid)]/25 sm:p-5"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary-text)] ring-1 ring-[var(--primary-solid)]/15 transition-transform group-hover:scale-[1.04]">
                <ShoppingCart className="size-4" strokeWidth={1.6} aria-hidden />
              </span>
              <p className="text-[12px] font-semibold tracking-wide text-[var(--panel-ink-muted)] uppercase">
                Açık sepet
              </p>
            </div>
            <p className="mt-3 text-[1.85rem] font-bold tracking-[-0.03em] tabular-nums text-[var(--panel-ink)]">
              {openCartLines}
              <span className="ml-1.5 text-[15px] font-semibold text-[var(--panel-ink-muted)]">
                satır
              </span>
            </p>
            <span className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--primary-text)]">
              Siparişe git
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </Link>
        </div>
      </section>
    </Reveal>
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
  const scene = MODULE_SCENE.repeatLastOrder ?? "/scenes/promo-beyaz-counter.jpg";
  const chips = summary
    ? summary.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4)
    : [];

  return (
    <Reveal delay={delay}>
      <section className="group relative overflow-hidden rounded-[1.35rem] shadow-[0_18px_44px_-22px_rgb(12_40_28/0.55)] ring-1 ring-[var(--panel-border)]/40">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src={scene}
            alt=""
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 1152px, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,color-mix(in_srgb,var(--brand-900)_96%,transparent)_0%,color-mix(in_srgb,var(--brand-800)_84%,transparent)_42%,color-mix(in_srgb,var(--brand-700)_38%,transparent)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_82%_45%,rgb(255_255_255/0.14),transparent_52%)]" />
        </div>

        <div className="relative grid gap-6 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8 sm:p-6 lg:p-7">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em] text-white/92 uppercase ring-1 ring-white/22 backdrop-blur-md">
              <RotateCcw className="size-3.5" aria-hidden />
              Hızlı aksiyon
            </div>
            <h2 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] text-white sm:text-[1.55rem]">
              Geçen siparişi tekrarla
            </h2>

            {thumbnails.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center -space-x-2.5">
                  {thumbnails.slice(0, 4).map((url, i) => (
                    <span
                      key={`${url}-${i}`}
                      className="relative size-11 overflow-hidden rounded-full border-2 border-white/85 shadow-[0_4px_12px_rgb(0_0_0/0.28)]"
                      style={{ zIndex: thumbnails.length - i }}
                    >
                      <Image src={url} alt="" fill className="object-cover" sizes="44px" />
                    </span>
                  ))}
                </div>
                {chips.length > 0 ? (
                  <div className="flex min-w-0 flex-wrap gap-1.5">
                    {chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-medium text-white/88 ring-1 ring-white/18 backdrop-blur-sm"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : summary ? (
                  <p className="min-w-0 flex-1 truncate text-[13px] text-white/78">{summary}</p>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/80">
                {summary ?? "Önceki sepet satırlarını tek tıkla sepete yükleyin."}
              </p>
            )}

            {message ? (
              <p className="mt-3 text-[13px] font-medium text-white/88" role="status">
                {message}
              </p>
            ) : null}
          </div>

          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:min-w-[230px]">
            <button
              type="button"
              disabled={pending}
              className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-white px-5 text-[14px] font-semibold text-[var(--brand-800)] shadow-[0_8px_20px_-10px_rgb(0_0_0/0.45)] transition-[transform,opacity] duration-200 hover:scale-[1.015] active:scale-[0.985] disabled:opacity-60"
              onClick={() => {
                start(async () => {
                  const res = await repeatLastCartAction();
                  setMessage(res.ok ? `${res.lines} satır sepete eklendi` : res.error);
                });
              }}
            >
              <RotateCcw className={cn("size-4", pending && "animate-spin")} aria-hidden />
              {pending ? "Yükleniyor…" : "Tekrarla"}
            </button>
            <Link
              href="/bayi/siparis"
              className="inline-flex min-h-10 w-full items-center justify-center gap-1 rounded-full bg-white/10 px-5 text-[13px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors hover:bg-white/16"
            >
              Sipariş ekranına git
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

