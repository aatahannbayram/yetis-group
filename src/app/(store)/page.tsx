import Link from "next/link";
import {
  ArrowUpRight,
  ClipboardList,
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
import { SupportStrip } from "@/components/store/support-strip";
import { SceneImage } from "@/components/store/scene-image";
import {
  JsonLdScript,
  faqPageJsonLd,
  localBusinessJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo/json-ld";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getImage } from "@/content/images";
import type { ImageSlotId } from "@/content/images";

export const metadata: Metadata = buildPageMetadata({
  title: "Toptan yöresel gıda | Bayi sipariş platformu",
  description:
    "Market, şarküteri, HORECA ve ara toptancılara toptan yöresel gıda. Onaylı bayi hesabıyla katalog, net fiyat listesi ve sipariş.",
  path: "/",
  image: getImage("hero").src,
});

const homeFaqs = [
  {
    question: "Kimlere satıyorsunuz?",
    answer:
      "Market, şarküteri, otel–restoran–kafe ve ara toptancıya. Son tüketiciye açık pazar değiliz; onaylı bayi hesabı gerekir.",
  },
  {
    question: "Minimum sipariş var mı?",
    answer:
      "Ürün ve bölgeye göre değişir. Onaylı hesabınızda sepet ve limit görünür; ilk siparişte satış ekibi yönlendirir.",
  },
  {
    question: "Hangi bölgelere, hangi günler teslimat var?",
    answer:
      "Soğuk zincir nedeniyle bölge × gün kısıtı vardır. Kapalı gün seçilemez; hesabınızda uygun günler listelenir.",
  },
  {
    question: "Ödeme ve vade nasıl işler?",
    answer:
      "Vadeli çalışılır. Kredi limiti ve cari hesabınız panelden izlenir; limit aşımında sistem uyarır.",
  },
  {
    question: "SKT ve soğuk zincir nasıl garanti?",
    answer:
      "Her stok hareketi lota bağlıdır. Sevkiyat FEFO ile önerilir; SKT’si geçmiş lot sevk edilmez.",
  },
  {
    question: "Numune alabilir miyim?",
    answer:
      "Evet. İletişim formundan numune talebi bırakın veya WhatsApp’tan yazın; ekip planlar.",
  },
  {
    question: "Sertifika ve private label mümkün mü?",
    answer:
      "Ürün sertifikaları talep üzerine paylaşılır. Private label / özel ambalaj için satış ekibiyle konuşun.",
  },
  {
    question: "Fiyat listesi ne sıklıkla güncellenir?",
    answer:
      "Liste tarihli ve grubunuza özeldir. Sipariş anındaki fiyat satıra kilitlenir; geçmiş siparişiniz sonradan değişmez.",
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
  imageSlot: ImageSlotId;
}> = [
  {
    icon: ClipboardList,
    title: "Sipariş",
    description: "Katalogdan sepete; limit dolunca sistem uyarır.",
    imageSlot: "cap-order",
  },
  {
    icon: Snowflake,
    title: "Soğuk zincir",
    description: "SKT ve lot görünür. Süresi geçen ürün yola çıkmaz.",
    imageSlot: "cap-cold",
  },
  {
    icon: Truck,
    title: "Teslimat",
    description: "Önce yakını biten lot seçilir; teslimat günü netleşir.",
    imageSlot: "cap-delivery",
  },
  {
    icon: MessageCircleMore,
    title: "WhatsApp haber",
    description: "Sipariş ve sevkiyat güncellemeleri işletme hattından gelir.",
    imageSlot: "cap-whatsapp",
  },
];

const productsPreview: Array<{ slot: ImageSlotId; name: string; tag: string }> = [
  { slot: "cat-kasar", name: "Kaşar", tag: "Olgun" },
  { slot: "cat-yogurt", name: "Yoğurt", tag: "Günlük" },
  { slot: "cat-tereyagi", name: "Tereyağı", tag: "Kırsal" },
  { slot: "cat-sut", name: "Süt", tag: "Taze" },
];

const processTabs = [
  {
    id: "tedarik",
    label: "Tedarik",
    title: "Ürün önce kontrol edilir, sonra katalogda görünür.",
    body: "Üreticiden gelen her parti kayda girer. Siz yalnızca onaylı listeyi görürsünüz.",
    imageSlot: "process-tedarik" as const,
  },
  {
    id: "siparis",
    label: "Sipariş",
    title: "Fiyat ve limit tek ekranda.",
    body: "Sepete ekleyin; kademe ve kampanya otomatik uygulanır. Onayda o anki fiyat kilitlenir.",
    imageSlot: "process-siparis" as const,
  },
  {
    id: "sevkiyat",
    label: "Sevkiyat",
    title: "Önce yakını biten gider.",
    body: "Uygun lot seçilir, yola çıkar; durum WhatsApp’tan düşer. Cari hareket de aynı siparişle izlenir.",
    imageSlot: "process-sevkiyat" as const,
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
              className="mkt-pill inline-flex h-12 w-full items-center justify-center gap-2 border border-[color:var(--mkt-border)] px-5 text-[14px] font-semibold text-mkt-ink hover:bg-mkt-card-muted sm:w-auto"
            >
              Hakkımızda
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-2.5 sm:gap-3 md:mt-14 md:grid-cols-4 md:gap-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem] md:rounded-[1.25rem]">
            <SceneImage id="stat-a" fill quality={55} sizes="(min-width: 768px) 22vw, 45vw" />
          </div>
          <div className="relative flex aspect-[4/5] flex-col justify-between rounded-[1rem] bg-mkt-card-muted p-4 text-mkt-ink md:rounded-[1.25rem] md:p-6">
            <span className="ml-auto flex size-8 items-center justify-center rounded-full bg-mkt-accent-ink text-white md:size-9">
              <ArrowUpRight className="size-3.5 md:size-4" aria-hidden />
            </span>
            <div>
              <p className="mkt-stat text-[1.75rem] md:text-[inherit]">20+</p>
              <p className="mkt-label mt-2 opacity-80 md:mt-3">Yıllık tecrübe</p>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem] md:rounded-[1.25rem]">
            <SceneImage id="stat-b" fill quality={55} sizes="(min-width: 768px) 22vw, 45vw" />
          </div>
          <div className="relative flex aspect-[4/5] flex-col justify-between rounded-[1rem] bg-mkt-accent p-4 text-mkt-accent-ink md:rounded-[1.25rem] md:p-6">
            <span className="ml-auto flex size-8 items-center justify-center rounded-full bg-mkt-accent-ink text-white md:size-9">
              <ArrowUpRight className="size-3.5 md:size-4" aria-hidden />
            </span>
            <div>
              <p className="mkt-stat text-[1.75rem] md:text-[inherit]">98%</p>
              <p className="mkt-label mt-2 opacity-80 md:mt-3">Zamanında sevkiyat</p>
            </div>
          </div>
        </div>
      </Slab>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <Slab className="mkt-pad relative overflow-hidden !py-8 md:!py-10">
          <Reveal>
            <span className="mkt-section-label">Ne sunuyoruz</span>
            <h2 className="mkt-h2 mt-5 text-balance text-mkt-ink">
              Katalogdan sepete,{" "}
              <span className="rounded-md bg-mkt-accent px-1.5 text-mkt-accent-ink">tek yerden</span>{" "}
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
              <SceneImage
                id="offer-board"
                fill
                quality={70}
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
            <p className="mkt-section-label">İşinizi kolaylaştıranlar</p>
            <h2 className="mkt-h2 mt-3 text-balance text-mkt-ink">
              Sipariş, soğuk zincir, teslimat, haber.
            </h2>
            <p className="mkt-body mt-4">Hepsi bayi hesabınızda. Telefonda not tutmaya gerek yok.</p>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 md:mt-12 lg:grid-cols-4">
          {capabilities.map((item, i) => (
            <Reveal key={item.title} delay={i * 70}>
              <div className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-mkt-card-muted transition-transform duration-[var(--mkt-motion-hover)] hover:-translate-y-1">
                <div className="relative aspect-[5/4] overflow-hidden">
                  <SceneImage
                    id={item.imageSlot}
                    fill
                    quality={70}
                    className="transition-transform duration-500 group-hover:scale-[1.04]"
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
            <p className="mkt-section-label">Katalog</p>
            <h2 className="mkt-h2 mt-3 max-w-lg text-balance text-mkt-ink">Rafta işinize yarayanlar.</h2>
            <p className="mkt-body mt-3 max-w-md">Teneke, dilim, günlük… İhtiyaca göre seçin.</p>
          </Reveal>
          <div className="mkt-rail relative mt-8 md:mt-12">
            {productsPreview.map((product, i) => (
              <Reveal key={product.name} delay={i * 60}>
                <Link href="/urunler" className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[1rem] md:rounded-[1.25rem]">
                    <SceneImage
                      id={product.slot}
                      fill
                      quality={70}
                      className="transition-transform duration-500 group-hover:scale-105"
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
        <SupportStrip />
      </Slab>

      <Slab className="mkt-pad !py-8 md:!py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-start lg:gap-10">
          <Reveal>
            <p className="mkt-section-label">Sık sorulanlar</p>
            <h2 className="mkt-h2 mt-2 text-balance text-mkt-ink sm:mt-3">
              Bayilikten önce bilmen gerekenler.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-mkt-ink-muted">
              Min sipariş, bölge/gün, vade, SKT ve başvuru: kısa ve net.
            </p>
            <div className="relative mt-6 hidden aspect-[4/5] overflow-hidden rounded-[1.25rem] lg:block">
              <SceneImage id="partner-kitchen" fill sizes="(min-width: 1024px) 28vw, 90vw" />
            </div>
            <Link
              href="/iletisim"
              className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-mkt-green-text hover:underline"
            >
              Başka soru?
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </Reveal>
          <Reveal delay={60}>
            <HomeFaq items={homeFaqs} />
          </Reveal>
        </div>
      </Slab>

      {/* Final bayi CTA — ~55/45 */}
      <Slab className="overflow-hidden !p-0">
        <div className="grid lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]">
          <div className="relative min-h-[240px] sm:min-h-[300px] lg:min-h-[420px]">
            <SceneImage
              id="cta-final"
              fill
              quality={75}
              className="object-center"
              sizes="(min-width: 1024px) 55vw, 100vw"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#0c1812]/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0c1812]/40"
            />
          </div>

          <div className="flex flex-col justify-center bg-[#0c1812] px-5 py-10 text-white sm:px-8 sm:py-12 md:px-10 lg:px-12 lg:py-16">
            <Reveal>
              <p className="mkt-section-label !text-mkt-accent">Bayilik</p>
              <h2 className="mkt-h2 mt-3 max-w-md text-balance text-white">
                Bayi hesabınla siparişe başla.
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/75">
                Başvurun incelenir; onaydan sonra fiyat listen açılır. Takıldığın yerde satış ekibine yaz.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <PillCta href="/auth?tab=uye" className="w-full justify-center sm:w-auto">
                  Bayi başvurusu yap
                </PillCta>
                <Link
                  href="/iletisim?konu=bayilik"
                  className="text-center text-[14px] font-semibold text-white/85 underline-offset-4 hover:text-white hover:underline sm:text-left"
                >
                  veya satış ekibimizle konuşun
                </Link>
              </div>

              <ul className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] text-white/75 sm:flex-row sm:flex-wrap sm:gap-x-6">
                <li className="inline-flex items-center gap-2">
                  <Snowflake className="size-3.5 shrink-0 text-mkt-accent" aria-hidden />
                  SKT / lot görünür
                </li>
                <li className="inline-flex items-center gap-2">
                  <ClipboardList className="size-3.5 shrink-0 text-mkt-accent" aria-hidden />
                  Net fiyat listesi
                </li>
                <li className="inline-flex items-center gap-2">
                  <MessageCircleMore className="size-3.5 shrink-0 text-mkt-accent" aria-hidden />
                  WhatsApp güncelleme
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
