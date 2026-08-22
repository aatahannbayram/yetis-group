import Link from "next/link";
import {
  ArrowUpRight,
  ClipboardList,
  MessageCircleMore,
  Snowflake,
  Truck,
} from "lucide-react";
import { SiteFooter } from "@/components/store/site-footer";
import { Canvas, Slab } from "@/components/store/slab";
import { PillCta } from "@/components/store/pill-cta";
import { AboutTabs } from "@/components/store/about-tabs";
import { HomeHero } from "@/components/store/home-hero";
import { HomeFaq } from "@/components/store/home-faq";
import { SupportStrip } from "@/components/store/support-strip";
import { SceneImage } from "@/components/store/scene-image";
import { ProductTiltCard } from "@/components/store/product-tilt-card";
import { StatCounter } from "@/components/store/stat-counter";
import { PlatformShowcase } from "@/components/store/platform-showcase";
import { WeeklyAnnouncements } from "@/components/store/weekly-announcements";
import { ScrollItem, ScrollReveal, ScrollStagger } from "@/components/store/scroll-reveal";
import { listPublishedAnnouncements } from "@/infra/db/campaigns";
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
  title: "Toptan peynir | Bayi sipariş platformu",
  description:
    "Market, şarküteri ve HORECA için toptan beyaz peynir, kaşar, tulum. Onaylı bayi hesabıyla katalog, net fiyat listesi ve sipariş.",
  path: "/",
  image: getImage("home-hero-portrait").src,
});

