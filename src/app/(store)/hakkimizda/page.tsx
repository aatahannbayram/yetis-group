import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  Focus,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { PillCta } from "@/components/store/pill-cta";
import { Reveal } from "@/components/store/reveal";
import { SceneImage } from "@/components/store/scene-image";
import { getImage, type ImageSlotId } from "@/content/images";
import {
  JsonLdScript,
  breadcrumbJsonLd,
  organizationJsonLd,
} from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, SITE } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Hakkımızda",
  description:
    "Yetiş Grup: yöresel ve kırsal ürünlerde B2B tedarik. Net fiyat, SKT/lot takibi ve düzenli sevkiyat: market, şarküteri ve HORECA için.",
  path: "/hakkimizda",
  image: getImage("about-producer").src,
});

const principles = [
  {
    icon: ScanSearch,
    title: "Netlik",
    body: "Fiyat listenizde ne varsa odur. SKT ve lot görünür; sürpriz yok.",
  },
  {
    icon: RefreshCw,
    title: "Uyum",
    body: "Siparişiniz değişir, limitiniz dolabilir. Sistem buna göre uyarır, kaos çıkarmaz.",
  },
  {
    icon: Focus,
    title: "Odak",
    body: "Katalog, sepet, sevkiyat ve destek aynı yerde. Telefonda not tutmaya gerek kalmaz.",
  },
] as const;

const faces: Array<{ slot: ImageSlotId; role: string; title: string; body: string }> = [
  {
    slot: "about-sales",
    role: "Satış",
    title: "Bayi ilişkisi",
    body: "Başvuru, fiyat listesi ve ilk sipariş: yanınızdayız.",
  },
  {
    slot: "about-quality",
    role: "Kalite",
    title: "Soğuk zincir",
    body: "SKT’si geçen ürün yola çıkmaz. Lot kaydı tutulur.",
  },
  {
    slot: "about-ops",
    role: "Operasyon",
    title: "Sevkiyat",
    body: "Önce yakını biten gider; teslimat günü netleşir.",
  },
];

