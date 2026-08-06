import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ClipboardList,
  Leaf,
  MessageCircleMore,
  Package,
  Snowflake,
  Truck,
} from "lucide-react";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { PillCta } from "@/components/store/pill-cta";
import { AboutTabs } from "@/components/store/about-tabs";
import { Reveal } from "@/components/store/reveal";
import {
  JsonLdScript,
  faqPageJsonLd,
  localBusinessJsonLd,
  organizationJsonLd,
} from "@/lib/seo/json-ld";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: SITE.name,
  description: SITE.description,
  path: "/",
  image: "/hero-dairy.jpg",
});

const homeFaqs = [
  {
    question: "Yetiş Grup kimlere satış yapar?",
    answer:
      "Market, şarküteri, HORECA ve ara toptancılara B2B satış yaparız. Tüketiciye perakende pazaryeri değiliz; onaylı bayi hesabı ile katalog, fiyat listesi ve sipariş açılır.",
  },
  {
    question: "Toptan yöresel gıda tedarikçisi olarak ne sunarsınız?",
    answer:
      "Yöresel ve kırsal ürün kataloğu, soğuk zincir/lot-SKT takibi, kredi limiti kontrollü sepet, FEFO sevkiyat ve WhatsApp bildirimlerini tek platformda birleştiririz.",
  },
  {
    question: "Bayilik nasıl alınır?",
    answer:
      "Satış ekibimize başvurursunuz; ticari değerlendirme ve onay sonrası kullanıcı hesabı, fiyat listesi ve varsa kredi limiti tanımlanır. Süreç detayı /haberler altında bayilik rehberinde anlatılır.",
  },
];

const aboutTabs = [
  {
    id: "hikaye",
    label: "Hikâyemiz",
    title: "Yöresel ve kırsal ürünlerde güvenilir çözüm ortağınız.",
    body: "Yetiş Grup; market, şarküteri, HORECA ve ara toptancılara temiz gıda tedarik eder. Üretici hikâyesini, soğuk zinciri ve şeffaf fiyatı tek platformda birleştiririz.",
  },
  {
    id: "vizyon",
    label: "Vizyon",
    title: "Temiz gıdaya erişimi her işletme için kolaylaştırmak.",
    body: "Katalog, sipariş, cari ve WhatsApp bildirimlerini tek akışta topluyoruz. Böylece bayi ilişkisi kağıt ve telefon trafiğinden kurtulur.",
  },
  {
    id: "misyon",
    label: "Misyon",
    title: "Kaliteyi, izlenebilirliği ve adil fiyatı aynı masaya koymak.",
    body: "Lot ve SKT takibi, FEFO sevkiyat ve fiyat snapshot ile geçmiş siparişler bozulmaz. Güven, fire maliyetinden daha değerlidir.",
  },
];

const stats = [
  { kind: "image" as const, src: "/products/beyaz-peynir.jpg", alt: "Beyaz peynir üretimi" },
  { kind: "stat" as const, value: "20+", label: "Yıllık tecrübe", accent: false },
  { kind: "image" as const, src: "/products/kasar.jpg", alt: "Kaşar peyniri" },
  { kind: "stat" as const, value: "%98", label: "Zamanında sevkiyat", accent: true },
];

const capabilities = [
  {
    icon: ClipboardList,
    title: "B2B sipariş",
    description: "Katalog, hızlı sipariş ve kredi limiti kontrollü sepet.",
    image: "/products/kasar.jpg",
  },
  {
    icon: Snowflake,
    title: "Soğuk zincir",
    description: "SKT ve lot takibi; süresi geçen ürün sevk edilmez.",
    image: "/products/sut.jpg",
  },
  {
    icon: Truck,
    title: "Sevkiyat",
    description: "FEFO önerisi ve operasyon paneliyle net teslimat.",
    image: "/products/tulum.jpg",
  },
  {
    icon: MessageCircleMore,
    title: "WhatsApp",
    description: "Sipariş ve sevkiyat bildirimleri işletme hattından.",
    image: "/products/yogurt.jpg",
  },
];

