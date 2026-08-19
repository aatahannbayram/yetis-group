"use client";

import Image from "next/image";
import { CheckCircle2, CreditCard, MessageCircleMore, Snowflake, Tag } from "lucide-react";
import { PillCta } from "@/components/store/pill-cta";
import { ScrollItem, ScrollReveal, ScrollStagger } from "@/components/store/scroll-reveal";

const panelFeatures = [
  {
    icon: Tag,
    title: "Net fiyat listesi",
    body: "Onaylı hesabınızda kademeli iskonto ve fiyat tek ekranda; siparişte kilitlenir.",
  },
  {
    icon: CreditCard,
    title: "Kredi limiti & cari",
    body: "Açık siparişler limitten düşer; bakiyeniz ledger üzerinden her an şeffaf.",
  },
  {
    icon: Snowflake,
    title: "Lot / SKT şeffaflığı",
    body: "Sevkiyat FEFO ile önerilir; süresi geçen peynir hiçbir zaman yola çıkmaz.",
  },
  {
    icon: MessageCircleMore,
    title: "WhatsApp bildirimi",
    body: "Sipariş, sevkiyat ve fatura güncellemeleri anında işletme hattınıza düşer.",
  },
];

const previewRows = [
  { name: "Beyaz Peynir 17 kg Teneke", meta: "SKT 12.03", price: "4.280 ₺", src: "/products/beyaz-peynir.jpg" },
  { name: "Kaşar 1 kg Vakum", meta: "SKT 04.02", price: "612 ₺", src: "/products/kasar.jpg" },
  { name: "Tulum 900 g", meta: "SKT 21.02", price: "398 ₺", src: "/products/tulum.jpg" },
];

/**
 * The B2B trust pitch: what an approved dealer actually sees in the panel.
 * A decorative, illustrative UI mock (static copy, not live data) —
 * the marketing equivalent of a product screenshot without exposing the
 * real admin/dealer UI chrome.
 */
export function PlatformShowcase() {
  return (
    <div className="relative grid gap-12 lg:grid-cols-[minmax(0,0.52fr)_minmax(0,0.48fr)] lg:gap-14 xl:gap-20">
      <ScrollReveal from="left">
        <p className="mkt-section-label">Bayi paneli</p>
        <h2 className="mkt-h2 mt-3 max-w-lg text-balance text-mkt-ink">
          Sipariş verirken hiçbir şey belirsiz kalmasın.
        </h2>
        <p className="mkt-body mt-4 max-w-md">
          Onaylı bayi hesabınızda fiyat, kredi limiti, lot ve sevkiyat aynı ekranda; her sipariş
          güvenle ve sürprizsiz ilerler.
        </p>

        <ScrollStagger className="mt-9 grid gap-6 sm:grid-cols-2">
          {panelFeatures.map((feature) => (
            <ScrollItem key={feature.title}>
              <div className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mkt-card-muted text-mkt-green-text">
                  <feature.icon className="size-4" aria-hidden />
                </span>
                <div>
                  <h3 className="text-[0.95rem] font-medium tracking-[-0.01em] text-mkt-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-mkt-ink-muted">{feature.body}</p>
                </div>
              </div>
            </ScrollItem>
          ))}
        </ScrollStagger>

        <div className="mt-9">
          <PillCta href="/auth">Bayi Girişi</PillCta>
        </div>
      </ScrollReveal>

      <ScrollReveal from="right" delay={0.1} className="relative">
        <div className="relative rounded-[1.5rem] border border-[color:var(--mkt-border)] bg-white p-5 shadow-[0_32px_64px_-24px_rgba(33,28,22,0.22)] sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5" aria-hidden>
              <span className="size-2 rounded-full bg-mkt-card-muted" />
              <span className="size-2 rounded-full bg-mkt-card-muted" />
              <span className="size-2 rounded-full bg-mkt-card-muted" />
            </div>
            <span className="mkt-pill inline-flex items-center bg-mkt-accent/15 px-2.5 py-1 text-[11px] font-semibold text-mkt-green-text">
              Onaylı hesap
            </span>
          </div>

          <p className="mt-4 text-[12px] font-medium tracking-[0.02em] text-mkt-ink-muted">
            Fiyat listeniz
          </p>
          <ul className="mt-2 divide-y divide-[color:var(--mkt-border)]">
            {previewRows.map((row) => (
              <li key={row.name} className="flex items-center gap-3 py-3">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-[10px]">
                  <Image src={row.src} alt="" fill className="object-cover" sizes="44px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-mkt-ink">{row.name}</p>
                  <p className="text-[12px] text-mkt-ink-muted">{row.meta}</p>
                </div>
                <p className="shrink-0 text-[13.5px] font-semibold tabular-nums text-mkt-ink">
                  {row.price}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-[color:var(--mkt-border)] pt-4">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-medium text-mkt-ink-muted">Kredi limiti kullanımı</span>
              <span className="tabular-nums text-mkt-ink-muted">42.500 ₺ / 75.000 ₺</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mkt-card-muted">
              <div className="h-full w-[57%] rounded-full bg-mkt-accent" />
            </div>
          </div>
        </div>

        <ScrollReveal delay={0.22} className="absolute -bottom-5 -left-4 hidden -rotate-3 sm:block">
          <div className="flex items-center gap-2.5 rounded-[1rem] border border-[color:var(--mkt-border)] bg-white px-4 py-3 shadow-[0_20px_40px_-16px_rgba(33,28,22,0.28)]">
            <CheckCircle2 className="size-4 shrink-0 text-mkt-green-text" aria-hidden />
            <div>
              <p className="text-[12.5px] font-semibold text-mkt-ink">Sipariş #A2411 onaylandı</p>
              <p className="text-[11px] text-mkt-ink-muted">WhatsApp&rsquo;tan bildirim gönderildi</p>
            </div>
          </div>
        </ScrollReveal>
      </ScrollReveal>
    </div>
  );
}
