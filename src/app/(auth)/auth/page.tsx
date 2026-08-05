import Image from "next/image";
import Link from "next/link";
import { MessageCircleMore, Snowflake, Wallet } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { SignInForm } from "@/components/store/sign-in-form";

const features = [
  {
    icon: Wallet,
    title: "Cari ve kredi limiti şeffaf",
    text: "Bakiyeni ve açık siparişlerini her an gör.",
  },
  {
    icon: Snowflake,
    title: "SKT ve soğuk zincir kontrollü",
    text: "Sevkiyat FEFO ile önerilir, süresi geçen lot sevk edilmez.",
  },
  {
    icon: MessageCircleMore,
    title: "WhatsApp'tan takip",
    text: "Sipariş ve sevkiyat bildirimleri anlık ulaşır.",
  },
];

export default function AuthPage() {
  const year = new Date().getFullYear();

  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Left: brand panel */}
      <aside className="relative hidden overflow-hidden lg:flex lg:min-h-screen lg:flex-col">
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
          className="absolute inset-0 bg-gradient-to-br from-brand-900/90 via-brand-800/75 to-brand-900/60"
        />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
          <Logo variant="dark" />

          <div className="max-w-md">
            <p className="text-caption leading-caption font-semibold tracking-[0.18em] text-brand-100 uppercase">
              B2B Bayi Platformu
            </p>
            <h1 className="mt-4 text-h1 leading-h1 font-semibold text-white">
              Temiz gıdaya eriş, sağlıklı yetiş.
            </h1>

            <ul className="mt-8 space-y-3">
              {features.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur-sm"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-100">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-body-sm leading-body-sm font-semibold text-white">
                      {title}
                    </p>
                    <p className="mt-0.5 text-caption leading-caption text-white/70">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-caption text-white/45">&copy; {year} Yetiş Grup</p>
        </div>
      </aside>

      {/* Right: form */}
      <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </Link>

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-card shadow-lg">
            <div className="h-1 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700" />
            <div className="p-8">
              <h2 className="text-h3 leading-h3 font-semibold text-neutral-900">Bayi Girişi</h2>
              <p className="mt-2 text-body-sm leading-body-sm text-neutral-500">
                Hesabınızla giriş yapın ve sipariş vermeye devam edin.
              </p>

              <div className="mt-7">
                <SignInForm />
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-body-sm leading-body-sm text-neutral-500">
            Bayi hesabınız yok mu? Yetiş Grup satış ekibinizle iletişime geçin.
          </p>
        </div>
      </div>
    </main>
  );
}