const productsPreview = [
  { src: "/products/beyaz-peynir.jpg", name: "Beyaz Peynir", tag: "Şarküteri" },
  { src: "/products/kasar.jpg", name: "Kaşar", tag: "Olgun" },
  { src: "/products/yogurt.jpg", name: "Yoğurt", tag: "Günlük" },
  { src: "/products/tereyagi.jpg", name: "Tereyağı", tag: "Kırsal" },
];

const processTabs = [
  {
    id: "tedarik",
    label: "Tedarik",
    title: "Üreticiden işletmeye şeffaf zincir.",
    body: "Üretici kaydı, lot ve kalite kontrolü ile ürün Platform’a girer. Bayi yalnızca onaylı kataloğu görür.",
    image: "/products/beyaz-peynir.jpg",
  },
  {
    id: "siparis",
    label: "Sipariş",
    title: "Fiyat listesi ve limit tek ekranda.",
    body: "Bayi sepete ekler; kademe ve kampanya kuralları uygulanır. Onayda fiyat snapshot alınır.",
    image: "/products/lor.jpg",
  },
  {
    id: "sevkiyat",
    label: "Sevkiyat",
    title: "SKT’ye saygılı lojistik.",
    body: "FEFO ile lot seçilir; WhatsApp ile durum bildirilir. Cari hareket siparişle birlikte izlenir.",
    image: "/products/tereyagi.jpg",
  },
];

