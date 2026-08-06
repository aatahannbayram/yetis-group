import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ClipboardList,
  Leaf,
  MessageCircle,
  MessageCircleMore,
  Snowflake,
  Truck,
} from "lucide-react";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { PillCta } from "@/components/store/pill-cta";
import { AboutTabs } from "@/components/store/about-tabs";
import { Reveal } from "@/components/store/reveal";
import { HomeHero } from "@/components/store/home-hero";
import { HomeFaq } from "@/components/store/home-faq";
import { StoreCountUp } from "@/components/store/store-count-up";
import {
  JsonLdScript,
  faqPageJsonLd,
  localBusinessJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo/json-ld";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Toptan yöresel gıda | Bayi sipariş platformu",
  description:
    "Market, şarküteri, HORECA ve ara toptancılara toptan yöresel gıda. Onaylı bayi hesabıyla katalog, net fiyat listesi ve sipariş.",
  path: "/",
  image: "/hero-dairy.jpg",
});

const homeFaqs = [
  {
    question: "Kimlere satıyorsunuz?",
    answer:
      "Market, şarküteri, otel–restoran–kafe ve ara toptancıya. Son tüketiciye açık pazar değiliz; onaylı bayi hesabı gerekir.",
  },
  {
    question: "Ne alırım, nasıl güvenirim?",
    answer:
      "Peynir, yoğurt, süt, tereyağı ve daha fazlası. Listenizdeki fiyat net; SKT ve lot görünür. Soğuk giden ürün soğuk gider — SKT’si geçen sevk edilmez.",
  },
  {
    question: "Bayilik nasıl alınır?",
    answer:
      "Üye ol veya iletişim formunu doldur. Ekip inceler, onaylar; sonra fiyat listeniz açılır ve sipariş verebilirsiniz.",
  },
];

const aboutTabs = [
  {
    id: "hikaye",
    label: "Hikâye",
    title: "Çiftlikten tezgâha, arada güven.",
    body: "Üreticinin hikâyesini ve sizin raftaki ihtiyacınızı aynı yerde buluşturuyoruz. Temiz gıda, net fiyat, düzenli teslimat.",
  },
  {
    id: "nasil",
    label: "Nasıl çalışır",
    title: "Başvur, onaylan, sipariş ver.",
    body: "Hesap açılır, ekip inceler. Onaydan sonra katalog ve fiyat listeniz görünür; sepet ve limit de orada.",
  },
  {
    id: "neden",
    label: "Neden Yetiş",
    title: "SKT’si geçen gitmez, fiyatın listende kalır.",
    body: "Lot takibi, soğuk zincir ve sipariş anındaki fiyat kaydı. Geçmiş siparişiniz sonradan değişmez.",
  },
];

const capabilities: Array<{
  icon: typeof ClipboardList;
  title: string;
  description: string;
  image: string;
}> = [
  {
    icon: ClipboardList,
    title: "Sipariş",
    description: "Katalogdan sepete; limit dolunca sistem uyarır.",
    image: "/products/beyaz-peynir.jpg",
  },
  {
    icon: Snowflake,
    title: "Soğuk zincir",
    description: "SKT ve lot görünür. Süresi geçen ürün yola çıkmaz.",
    image: "/scenes/cold-chain.jpg",
  },
  {
    icon: Truck,
    title: "Teslimat",
    description: "Önce yakını biten lot seçilir; teslimat günü netleşir.",
    image: "/scenes/truck-close.jpg",
  },
  {
    icon: MessageCircleMore,
    title: "WhatsApp haber",
    description: "Sipariş ve sevkiyat güncellemeleri işletme hattından gelir.",
    image: "/scenes/whatsapp-desk.jpg",
  },
];

const productsPreview = [
  { src: "/products/kasar.jpg", name: "Kaşar", tag: "Olgun" },
  { src: "/products/yogurt.jpg", name: "Yoğurt", tag: "Günlük" },
  { src: "/products/tereyagi.jpg", name: "Tereyağı", tag: "Kırsal" },
  { src: "/products/sut.jpg", name: "Süt", tag: "Taze" },
];

