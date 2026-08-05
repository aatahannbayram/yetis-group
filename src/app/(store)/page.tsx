import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { Reveal } from "@/components/store/reveal";

const buyerSegments = ["Market", "Şarküteri", "HORECA", "Ara Toptancı"];

const valueProps = [
  {
    index: "01",
    title: "Cari ve kredi limiti şeffaf",
    description:
      "Bakiyeni ve açık siparişlerini her an gör. Limit aşımı sipariş anında engellenir, sürpriz olmaz.",
  },
  {
    index: "02",
    title: "SKT ve soğuk zincir kontrollü",
    description:
      "Sevkiyat FEFO ile önerilir; son kullanma tarihi geçmiş lot hiçbir zaman sevk edilmez.",
  },
  {
    index: "03",
    title: "WhatsApp'tan takip",
    description:
      "Sipariş onayı, sevkiyat ve fatura bildirimleri WhatsApp Business üzerinden anlık ulaşır.",
  },
  {
    index: "04",
    title: "Fiyat listesi sabit kalır",
    description:
      "Sipariş anındaki birim fiyat, iskonto ve KDV oranı satıra kopyalanır; liste değişse de geçmiş bozulmaz.",
  },
];

const steps = [
  {
    step: "01",
    title: "Bayi hesabınla giriş yap",
    description: "Yetkili, satın alma, muhasebe veya depo rolünle güvenli giriş.",
  },
  {
    step: "02",
    title: "Hızlı sipariş oluştur",
    description: "Kayıtlı görünümler ve kısayollarla dakikalar içinde sepeti tamamla.",
  },
  {
    step: "03",
    title: "Onay ve sevkiyatı izle",
    description: "Sipariş durumunu ve irsaliyeni tek ekrandan, uçtan uca takip et.",
  },
];

export default function StoreHomePage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="grid items-center gap-16 lg:grid-cols-[1fr_0.92fr] lg:gap-20">
            <Reveal>
              <p className="mb-6 text-caption leading-caption font-semibold tracking-[0.18em] text-brand-600 uppercase">
                B2B Bayi Platformu
              </p>
              <h1 className="text-display leading-display font-semibold tracking-tight text-balance text-neutral-900">
                Temiz gıdaya eriş,
                <br />
                <span className="text-brand-700">sağlıklı yetiş.</span>
              </h1>
              <p className="mt-7 max-w-md text-body-lg leading-body-lg font-light text-neutral-600">
                Market, şarküteri, HORECA ve ara toptancılar için Yetiş
                Grup&apos;un peynir ve süt ürünleri katalogunu tek yerden
                sipariş edin.
              </p>

              <p className="mt-8 text-body-sm leading-body-sm text-neutral-400">
                {buyerSegments.join("  ·  ")}
              </p>

              <div className="mt-12 flex flex-wrap items-center gap-5">
                <Button asChild size="lg" className="h-11 rounded-2xl px-7 text-base">
                  <Link href="/auth">Bayi Girişi Yap</Link>
                </Button>
                <a
                  href="#nasil-calisir"
                  className="text-body font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-700"
                >
                  Nasıl çalışır?
                </a>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="overflow-hidden rounded-3xl border border-neutral-200">
                <Image
                  src="/hero-dairy.jpg"
                  alt="Yetiş Grup peynir ve süt ürünleri"
                  width={1127}
                  height={1400}
                  className="h-auto w-full object-cover"
                  priority
                  sizes="(min-width: 1024px) 44vw, 90vw"
                />
              </div>
              <p className="mt-4 text-caption leading-caption text-neutral-400">
                Soğuk zincir &amp; FEFO kontrollü sevkiyat
              </p>
            </Reveal>
          </div>
        </section>

        {/* Value props */}
        <section id="neden-yetis" className="border-t border-neutral-200">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <Reveal>
              <p className="text-caption leading-caption font-semibold tracking-[0.18em] text-brand-600 uppercase">
                Neden Yetiş Grup
              </p>
              <h2 className="mt-4 max-w-xl text-h2 leading-h2 font-semibold text-neutral-900">
                Bayilik ilişkinizi kağıt ve telefon trafiğinden kurtarın.
              </h2>
            </Reveal>

            <div className="mt-16 divide-y divide-neutral-200 border-t border-neutral-200">
              {valueProps.map(({ index, title, description }, i) => (
                <Reveal key={title} delay={i * 80}>
                  <div className="grid grid-cols-1 gap-3 py-10 md:grid-cols-[5rem_1fr_2fr] md:items-baseline md:gap-10">
                    <span className="tabular-nums text-h1 leading-h1 font-bold text-brand-100">
                      {index}
                    </span>
                    <h3 className="text-h4 leading-h4 font-semibold text-neutral-900">
                      {title}
                    </h3>
                    <p className="text-body leading-body font-light text-neutral-600">
                      {description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Nasıl çalışır */}
        <section id="nasil-calisir" className="border-t border-neutral-200">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <Reveal>
              <p className="text-caption leading-caption font-semibold tracking-[0.18em] text-brand-600 uppercase">
                Nasıl çalışır
              </p>
              <h2 className="mt-4 text-h2 leading-h2 font-semibold text-neutral-900">
                Üç adımda sipariş
              </h2>
            </Reveal>
            <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
              {steps.map(({ step, title, description }, i) => (
                <Reveal key={step} delay={i * 90} className="border-t border-neutral-900 pt-5">
                  <span className="tabular-nums text-h1 leading-h1 font-bold text-brand-100">
                    {step}
                  </span>
                  <h3 className="mt-4 text-h4 leading-h4 font-semibold text-neutral-900">
                    {title}
                  </h3>
                  <p className="mt-2 text-body leading-body font-light text-neutral-600">
                    {description}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-neutral-200 bg-brand-700">
          <div className="mx-auto max-w-6xl px-6 py-24 text-center md:py-28">
            <h2 className="mx-auto max-w-lg text-h2 leading-h2 font-semibold text-white">
              Bayi hesabınla hemen sipariş vermeye başla.
            </h2>
            <p className="mt-4 text-body-lg leading-body-lg font-light text-brand-50">
              Hesabın yoksa Yetiş Grup satış ekibinle iletişime geç.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-10 h-11 rounded-2xl bg-white px-7 text-base text-brand-700 hover:bg-brand-50"
            >
              <Link href="/auth">Bayi Girişi</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