export default function StoreHomePage() {
  return (
    <Canvas>
      <JsonLdScript data={[organizationJsonLd(), localBusinessJsonLd(), faqPageJsonLd(homeFaqs)]} />
      <Slab className="relative min-h-[72vh] overflow-hidden md:min-h-[85vh]">
        <Image
          src="/hero-dairy.jpg"
          alt="Yetiş Grup — yöresel ve kırsal ürünler"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30"
        />

        <SiteHeader variant="overlay" />

        <div className="relative z-10 flex min-h-[72vh] flex-col justify-end px-5 pb-8 md:min-h-[85vh] md:px-10 md:pb-14 lg:px-14">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.7fr)] lg:items-end lg:gap-8">
            <Reveal>
              <span className="mkt-pill mkt-label inline-flex bg-white/15 px-4 py-1.5 text-white backdrop-blur-md">
                Yöresel &amp; kırsal gıda
              </span>
              <h1 className="mkt-display mt-4 max-w-2xl text-balance text-white md:mt-5">
                Temiz gıdaya eriş, sağlıklı yetiş.
              </h1>
              <div className="mt-6 md:mt-8">
                <PillCta href="/auth" className="w-full justify-center sm:w-auto">
                  Bayi Girişi
                </PillCta>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="rounded-[1.25rem] border border-white/25 bg-white/12 p-5 text-white shadow-lg backdrop-blur-xl md:p-7">
                <p className="mkt-label text-white/70">Misyonumuz</p>
                <p className="mt-3 text-[1rem] leading-snug font-medium tracking-[-0.01em] md:text-[1.05rem]">
                  Marketten HORECA&apos;ya, üretici hikâyesini ve güvenilir tedariki tek platformda
                  buluşturmak.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Slab>

      <Slab id="hakkimizda" className="mkt-pad">
        <Reveal>
          <AboutTabs tabs={aboutTabs} />
          <div className="mt-8">
            <PillCta href="/urunler" variant="secondary" showArrow={false} className="w-full justify-center sm:w-auto">
              Kataloğu İncele
            </PillCta>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-2.5 sm:gap-3 md:mt-14 md:grid-cols-4 md:gap-4">
          {stats.map((item, i) => (
            <Reveal key={i} delay={i * 70}>
              {item.kind === "image" ? (
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem] md:rounded-[1.25rem]">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 22vw, 45vw"
                  />
                </div>
              ) : (
                <div
                  className={
                    item.accent
                      ? "relative flex aspect-[4/5] flex-col justify-between rounded-[1rem] bg-mkt-accent p-4 text-mkt-accent-ink md:rounded-[1.25rem] md:p-6"
                      : "relative flex aspect-[4/5] flex-col justify-between rounded-[1rem] bg-mkt-card-muted p-4 text-mkt-ink md:rounded-[1.25rem] md:p-6"
                  }
                >
                  <span className="ml-auto flex size-8 items-center justify-center rounded-full bg-mkt-accent-ink text-white md:size-9">
                    <ArrowUpRight className="size-3.5 md:size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="mkt-stat text-[1.75rem] md:text-[inherit]">{item.value}</p>
                    <p className="mkt-label mt-2 opacity-80 md:mt-3">{item.label}</p>
                  </div>
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </Slab>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <Slab className="mkt-pad relative overflow-hidden !py-8 md:!py-10">
          <div className="relative z-10 max-w-lg">
            <span className="mkt-pill mkt-label inline-flex border border-[color:var(--mkt-border)] px-3 py-1.5 text-mkt-ink-muted">
              Ne sunuyoruz
            </span>
            <h2 className="mkt-h2 mt-5 text-balance text-mkt-ink">
              Tedarikten sepete, tek{" "}
              <span className="rounded-md bg-[#E8E0F5] px-1.5">B2B</span> akış.
            </h2>
            <p className="mkt-body mt-4">
              Katalog, fiyat listesi, kredi limiti ve WhatsApp bildirimi aynı platformda.
            </p>
            <div className="mt-8">
              <PillCta href="/#cozumler" variant="secondary" showArrow={false} className="w-full justify-center sm:w-auto">
                Çözümleri Gör
              </PillCta>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { src: "/products/beyaz-peynir.jpg", alt: "Beyaz peynir" },
              { src: "/products/kasar.jpg", alt: "Kaşar" },
              { src: "/products/yogurt.jpg", alt: "Yoğurt" },
            ].map((img) => (
              <div
                key={img.src}
                className="relative aspect-[3/4] overflow-hidden rounded-[1rem]"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 12vw, 30vw"
                />
              </div>
            ))}
          </div>
        </Slab>

        <Slab className="mkt-pad !py-8 md:!py-10">
          <AboutTabs tabs={processTabs} visual />
        </Slab>
      </div>

      <Slab id="cozumler" className="mkt-pad">
        <Reveal>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <div className="flex items-center gap-2">
                <Leaf className="size-4 text-mkt-green-text" aria-hidden />
                <p className="mkt-label text-mkt-green-text">Çözümler</p>
              </div>
              <h2 className="mkt-h2 mt-3 text-balance text-mkt-ink">
                Araçlarla kanıtlanan çözüm ortaklığı.
              </h2>
              <p className="mkt-body mt-4">
                Slogan yetmez. Sipariş, stok ve iletişim araçları bayi operasyonunu hızlandırır.
              </p>
            </div>
            <div className="relative hidden h-28 w-44 shrink-0 overflow-hidden rounded-[1.25rem] sm:block lg:h-32 lg:w-52">
              <Image
                src="/hero-dairy.jpg"
                alt=""
                fill
                className="object-cover"
                sizes="208px"
              />
            </div>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 md:mt-12 lg:grid-cols-4">
          {capabilities.map((item, i) => (
            <Reveal key={item.title} delay={i * 70}>
              <div className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-mkt-card-muted">
                <div className="relative aspect-[5/4] overflow-hidden">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(min-width: 1024px) 22vw, 50vw"
                  />
                  <span className="absolute top-3 left-3 flex size-10 items-center justify-center rounded-full bg-white/90 text-mkt-green-text shadow-sm backdrop-blur-sm">
                    <item.icon className="size-4" aria-hidden />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-[1.1rem] font-medium tracking-[-0.015em] text-mkt-ink">
                    {item.title}
                  </h3>
                  <p className="mkt-body mt-2 text-[13px]">{item.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Slab>

      {/* Product preview with watermark */}
      <Slab className="relative overflow-hidden">
        <div className="mkt-pad relative">
          <p
            aria-hidden
            className="pointer-events-none absolute top-4 right-3 text-[clamp(2.5rem,14vw,7rem)] leading-none font-medium tracking-[-0.04em] text-mkt-ink/[0.04] select-none md:top-8 md:right-10"
          >
            Ürünlerimiz
          </p>
          <Reveal>
            <p className="mkt-label text-mkt-green-text">Katalog</p>
            <h2 className="mkt-h2 mt-3 max-w-lg text-balance text-mkt-ink">
              Rafınızı dolduran yöresel seçki.
            </h2>
          </Reveal>
          <div className="mkt-rail relative mt-8 md:mt-12">
            {productsPreview.map((product, i) => (
              <Reveal key={product.name} delay={i * 60}>
                <Link href="/urunler" className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[1rem] md:rounded-[1.25rem]">
                    <Image
                      src={product.src}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 768px) 20vw, 42vw"
                    />
                  </div>
                  <span className="mkt-pill mkt-label mt-3 inline-flex bg-mkt-card-muted px-3 py-1 text-mkt-ink-muted">
                    {product.tag}
                  </span>
                  <p className="mt-2 text-[14px] font-medium tracking-[-0.01em] text-mkt-ink md:text-[15px]">
                    {product.name}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 md:mt-10">
            <PillCta href="/urunler" className="w-full justify-center sm:w-auto">
              Tüm Ürünler
            </PillCta>
          </div>
        </div>
      </Slab>

      {/* Connect row */}
      <Slab className="px-4 py-4 sm:px-6 sm:py-6 md:px-10">
        <div className="flex flex-col gap-4 rounded-[1.25rem] bg-mkt-card-muted p-4 sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:px-6 sm:py-4 md:px-8">
          <div className="flex items-start gap-3 sm:items-center">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mkt-accent text-mkt-accent-ink">
              <Package className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="mkt-label text-mkt-ink">Bağlantıda kalın</p>
              <p className="mkt-body mt-0.5 text-[13px]">
                Sipariş ve destek için satış ekibimiz hazır.
              </p>
            </div>
          </div>
          <a
            href="mailto:info@yetisgrup.com"
            className="mkt-pill mkt-label inline-flex w-full shrink-0 items-center justify-center bg-mkt-accent-ink px-5 py-3 text-white sm:w-auto sm:py-2.5"
          >
            info@yetisgrup.com
          </a>
        </div>
      </Slab>

      <Slab className="mkt-pad">
        <Reveal>
          <p className="mkt-label text-mkt-green-text">Sık sorulanlar</p>
          <h2 className="mkt-h2 mt-3 max-w-xl text-balance text-mkt-ink">
            Bayiler için net cevaplar.
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-3 md:grid-cols-3 md:gap-4">
          {homeFaqs.map((faq) => (
            <div key={faq.question} className="rounded-[1.25rem] bg-mkt-card-muted p-5 md:p-6">
              <h3 className="text-[1.05rem] font-medium tracking-[-0.015em] text-mkt-ink">
                {faq.question}
              </h3>
              <p className="mkt-body mt-3 text-[13px]">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Slab>

      <Slab className="mkt-pad">
        <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="mkt-h2 text-balance text-mkt-ink">Bayi hesabınla siparişe başla.</h2>
            <p className="mkt-body mt-3 sm:mt-4">
              Hesabın yoksa satış ekibimizle iletişime geç; onay sonrası fiyat listesi ve limit
              tanımlanır.
            </p>
          </div>
          <PillCta
            href="/auth"
            variant="secondary"
            showArrow={false}
            className="w-full justify-center sm:w-auto"
          >
            İletişime Geç
          </PillCta>
        </div>
      </Slab>

      <SiteFooter />
    </Canvas>
  );
}