const processTabs = [
  {
    id: "tedarik",
    label: "Tedarik",
    title: "Ürün önce kontrol edilir, sonra katalogda görünür.",
    body: "Üreticiden gelen her parti kayda girer. Siz yalnızca onaylı listeyi görürsünüz.",
    image: "/products/tulum.jpg",
  },
  {
    id: "siparis",
    label: "Sipariş",
    title: "Fiyat ve limit tek ekranda.",
    body: "Sepete ekleyin; kademe ve kampanya otomatik uygulanır. Onayda o anki fiyat kilitlenir.",
    image: "/scenes/warehouse.jpg",
  },
  {
    id: "sevkiyat",
    label: "Sevkiyat",
    title: "Önce yakını biten gider.",
    body: "Uygun lot seçilir, yola çıkar; durum WhatsApp’tan düşer. Cari hareket de aynı siparişle izlenir.",
    image: "/scenes/delivery.jpg",
  },
];

export default function StoreHomePage() {
  return (
    <Canvas>
      <JsonLdScript
        data={[
          websiteJsonLd(),
          organizationJsonLd(),
          localBusinessJsonLd(),
          faqPageJsonLd(homeFaqs.map(({ question, answer }) => ({ question, answer }))),
        ]}
      />

      <Slab className="relative overflow-hidden !p-0">
        <div className="absolute inset-x-0 top-0 z-20">
          <SiteHeader variant="overlay" />
        </div>
        <HomeHero />
      </Slab>

      <Slab id="hakkimizda" className="mkt-pad">
        <Reveal>
          <AboutTabs tabs={aboutTabs} />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PillCta href="/urunler" variant="secondary" showArrow={false} className="w-full justify-center sm:w-auto">
              Kataloğu İncele
            </PillCta>
            <Link
              href="/hakkimizda"
              className="mkt-pill inline-flex h-12 w-full items-center justify-center gap-2 border border-[color:var(--mkt-border)] px-5 text-[14px] font-semibold text-mkt-ink hover:bg-mkt-card-muted sm:h-11 sm:w-auto"
            >
              Hakkımızda
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-2.5 sm:gap-3 md:mt-14 md:grid-cols-4 md:gap-4">
          <Reveal delay={0}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem] md:rounded-[1.25rem]">
              <Image
                src="/products/lor.jpg"
                alt="Lor peyniri"
                fill
                quality={70}
                className="object-cover"
                sizes="(min-width: 768px) 22vw, 45vw"
              />
            </div>
          </Reveal>
          <Reveal delay={70}>
            <div className="relative flex aspect-[4/5] flex-col justify-between rounded-[1rem] bg-mkt-card-muted p-4 text-mkt-ink md:rounded-[1.25rem] md:p-6">
              <span className="ml-auto flex size-8 items-center justify-center rounded-full bg-mkt-accent-ink text-white md:size-9">
                <ArrowUpRight className="size-3.5 md:size-4" aria-hidden />
              </span>
              <div>
                <p className="mkt-stat text-[1.75rem] md:text-[inherit]">
                  <StoreCountUp value={20} suffix="+" />
                </p>
                <p className="mkt-label mt-2 opacity-80 md:mt-3">Yıllık tecrübe</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[1rem] bg-[var(--brand-700)] p-4 text-white md:rounded-[1.25rem] md:p-6">
              <Leaf className="absolute top-4 right-4 size-8 opacity-20" aria-hidden />
              <p className="mkt-label text-white/70">Üreticiden</p>
              <p className="mt-2 text-[1.15rem] font-medium tracking-[-0.02em]">Tezgâha güvenli zincir</p>
            </div>
          </Reveal>
          <Reveal delay={210}>
            <div className="relative flex aspect-[4/5] flex-col justify-between rounded-[1rem] bg-mkt-accent p-4 text-mkt-accent-ink md:rounded-[1.25rem] md:p-6">
              <span className="ml-auto flex size-8 items-center justify-center rounded-full bg-mkt-accent-ink text-white md:size-9">
                <ArrowUpRight className="size-3.5 md:size-4" aria-hidden />
              </span>
              <div>
                <p className="mkt-stat text-[1.75rem] md:text-[inherit]">
                  <StoreCountUp value={98} suffix="%" />
                </p>
                <p className="mkt-label mt-2 opacity-80 md:mt-3">Zamanında sevkiyat</p>
              </div>
            </div>
          </Reveal>
        </div>
      </Slab>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <Slab className="mkt-pad relative overflow-hidden !py-8 md:!py-10">
          <Reveal>
            <span className="mkt-pill mkt-label inline-flex border border-[color:var(--mkt-border)] px-3 py-1.5 text-mkt-ink-muted">
              Ne sunuyoruz
            </span>
            <h2 className="mkt-h2 mt-5 text-balance text-mkt-ink">
              Katalogdan sepete,{" "}
              <span className="rounded-md bg-[var(--brand-100)] px-1.5 text-mkt-green-text">tek yerden</span>{" "}
              sipariş.
            </h2>
            <p className="mkt-body mt-4 max-w-md">
              Fiyat listeniz, sepetiniz ve destek hattınız aynı platformda. Kağıt-fax yok.
            </p>
            <div className="mt-8">
              <PillCta
                href="/#cozumler"
                variant="secondary"
                showArrow={false}
                className="w-full justify-center sm:w-auto"
              >
                Neler var?
              </PillCta>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-[1.25rem]">
              <Image
                src="/scenes/offer-board.jpg"
                alt="Peynir tahtası — yöresel ürünler"
                fill
                quality={70}
                className="object-cover"
                sizes="(min-width: 1024px) 40vw, 90vw"
              />
            </div>
          </Reveal>
        </Slab>

        <Slab className="mkt-pad !py-8 md:!py-10">
          <Reveal>
            <AboutTabs tabs={processTabs} visual />
          </Reveal>
        </Slab>
      </div>

      <Slab id="cozumler" className="mkt-pad">
        <Reveal>
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <Leaf className="size-4 text-mkt-green-text" aria-hidden />
              <p className="mkt-label text-mkt-green-text">İşinizi kolaylaştıranlar</p>
            </div>
            <h2 className="mkt-h2 mt-3 text-balance text-mkt-ink">
              Sipariş, soğuk zincir, teslimat, haber.
            </h2>
            <p className="mkt-body mt-4">Hepsi bayi hesabınızda. Telefonda not tutmaya gerek yok.</p>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 md:mt-12 lg:grid-cols-4">
          {capabilities.map((item, i) => (
            <Reveal key={item.title} delay={i * 70}>
              <div className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-mkt-card-muted transition-transform duration-300 hover:-translate-y-0.5">
                <div className="relative aspect-[5/4] overflow-hidden">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    quality={70}
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
                  <p className="mt-2 text-[13px] leading-relaxed text-mkt-ink-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Slab>

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
            <h2 className="mkt-h2 mt-3 max-w-lg text-balance text-mkt-ink">Rafta işinize yarayanlar.</h2>
            <p className="mkt-body mt-3 max-w-md">Teneke, dilim, günlük… İhtiyaca göre seçin.</p>
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
                      quality={70}
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

      <Slab className="relative overflow-hidden !bg-[#0f1f17] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(48,163,105,0.18),transparent_55%)]"
        />
        <div className="mkt-pad relative py-10 md:py-14 lg:py-16">
          <Reveal>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
              <div className="max-w-xl">
                <p className="mkt-label text-mkt-accent">Destek</p>
                <h2 className="mkt-h2 mt-3 text-balance text-white">Takıldığın yerde yaz.</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-white/70 md:text-base">
                  Sipariş, numune veya bayilik — satış ekibi cevaplar. Formu doldur veya doğrudan ara.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <PillCta href="/iletisim" className="w-full justify-center sm:w-auto">
                  İletişime geç
                </PillCta>
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[14px] font-medium text-white/75 sm:justify-start">
                  <a
                    href={`https://wa.me/${SITE.phone.replace("+", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    <MessageCircle className="size-3.5 text-mkt-accent" aria-hidden />
                    WhatsApp
                  </a>
                  <a href={`tel:${SITE.phone}`} className="tabular-nums hover:text-white">
                    {SITE.phoneDisplay}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-8">
              {[
                { href: "/iletisim?konu=bayilik", label: "Bayilik" },
                { href: "/iletisim?konu=numune", label: "Numune" },
                { href: "/iletisim?konu=horeca", label: "HORECA" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="mkt-pill inline-flex items-center gap-1.5 border border-white/20 bg-white/5 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-white/10"
                >
                  {item.label}
                  <ArrowUpRight className="size-3.5 opacity-70" aria-hidden />
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </Slab>

      <Slab className="mkt-pad !py-8 md:!py-12">
        <Reveal>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="max-w-xl">
              <p className="mkt-label text-mkt-green-text">Sık sorulanlar</p>
              <h2 className="mkt-h2 mt-2 text-balance text-mkt-ink sm:mt-3">
                Bayilikten önce bilmen gerekenler.
              </h2>
              <p className="mt-2 hidden text-[15px] leading-relaxed text-mkt-ink-muted sm:mt-3 sm:block">
                Kimlere sattığımız, ürün güveni ve başvuru — kısa ve net.
              </p>
            </div>
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-1.5 self-start text-[14px] font-semibold text-mkt-green-text hover:underline sm:self-auto"
            >
              Başka soru?
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </Reveal>
        <div className="mt-5 sm:mt-7 md:mt-8">
          <HomeFaq items={homeFaqs} />
        </div>
      </Slab>

      {/* Bayi hesabı — product visual + clear dual CTA (no ghost card stack) */}
      <Slab className="overflow-hidden !p-0">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[220px] sm:min-h-[280px] lg:min-h-full">
            <Image
              src="/scenes/how-sales.jpg"
              alt=""
              fill
              quality={70}
              className="object-cover object-center"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#0c1812]/80 via-[#0c1812]/25 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#0c1812]/20 lg:to-[#0c1812]/90"
            />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:hidden">
              <p className="text-[1.2rem] font-semibold tracking-[-0.02em] text-white">
                Bayi hesabı
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-[#0c1812] px-5 py-8 text-white sm:px-8 sm:py-12 md:px-10 lg:px-12 lg:py-16">
            <Reveal>
              <p className="mkt-label hidden text-mkt-accent lg:block">Bayi hesabı</p>
              <h2 className="mkt-h2 mt-0 max-w-md text-balance text-white lg:mt-3">
                <span className="sm:hidden">Siparişe geç.</span>
                <span className="hidden sm:inline">Hesabın hazırsa siparişe geç.</span>
              </h2>
              <p className="mt-3 hidden max-w-md text-[15px] leading-relaxed text-white/75 sm:mt-4 sm:block">
                Üyelik başvurun incelenir; onaydan sonra fiyat listen açılır. Takıldığın yerde satış
                ekibine yazman yeterli.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-8">
                <PillCta href="/auth" className="w-auto min-w-[9.5rem]">
                  Giriş yap
                </PillCta>
                <Link
                  href="/auth?tab=uye"
                  className="text-[14px] font-semibold text-white/90 underline-offset-4 hover:text-white hover:underline"
                >
                  Üye ol
                </Link>
              </div>

              <p className="mt-5 text-[13px] text-white/55 sm:mt-6 sm:text-[14px]">
                <Link href="/urunler" className="font-medium text-white/80 underline-offset-2 hover:text-white hover:underline">
                  Katalog
                </Link>
                <span className="mx-2 text-white/25">·</span>
                <Link href="/iletisim" className="font-medium text-white/80 underline-offset-2 hover:text-white hover:underline">
                  İletişim
                </Link>
              </p>

              <ul className="mt-6 hidden gap-4 border-t border-white/10 pt-6 text-[13px] text-white/70 sm:mt-8 sm:flex">
                <li className="inline-flex items-center gap-2">
                  <Snowflake className="size-3.5 shrink-0 text-mkt-accent" aria-hidden />
                  SKT / lot
                </li>
                <li className="inline-flex items-center gap-2">
                  <ClipboardList className="size-3.5 shrink-0 text-mkt-accent" aria-hidden />
                  Net fiyat
                </li>
                <li className="inline-flex items-center gap-2">
                  <MessageCircleMore className="size-3.5 shrink-0 text-mkt-accent" aria-hidden />
                  WhatsApp
                </li>
              </ul>
            </Reveal>
          </div>
        </div>
      </Slab>

      <SiteFooter />
    </Canvas>
  );
}
