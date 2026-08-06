import Image from "next/image";
import Link from "next/link";
import { MessageCircleMore, Snowflake, Wallet } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { SignInForm } from "@/components/store/sign-in-form";
import { Canvas, Slab } from "@/components/store/slab";

const features = [
  {
    icon: Wallet,
    title: "Cari ve kredi limiti",
    text: "Bakiyeni ve açık siparişlerini her an gör.",
  },
  {
    icon: Snowflake,
    title: "SKT ve soğuk zincir",
    text: "Süresi geçen lot sevk edilmez; FEFO önerilir.",
  },
  {
    icon: MessageCircleMore,
    title: "WhatsApp takip",
    text: "Sipariş ve sevkiyat bildirimleri anlık ulaşır.",
  },
];

export default function AuthPage() {
  return (
    <Canvas className="min-h-screen">
      <div className="grid flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <Slab className="relative hidden min-h-[70vh] overflow-hidden lg:block">
          <Image
            src="/hero-dairy.jpg"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="50vw"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/25"
          />
          <div className="relative z-10 flex h-full min-h-[70vh] flex-col justify-between p-10 xl:p-12">
            <Link href="/">
              <Logo variant="dark" size="xl" className="brightness-0 invert" />
            </Link>
            <div className="max-w-md">
              <span className="mkt-pill mkt-label inline-flex bg-white/15 px-4 py-1.5 text-white backdrop-blur-md">
                B2B Bayi Platformu
              </span>
              <h1 className="mkt-display mt-5 text-balance text-white">
                Temiz gıdaya eriş, sağlıklı yetiş.
              </h1>
              <ul className="mt-8 space-y-3">
                {features.map(({ icon: Icon, title, text }) => (
                  <li
                    key={title}
                    className="flex gap-3 rounded-[1.25rem] border border-white/20 bg-white/10 p-4 text-white backdrop-blur-md"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-mkt-accent text-mkt-accent-ink">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-[15px] font-medium tracking-[-0.01em]">{title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-white/75">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Slab>

        <Slab className="flex flex-col justify-center px-6 py-10 md:px-10 md:py-14">
          <Link href="/" className="mb-8 lg:hidden">
            <Logo size="xl" />
          </Link>

          <p className="mkt-label text-mkt-green-text">Bayi hesabı</p>
          <h2 className="mkt-h2 mt-3 text-mkt-ink">Giriş yap</h2>
          <p className="mkt-body mt-3 max-w-sm">
            Hesabınızla giriş yapın; fiyat listeniz ve siparişleriniz sizi bekliyor.
          </p>

          <div className="mt-8 max-w-sm">
            <SignInForm />
          </div>

          <p className="mkt-body mt-8 max-w-sm text-[13px]">
            Giriş yaparak{" "}
            <Link href="/yasal/kullanim-kosullari" className="text-mkt-green-text underline-offset-2 hover:underline">
              Kullanım Koşulları
            </Link>
            ,{" "}
            <Link
              href="/yasal/bayi-uyelik-sozlesmesi"
              className="text-mkt-green-text underline-offset-2 hover:underline"
            >
              Bayi Üyelik Sözleşmesi
            </Link>{" "}
            ve{" "}
            <Link href="/yasal/kvkk-aydinlatma" className="text-mkt-green-text underline-offset-2 hover:underline">
              KVKK Aydınlatma
            </Link>{" "}
            metinlerini kabul etmiş olursunuz.
          </p>

          <p className="mkt-label mt-10 text-mkt-ink-muted">
            Hesabınız yok mu? Satış ekibimizle iletişime geçin ·{" "}
            <a href="mailto:info@yetisgrup.com" className="text-mkt-ink hover:underline">
              info@yetisgrup.com
            </a>
          </p>
        </Slab>
      </div>
    </Canvas>
  );
}