export default function AboutPage() {
  return (
    <Canvas>
      <JsonLdScript
        data={[
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Ana sayfa", path: "/" },
            { name: "Hakkımızda", path: "/hakkimizda" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: `Hakkımızda · ${SITE.name}`,
            description: SITE.description,
            url: absoluteUrl("/hakkimizda"),
            mainEntity: {
              "@type": "Organization",
              name: SITE.name,
              slogan: SITE.slogan,
            },
          },
        ]}
      />

      {/* Hero - NURA-style dark full-bleed title */}
      <Slab className="relative min-h-[48vh] overflow-hidden !p-0 md:min-h-[62vh]">
        <SceneImage
          id="about-producer"
          fill
          priority
          quality={80}
          className="scale-105 object-[32%_center] md:object-[28%_42%]"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.72)_0%,rgba(12,10,8,0.28)_32%,rgba(10,14,10,0.22)_48%,rgba(10,14,10,0.72)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_55%,transparent_20%,rgba(8,12,8,0.35)_100%)]"
        />
        <div className="absolute inset-x-0 top-0 z-20">
          <SiteHeader variant="overlay" />
        </div>
        <div className="relative z-10 flex min-h-[48vh] flex-col items-center justify-end px-5 pb-12 pt-24 text-center md:min-h-[62vh] md:px-10 md:pb-16 md:pt-28">
          <Reveal>
            <p className="mkt-label text-white/70">Kırsal üretim · temiz gıda</p>
            <h1 className="mkt-display mt-3 text-balance text-white md:text-[clamp(2.75rem,6vw,4.5rem)]">
              Hakkımızda
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/75 md:text-[16px]">
              Üreticiden tezgağa: mera, lot ve soğuk zincir aynı hikâyede.
            </p>
          </Reveal>
        </div>
      </Slab>

      {/* Principles */}
      <Slab className="mkt-pad !bg-[var(--mkt-card-muted)]">
        <Reveal>
          <p className="mkt-section-label">İlkeler</p>
          <h2 className="mkt-h2 mt-5 max-w-3xl text-balance text-mkt-ink md:mt-6">
            Yetiş Grup basit bir fikre dayanır:{" "}
            <span className="text-mkt-ink-muted">tedarik net olsun, kafa karıştırmasın.</span>{" "}
            Gerçek iş gününe göre kurulur.
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4 md:mt-10">
          {principles.map((item, i) => (
            <Reveal key={item.title} delay={i * 70}>
              <article className="flex h-full flex-col rounded-[1.25rem] bg-white p-5 shadow-[0_1px_0_rgba(10,10,10,0.04)] md:p-6">
                <span className="flex size-10 items-center justify-center rounded-lg bg-mkt-ink text-white">
                  <item.icon className="size-4" aria-hidden strokeWidth={2} />
                </span>
                <h3 className="mt-5 text-[1.15rem] font-medium tracking-[-0.02em] text-mkt-ink">
                  {item.title}
                </h3>
                <p className="mkt-body mt-2 text-[14px]">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Slab>

      {/* Faces of the work - not stock headshots */}
      <Slab className="mkt-pad">
        <Reveal>
          <p className="mkt-section-label">Nasıl çalışırız</p>
          <h2 className="mkt-h2 mt-4 max-w-xl text-balance text-mkt-ink">
            Her gün net karar için yanınızdayız
          </h2>
          <p className="mkt-body mt-3 max-w-lg">
            Satış, kalite ve sevkiyat aynı zincirde. Siz siparişi verirsiniz; biz güvenilir teslimata
            kadar takip ederiz.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4 md:mt-10">
          {faces.map((item, i) => (
            <Reveal key={item.role} delay={i * 70}>
              <article className="group overflow-hidden rounded-[1.25rem] bg-mkt-card-muted">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <SceneImage
                    id={item.slot}
                    fill
                    quality={70}
                    className="object-center transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 640px) 30vw, 90vw"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="mkt-label text-mkt-accent">{item.role}</p>
                    <p className="mt-1 text-[1.15rem] font-medium tracking-[-0.02em] text-white">
                      {item.title}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-white/75">{item.body}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Slab>

      {/* Trust strip */}
      <Slab className="mkt-pad">
        <Reveal>
          <div className="grid gap-6 rounded-[1.35rem] border border-[color:var(--mkt-border)] bg-white p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8 sm:p-8 md:p-10">
            <div className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-50)] text-mkt-green-text">
                <ShieldCheck className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-[1.35rem] font-medium tracking-[-0.02em] text-mkt-ink md:text-[1.5rem]">
                  20+ yıllık tecrübe, bugünün sipariş platformu
                </h2>
                <p className="mkt-body mt-2 max-w-xl">
                  Üreticiden tezgağa: lot, SKT ve fiyat kaydı ile. Bayi hesabınız onaylanınca katalog
                  ve listeniz açılır.
                </p>
              </div>
            </div>
            <PillCta href="/auth?tab=uye" className="w-full justify-center sm:w-auto">
              Bayi ol
            </PillCta>
          </div>
        </Reveal>
      </Slab>

      {/* Closing CTA slab - same language as home */}
      <Slab className="relative overflow-hidden !bg-[#0f1f17] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(48,163,105,0.2),transparent_50%)]"
        />
        <div className="mkt-pad relative grid items-center gap-8 py-10 md:py-14 lg:grid-cols-[1fr_auto] lg:py-16">
          <Reveal>
            <p className="mkt-label text-mkt-accent">Birlikte çalışalım</p>
            <h2 className="mkt-h2 mt-3 max-w-lg text-balance text-white">
              Kataloğu inceleyin veya bize yazın.
            </h2>
            <p className="mt-3 max-w-md text-[15px] text-white/65">
              Sorunuz mu var? İletişim formundan ulaşın. Satış ekibi dönüş yapar.
            </p>
          </Reveal>
          <Reveal delay={60}>
            <div className="flex w-full flex-col gap-2.5 sm:flex-row lg:w-auto">
              <PillCta href="/urunler" className="w-full justify-center sm:w-auto">
                Katalog
              </PillCta>
              <Link
                href="/iletisim"
                className="mkt-pill mkt-label inline-flex h-[3.25rem] w-full items-center justify-center gap-2 border border-white/25 px-6 text-[15px] text-white hover:bg-white/10 sm:w-auto"
              >
                İletişim
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
      </Slab>

      <SiteFooter />
    </Canvas>
  );
}
