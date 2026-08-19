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

const MODULE_SCENE: Partial<Record<HomeModule, string>> = {
  savedLists: "/scenes/how-quality.jpg",
  offers: "/scenes/offer-board.jpg",
  orderTimeline: "/scenes/truck-close.jpg",
  monthSummary: "/scenes/warehouse.jpg",
  shelfRotation: "/scenes/how-ops.jpg",
  menuCost: "/scenes/kitchen.jpg",
  volumeTier: "/scenes/cold-chain.jpg",
  branchOverview: "/scenes/how-sales.jpg",
  winback: "/scenes/whatsapp-desk.jpg",
  repeatLastOrder: "/scenes/kitchen.jpg",
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
  const wide = modules.filter((m) => FULL_WIDTH.includes(m));
  const tiles = modules.filter((m) => !FULL_WIDTH.includes(m));

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      <Hero dealerName={dealerName} dealerTypeLabel={dealerTypeLabel} />

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
            src="/scenes/delivery.jpg"
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
            <span className="inline-flex items-center rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-white uppercase ring-1 ring-white/20 backdrop-blur-sm">
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
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white/12 px-5 text-[14px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm hover:bg-white/18"
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
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/12 text-white ring-1 ring-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
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
      <section className="relative overflow-hidden rounded-2xl border border-[var(--panel-border)] border-l-[3px] border-l-[var(--danger-solid)] bg-white p-4 shadow-[var(--shadow-sm)] sm:p-5">
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
    { n: 1, title: "Firma", body: "Unvan ve iletişim bilgilerini kontrol edin", href: "/bayi/firmam" },
    { n: 2, title: "İlk sipariş", body: "Katalogdan ekleyin veya geçen siparişi tekrarlayın", href: "/bayi/siparis" },
    { n: 3, title: "Teslimat", body: "Bölge ve gününüzün açık olduğunu doğrulayın", href: "/bayi/teslimat" },
  ] as const;

  return (
    <Reveal delay={delay}>
      <section className="overflow-hidden rounded-[1.35rem] border border-[var(--panel-border)] bg-white shadow-[0_8px_24px_-18px_rgb(33_28_22/0.28)]">
        <div className="flex items-center gap-3 border-b border-[var(--panel-border)] px-5 py-4">
          <span className="flex size-9 items-center justify-center rounded-full bg-[var(--brand-50)] text-[var(--brand-700)]">
            <CheckCircle2 className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="font-semibold text-[var(--panel-ink)]">Kuruluma devam</h2>
            <p className="text-[13px] text-[var(--panel-ink-muted)]">Üç kısa adım, sonra sipariş akışı açılır.</p>
          </div>
        </div>
        <ol className="grid sm:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step.href}
              className={cn(
                "relative p-5",
                i < steps.length - 1 && "border-b border-[var(--panel-border)] sm:border-r sm:border-b-0",
              )}
            >
              <Link href={step.href} className="group block">
                <span className="flex size-7 items-center justify-center rounded-full bg-[var(--brand-700)] text-[11px] font-bold text-white">
                  {step.n}
                </span>
                <p className="mt-3 font-semibold text-[var(--panel-ink)] group-hover:text-[var(--brand-700)]">
                  {step.title}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-[var(--panel-ink-muted)]">{step.body}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--brand-700)]">
                  Aç <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
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
    <Reveal delay={delay}>
      <section className="overflow-hidden rounded-[1.35rem] border border-[var(--panel-border)] bg-white shadow-[0_8px_24px_-18px_rgb(33_28_22/0.28)]">
        <div className="grid sm:grid-cols-3">
          <div className="relative p-5 sm:col-span-1 sm:border-r sm:border-[var(--panel-border)]">
            <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--panel-ink-muted)]">
              <Wallet className="size-3.5" aria-hidden />
              Kalan kredi
            </div>
            <p
              className={cn(
                "mt-2 text-[1.75rem] font-bold tracking-tight tabular-nums",
                over ? "text-[var(--danger-text)]" : "text-[var(--panel-ink)]",
              )}
            >
              {remaining != null ? formatMoney(money(remaining)) : "Tanımsız"}
            </p>
            {creditLimitKurus != null ? (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]" aria-hidden>
                <div
                  className={cn("h-full rounded-full transition-[width] duration-700 ease-out", barColor)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            ) : null}
            {over ? (
              <p className="mt-2 text-[12px] font-medium text-[var(--danger-text)]">Limit doldu</p>
            ) : null}
          </div>

          <div className="border-t border-[var(--panel-border)] p-5 sm:border-t-0 sm:border-r">
            <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--panel-ink-muted)]">
              <CalendarDays className="size-3.5" aria-hidden />
              Vade
            </div>
            <p className="mt-2 text-[1.75rem] font-bold tracking-tight tabular-nums text-[var(--panel-ink)]">
              {paymentTermDays != null ? paymentTermDays : "-"}
              {paymentTermDays != null ? (
                <span className="ml-1 text-[15px] font-semibold text-[var(--panel-ink-muted)]">gün</span>
              ) : null}
            </p>
            <p className="mt-2 text-[13px] text-[var(--panel-ink-muted)]">Fatura vadesi cari hesapta.</p>
          </div>

          <Link href="/bayi/siparis" className="group border-t border-[var(--panel-border)] p-5 sm:border-t-0">
            <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--panel-ink-muted)]">
              <ShoppingCart className="size-3.5" aria-hidden />
              Açık sepet
            </div>
            <p className="mt-2 text-[1.75rem] font-bold tracking-tight tabular-nums text-[var(--panel-ink)]">
              {openCartLines}
              <span className="ml-1 text-[15px] font-semibold text-[var(--panel-ink-muted)]">satır</span>
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--brand-700)]">
              Siparişe git
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
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
  const scene = MODULE_SCENE.repeatLastOrder ?? "/scenes/kitchen.jpg";

  return (
    <Reveal delay={delay}>
      <section className="group relative overflow-hidden rounded-[1.35rem] shadow-[0_16px_40px_-20px_rgb(12_40_28/0.5)]">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src={scene}
            alt=""
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 1152px, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,color-mix(in_srgb,var(--brand-900)_94%,transparent)_0%,color-mix(in_srgb,var(--brand-800)_82%,transparent)_38%,color-mix(in_srgb,var(--brand-700)_45%,transparent)_100%)]" />
        </div>

        <div className="relative grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-8 sm:p-6 lg:p-7">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm">
                <RotateCcw className="size-4.5" aria-hidden />
              </span>
              <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                Geçen siparişi tekrarla
              </h2>
            </div>

            {thumbnails.length > 0 ? (
              <div className="mt-4 flex items-center -space-x-2.5">
                {thumbnails.map((url, i) => (
                  <span
                    key={url}
                    className="relative size-10 overflow-hidden rounded-full border-2 border-white/80 shadow-[var(--shadow-sm)]"
                    style={{ zIndex: thumbnails.length - i }}
                  >
                    <Image src={url} alt="" fill className="object-cover" sizes="40px" />
                  </span>
                ))}
              </div>
            ) : null}

            <p className="mt-3 max-w-xl text-[length:var(--panel-font-size)] leading-relaxed text-white/80">
              {summary ?? "Önceki sepet satırlarını tek tıkla sepete yükleyin."}
            </p>

            {message ? (
              <p className="mt-2 text-caption text-white/75" role="status">
                {message}
              </p>
            ) : null}
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
            <button
              type="button"
              disabled={pending}
              className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-white px-4 text-[length:var(--panel-font-size)] font-semibold text-[var(--brand-800)] shadow-[var(--shadow-sm)] transition-[transform,opacity] duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
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
              className="inline-flex min-h-10 w-full items-center justify-center gap-1 rounded-xl bg-white/10 px-4 text-caption font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors hover:bg-white/15"
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