const homeFaqs = [
  {
    question: "Kimlere satıyorsunuz?",
    answer:
      "Market, şarküteri, otel–restoran–kafe ve ara toptancıya. Son tüketiciye açık pazar değiliz; onaylı hesap gerekir.",
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

const storyColumns = [
  {
    title: "Hikâye",
    body: "Meradan tezgâha, arada güven. Üreticinin peynirini sizin reyonunuza taşıyoruz: temiz gıda, net fiyat, düzenli teslimat.",
  },
  {
    title: "Nasıl çalışır",
    body: "Başvurunuz incelenir. Onaydan sonra katalog, fiyat listesi ve kredi limiti aynı hesapta açılır; sipariş lot ve SKT ile yürür.",
  },
];

const capabilities: Array<{
  icon: typeof ClipboardList;
  title: string;
  description: string;
}> = [
  {
    icon: ClipboardList,
    title: "Sipariş",
    description: "Katalogdan sepete; limit dolunca sistem uyarır.",
  },
  {
    icon: Snowflake,
    title: "Soğuk zincir",
    description: "SKT ve lot görünür. Süresi geçen peynir yola çıkmaz.",
  },
  {
    icon: Truck,
    title: "Teslimat",
    description: "Önce yakını biten lot seçilir; teslimat günü netleşir.",
  },
  {
    icon: MessageCircleMore,
    title: "WhatsApp haber",
    description: "Sipariş ve sevkiyat güncellemeleri işletme hattından gelir.",
  },
];

const productsPreview: Array<{
  slot: ImageSlotId;
  name: string;
  tag: string;
  note: string;
}> = [
  {
    slot: "cat-beyaz",
    name: "Beyaz peynir",
    tag: "Teneke",
    note: "Tezgâh ve HORECA için klasik teneke.",
  },
  {
    slot: "cat-kasar",
    name: "Kaşar",
    tag: "Olgun",
    note: "Dilim ve teker; raf ömrü net.",
  },
  {
    slot: "cat-tulum",
    name: "Tulum",
    tag: "Kırsal",
    note: "Kırsal üretim, şarküteri rafı.",
  },
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

export default async function StoreHomePage() {
  const announcements = await listPublishedAnnouncements();

  return (
    <>
      <JsonLdScript
        data={[
          websiteJsonLd(),
          organizationJsonLd(),
          localBusinessJsonLd(),
          faqPageJsonLd(homeFaqs.map(({ question, answer }) => ({ question, answer }))),
        ]}
      />

      <HomeHero />
      <WeeklyAnnouncements items={announcements} />

      <Canvas>
      <Slab id="hakkimizda" className="relative overflow-hidden !p-0">
        <div className="grid lg:grid-cols-2 lg:min-h-[36rem]">
          <div className="relative min-h-[280px] overflow-hidden sm:min-h-[340px] lg:min-h-full">
            <ScrollReveal from="scale" className="absolute inset-0">
              <SceneImage
                id="story-field"
                fill
                quality={60}
                className="object-center"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </ScrollReveal>
          </div>
          <div className="relative z-10 flex flex-col justify-center bg-white mkt-pad">
            <ScrollReveal from="right">
              <p className="mkt-section-label">Hakkımızda</p>
              <h2 className="mkt-h2 mt-3 max-w-lg text-balance text-mkt-ink">
                Çiftlikten tezgâha, arada güven.
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-8">
                {storyColumns.map((col) => (
                  <div key={col.title}>
                    <p className="text-[13px] font-semibold tracking-[-0.01em] text-mkt-green-text">
                      {col.title}
                    </p>
                    <p className="mt-2 text-[14px] leading-relaxed text-mkt-ink-muted">{col.body}</p>
                  </div>
                ))}
              </div>
              <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-[color:var(--mkt-border)] pt-6">
                <div>
                  <dt className="mkt-label text-mkt-ink-muted">Yıllık tecrübe</dt>
                  <dd className="mkt-stat mt-1 text-[1.75rem] text-mkt-ink">
                    <StatCounter value={20} suffix="+" />
                  </dd>
                </div>
                <div>
                  <dt className="mkt-label text-mkt-ink-muted">Zamanında sevkiyat</dt>
                  <dd className="mkt-stat mt-1 text-[1.75rem] text-mkt-ink">
                    <StatCounter value={98} suffix="%" />
                  </dd>
                </div>
              </dl>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <PillCta href="/urunler" className="w-full justify-center sm:w-auto">
                  Kataloğu İncele
                </PillCta>
                <PillCta
                  href="/hakkimizda"
                  variant="secondary"
                  className="w-full justify-center sm:w-auto"
                >
                  Hakkımızda
                </PillCta>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </Slab>

      <Slab className="mkt-pad">
        <PlatformShowcase />
      </Slab>

      <Slab className="relative overflow-hidden !p-0">
        <div className="grid lg:grid-cols-2 lg:min-h-[36rem]">
          <div className="flex flex-col justify-center mkt-pad">
            <ScrollReveal from="left">
              <span className="mkt-section-label">Ne sunuyoruz</span>
              <h2 className="mkt-h2 mt-3 text-balance text-mkt-ink">
                Beyaz peynirden kaşara,{" "}
                <span className="rounded-md bg-mkt-accent px-1.5 text-mkt-accent-ink">
                  tek yerden
                </span>{" "}
                sipariş.
              </h2>
              <p className="mkt-body mt-4 max-w-md">
                Teneke, dilim, tulum: fiyat listeniz, sepetiniz ve destek hattınız aynı platformda.
              </p>
              <div className="mt-8">
                <PillCta href="/#cozumler" className="w-full justify-center sm:w-auto">
                  Neler var?
                </PillCta>
              </div>
            </ScrollReveal>
          </div>
          <div className="relative min-h-[280px] overflow-hidden sm:min-h-[340px] lg:min-h-full">
            <ScrollReveal from="scale" className="absolute inset-0">
              <SceneImage
                id="offer-board"
                fill
                quality={55}
                className="object-center"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </ScrollReveal>
          </div>
        </div>
      </Slab>

      <Slab className="relative overflow-hidden !p-0">
        <ScrollReveal className="h-full">
          <AboutTabs tabs={processTabs} visual imageSide="start" />
        </ScrollReveal>
      </Slab>

      <Slab id="cozumler" className="relative overflow-hidden !p-0">
        <div className="relative min-h-[440px] overflow-hidden sm:min-h-[500px] lg:min-h-[560px]">
          <ScrollReveal from="scale" className="absolute inset-0">
            <SceneImage id="hero" fill quality={65} className="object-center" sizes="100vw" />
          </ScrollReveal>
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#071711]/88 via-[#071711]/35 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 z-10 px-5 py-10 sm:px-8 sm:py-12 md:px-12 md:py-14 lg:px-14 lg:py-16">
            <ScrollReveal>
              <p className="mkt-section-label !text-mkt-accent">İşinizi kolaylaştıranlar</p>
              <h2 className="mkt-h2 mt-3 max-w-lg text-balance text-white">
                Peyniriniz yola çıkmadan netleşir.
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/75">
                Lot, SKT, teslimat günü ve WhatsApp: hepsi bayi hesabınızda.
              </p>
            </ScrollReveal>
            <ScrollStagger className="mt-8 flex flex-col gap-3 border-t border-white/15 pt-6 text-[13px] text-white/80 sm:flex-row sm:flex-wrap sm:gap-x-7">
              {capabilities.map((item) => (
                <ScrollItem key={item.title}>
                  <span className="inline-flex items-center gap-2">
                    <item.icon className="size-3.5 shrink-0 text-mkt-accent" aria-hidden />
                    {item.title}
                  </span>
                </ScrollItem>
              ))}
            </ScrollStagger>
          </div>
        </div>
      </Slab>

      <Slab className="relative overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
          <ScrollReveal>
            <div className="mx-auto max-w-lg text-center">
              <p className="mkt-section-label">Katalog</p>
              <h2 className="mkt-h2 mt-2 text-balance text-mkt-ink">Raftaki peynirler.</h2>
              <p className="mkt-body mx-auto mt-2 max-w-md text-[14px] md:text-[15px]">
                Teneke beyaz, olgun kaşar, kırsal tulum. İhtiyaca göre seçin.
              </p>
            </div>
          </ScrollReveal>
          <ScrollStagger className="mt-7 grid gap-5 sm:mt-8 md:grid-cols-3 md:items-start md:gap-6">
            {productsPreview.map((product) => (
              <ScrollItem key={product.name}>
                <ProductTiltCard
                  href="/urunler"
                  slot={product.slot}
                  tag={product.tag}
                  name={product.name}
                  note={product.note}
                />
              </ScrollItem>
            ))}
          </ScrollStagger>
          <ScrollReveal delay={0.12} className="mt-8 flex justify-center">
            <PillCta href="/urunler" className="w-full justify-center sm:w-auto">
              Tüm Ürünler
            </PillCta>
          </ScrollReveal>
        </div>
      </Slab>

      <Slab className="overflow-hidden !bg-[#0c1612] text-white">
        <SupportStrip />
      </Slab>

      <Slab className="mkt-pad">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:gap-14 xl:gap-20">
          <ScrollReveal from="left" className="lg:sticky lg:top-28 lg:self-start">
            <p className="mkt-section-label">Sık sorulanlar</p>
            <h2 className="mkt-h2 mt-3 max-w-[16ch] text-balance text-mkt-ink">
              Hesap açmadan önce bilmen gerekenler.
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-mkt-ink-muted">
              Min sipariş, bölge/gün, vade, SKT ve başvuru: kısa ve net.
            </p>
            <Link
              href="/iletisim"
              className="mt-8 inline-flex items-center gap-1.5 text-[14px] font-semibold text-mkt-green-text underline-offset-4 hover:underline"
            >
              Başka soru?
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </ScrollReveal>
          <ScrollReveal from="right" delay={0.08} className="min-w-0">
            <HomeFaq items={homeFaqs} />
          </ScrollReveal>
        </div>
      </Slab>

      {/* Final bayi CTA, ~55/45 */}
      <Slab className="overflow-hidden !p-0">
        <div className="grid lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]">
          <div className="relative min-h-[240px] overflow-hidden sm:min-h-[300px] lg:min-h-[420px]">
            <ScrollReveal from="scale" className="absolute inset-0">
              <SceneImage
                id="cta-final"
                fill
                quality={60}
                className="object-center"
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
            </ScrollReveal>
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#0c1812]/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0c1812]/40"
            />
          </div>

          <div className="flex flex-col justify-center bg-[#0c1812] px-5 py-10 text-white sm:px-8 sm:py-12 md:px-10 lg:px-12 lg:py-16">
            <ScrollReveal from="right">
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
            </ScrollReveal>
          </div>
        </div>
      </Slab>

      <SiteFooter />
      </Canvas>
    </>
  );
}
