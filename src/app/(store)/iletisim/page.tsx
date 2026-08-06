import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  Mail,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { ContactForm } from "@/components/store/contact-form";
import { Reveal } from "@/components/store/reveal";
import { PillCta } from "@/components/store/pill-cta";
import { listCategories } from "@/infra/db/categories";
import { ensureDefaultLeadFields, listActiveFormFields } from "@/infra/db/lead-fields";
import {
  JsonLdScript,
  breadcrumbJsonLd,
  organizationJsonLd,
} from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildPageMetadata({
  title: "İletişim",
  description:
    "Yetiş Grup satış ekibine ulaşın. Bayilik, numune ve HORECA talepleriniz tek CRM havuzuna düşer.",
  path: "/iletisim",
  image: "/scenes/kitchen.jpg",
});

const topics = [
  {
    href: "/iletisim?konu=bayilik",
    label: "Bayilik",
    key: "bayilik",
    icon: Building2,
  },
  {
    href: "/iletisim?konu=numune",
    label: "Numune",
    key: "numune",
    icon: Package,
  },
  {
    href: "/iletisim?konu=horeca",
    label: "HORECA",
    key: "horeca",
    icon: UtensilsCrossed,
  },
] as const;

const topicCopy = {
  bayilik: {
    eyebrow: "Bayilik başvurusu",
    headline: "Birlikte büyüyelim",
    sub: "Market, şarküteri veya zincir: başvurunuz CRM’e düşer; satış ekibi fiyat listesi ve limit sürecini netleştirir.",
    points: [
      "Başvuru → inceleme → onaylı fiyat listesi",
      "Kredi limiti ve teslimat bölgesi planı",
      "Lot / SKT şeffaflığı ile düzenli tedarik",
    ],
    submitLabel: "Bayilik talebini gönder",
    formTitle: "Bayilik formu",
    formSub: "Tek kayıt yeterli. Onay sonrası üyelik ve fiyat listeniz açılır.",
  },
  numune: {
    eyebrow: "Numune talebi",
    headline: "Önce tadın, sonra sipariş",
    sub: "Ürün denemesi için kısa form yeterli. Uygun SKU ve lot bilgisini birlikte seçeriz.",
    points: [
      "Lot ve SKT bilgisiyle numune",
      "HORECA / market için uygun gramaj",
      "Satış ekibi 1–2 iş günü içinde dönüş",
    ],
    submitLabel: "Numune talebini gönder",
    formTitle: "Numune formu",
    formSub: "Talebiniz doğrudan satış ekibine iletilir.",
  },
  horeca: {
    eyebrow: "HORECA tedarik",
    headline: "Mutfağınız için net tedarik",
    sub: "Otel, restoran ve kafe ihtiyaçlarınızı yazın. Food cost dostu SKU’lar ve düzenli sevkiyat.",
    points: [
      "Dilimli / blok / teneke seçenekleri",
      "Haftalık teslimat planı",
      "Cari ve limit ile kontrollü sipariş",
    ],
    submitLabel: "HORECA talebini gönder",
    formTitle: "HORECA formu",
    formSub: "Tedarik ihtiyacınız CRM lead olarak kayda geçer.",
  },
  default: {
    eyebrow: "Satış & destek",
    headline: "Yazın, yanıtlayalım",
    sub: "Bayilik, numune veya HORECA: talebiniz tek CRM kaydına düşer; ekip dönüş yapar.",
    points: [
      "Tek form, tek CRM kaydı",
      "Telefon ve WhatsApp desteği",
      "Bayi üyeliği için self-serve kayıt",
    ],
    submitLabel: "Mesajı gönder",
    formTitle: "Bize yazın",
    formSub: "Zorunlu alanları doldurun; en kısa sürede dönüş yapıyoruz.",
  },
} as const;

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ konu?: string }>;
}) {
  const { konu } = await searchParams;
  await ensureDefaultLeadFields();
  const [categories, fields] = await Promise.all([listCategories(), listActiveFormFields()]);

  const source =
    konu === "bayilik"
      ? "BAYILIK_BASVURUSU"
      : konu === "numune"
        ? "NUMUNE_TALEBI"
        : "ILETISIM_FORMU";

  const defaultChannel = konu === "horeca" ? "HORECA" : konu === "bayilik" ? "MARKET" : "HORECA";

  const copy =
    konu === "bayilik"
      ? topicCopy.bayilik
      : konu === "numune"
        ? topicCopy.numune
        : konu === "horeca"
          ? topicCopy.horeca
          : topicCopy.default;

  const channels = [
    {
      href: `tel:${SITE.phone}`,
      label: "Telefon",
      value: SITE.phoneDisplay,
      icon: Phone,
      hint: "Hafta içi 09:00–18:00",
    },
    {
      href: `https://wa.me/${SITE.phone.replace("+", "")}`,
      label: "WhatsApp",
      value: "Hızlı mesaj",
      icon: MessageCircle,
      hint: "İşletme hattı",
      external: true,
    },
    {
      href: `mailto:${SITE.email}`,
      label: "E-posta",
      value: SITE.email,
      icon: Mail,
      hint: "1–2 iş günü",
    },
  ] as const;

  return (
    <Canvas>
      <JsonLdScript
        data={[
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Ana sayfa", path: "/" },
            { name: "İletişim", path: "/iletisim" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: `İletişim · ${SITE.name}`,
            url: absoluteUrl("/iletisim"),
            description:
              "Yetiş Grup satış ekibine ulaşın. Bayilik, numune ve HORECA talepleriniz tek CRM havuzuna düşer.",
          },
        ]}
      />

      {/* Hero */}
      <Slab className="relative min-h-[40vh] overflow-hidden !p-0 md:min-h-[48vh]">
        <Image
          src="/scenes/kitchen.jpg"
          alt=""
          fill
          priority
          quality={75}
          className="scale-105 object-cover object-center"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/50 to-black/70"
        />
        <div className="absolute inset-x-0 top-0 z-20">
          <SiteHeader variant="overlay" />
        </div>
        <div className="relative z-10 flex min-h-[40vh] flex-col items-center justify-center px-5 pb-8 pt-20 text-center md:min-h-[48vh] md:px-10 md:pt-24">
          <Reveal>
            <p className="mkt-label text-white/70">{copy.eyebrow}</p>
            <h1 className="mkt-display mt-3 text-balance text-white md:text-[clamp(2.5rem,5.5vw,4rem)]">
              İletişim
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/80 md:text-base">
              {copy.sub}
            </p>
          </Reveal>
        </div>
      </Slab>

      {/* Direct channels */}
      <Slab className="mkt-pad !bg-[var(--mkt-card-muted)]">
        <Reveal>
          <span className="mkt-pill mkt-label inline-flex bg-white px-3.5 py-1.5 text-mkt-ink">
            Hızlı ulaşım
          </span>
          <h2 className="mkt-h2 mt-4 max-w-xl text-balance text-mkt-ink">
            Form istemezseniz{" "}
            <span className="text-mkt-ink-muted">doğrudan arayın.</span>
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {channels.map((ch, i) => (
            <Reveal key={ch.label} delay={i * 50}>
              <a
                href={ch.href}
                {...("external" in ch && ch.external
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                className="group flex h-full flex-col rounded-[1.25rem] bg-white p-5 shadow-[0_1px_0_rgba(10,10,10,0.04)] transition-colors hover:bg-mkt-ink hover:text-white md:p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-mkt-ink text-white transition-colors group-hover:bg-white group-hover:text-mkt-ink">
                  <ch.icon className="size-4" aria-hidden strokeWidth={2} />
                </span>
                <p className="mt-4 text-[13px] font-semibold tracking-wide text-mkt-ink-muted uppercase group-hover:text-white/65">
                  {ch.label}
                </p>
                <p className="mt-1 text-[1.05rem] font-semibold tracking-[-0.02em] text-mkt-ink group-hover:text-white">
                  {ch.value}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-mkt-ink-muted group-hover:text-white/60">
                  <Clock3 className="size-3.5" aria-hidden />
                  {ch.hint}
                </p>
              </a>
            </Reveal>
          ))}
        </div>
      </Slab>

      {/* Form + story */}
      <Slab className="mkt-pad">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 xl:gap-14">
          <Reveal>
            <div className="lg:sticky lg:top-6">
              <span className="mkt-pill mkt-label inline-flex bg-mkt-card-muted px-3.5 py-1.5 text-mkt-ink">
                {copy.eyebrow}
              </span>
              <h2 className="mkt-h2 mt-4 text-balance text-mkt-ink">{copy.headline}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-mkt-ink-muted md:text-base">
                {copy.sub}
              </p>

              <ul className="mt-7 space-y-3.5">
                {copy.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-[15px] text-mkt-ink">
                    <CheckCircle2
                      className="mt-0.5 size-5 shrink-0 text-mkt-green-text"
                      aria-hidden
                    />
                    <span className="leading-snug">{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-start gap-3 rounded-[1.15rem] border border-[color:var(--mkt-border)] bg-mkt-card-muted/70 p-4">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-mkt-green-text" aria-hidden />
                <p className="text-[14px] leading-relaxed text-mkt-ink">
                  Talebiniz otomatik onaylanmaz. Satış ekibi inceler; bayi hesabı yalnızca onaydan
                  sonra açılır.
                </p>
              </div>

              {konu === "bayilik" ? (
                <div className="mt-5">
                  <Link
                    href="/auth?tab=uye"
                    className="inline-flex items-center gap-2 text-[15px] font-semibold text-mkt-green-text hover:underline"
                  >
                    Self-serve üyelik oluştur
                    <ArrowUpRight className="size-4" aria-hidden />
                  </Link>
                </div>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div className="rounded-[1.35rem] border border-[color:var(--mkt-border)] bg-white p-5 shadow-[0_1px_0_rgba(10,10,10,0.04)] sm:p-7 md:p-8">
              <div className="mb-6">
                <h3 className="text-[1.35rem] font-semibold tracking-[-0.02em] text-mkt-ink md:text-[1.5rem]">
                  {copy.formTitle}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-mkt-ink-muted md:text-[15px]">
                  {copy.formSub}
                </p>
              </div>

              <nav aria-label="Konu seçimi" className="mb-7 flex flex-wrap gap-2">
                {topics.map((t) => {
                  const active = konu === t.key;
                  return (
                    <Link
                      key={t.href}
                      href={t.href}
                      scroll={false}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors",
                        active
                          ? "bg-mkt-ink text-white"
                          : "bg-mkt-card-muted text-mkt-ink hover:bg-mkt-ink/10",
                      )}
                    >
                      <t.icon className="size-3.5" aria-hidden />
                      {t.label}
                    </Link>
                  );
                })}
                {konu ? (
                  <Link
                    href="/iletisim"
                    scroll={false}
                    className="inline-flex items-center rounded-full border border-[color:var(--mkt-border)] px-3.5 py-2.5 text-[13px] font-semibold text-mkt-ink hover:bg-mkt-card-muted"
                  >
                    Tümü
                  </Link>
                ) : null}
              </nav>

              <ContactForm
                defaultSource={source}
                defaultChannel={defaultChannel}
                submitLabel={copy.submitLabel}
                categories={categories.map((c) => ({ id: c.id, name: c.name }))}
                fields={fields.map((f) => ({
                  id: f.id,
                  key: f.key,
                  label: f.label,
                  type: f.type,
                  options: f.options,
                  required: f.required,
                }))}
              />
            </div>
          </Reveal>
        </div>
      </Slab>

      {/* Closing CTA */}
      <Slab className="relative overflow-hidden !bg-[#0f1f17] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(48,163,105,0.2),transparent_50%)]"
        />
        <div className="mkt-pad relative grid items-center gap-8 py-10 md:py-14 lg:grid-cols-[1fr_auto] lg:py-16">
          <Reveal>
            <p className="mkt-label text-mkt-accent">Katalog</p>
            <h2 className="mkt-h2 mt-3 max-w-lg text-balance text-white">
              Ürünleri incelerken de yazabilirsiniz.
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/70">
              Fiyat listesi onaylı bayilere açılır. Önce kataloğa bakın veya üyelik başvurusu yapın.
            </p>
          </Reveal>
          <Reveal delay={60}>
            <div className="flex w-full flex-col gap-2.5 sm:flex-row lg:w-auto">
              <PillCta href="/urunler" className="w-full justify-center sm:w-auto">
                Katalog
              </PillCta>
              <Link
                href="/auth?tab=uye"
                className="mkt-pill inline-flex h-[3.25rem] w-full items-center justify-center gap-2 bg-white px-6 text-[15px] font-semibold text-[#0a0a0a] hover:bg-white/92 sm:w-auto"
              >
                Üye ol
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
