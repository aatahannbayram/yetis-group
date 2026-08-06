"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PillCta } from "@/components/store/pill-cta";
import { cn } from "@/lib/utils";

const shortcuts = [
  { href: "/urunler", label: "Kataloğa bak" },
  { href: "/iletisim?konu=bayilik", label: "Bayilik sor" },
  { href: "/iletisim?konu=numune", label: "Numune iste" },
] as const;

export function HomeHero({
  imageSrc = "/hero-dairy.jpg",
}: {
  imageSrc?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div className="relative overflow-hidden md:min-h-[min(82svh,880px)]">
      <motion.div
        className="absolute inset-0 will-change-transform"
        initial={reduced ? false : { scale: 1.04 }}
        animate={reduced ? undefined : { scale: 1 }}
        transition={{ duration: 14, ease: "linear" }}
      >
        <Image
          src={imageSrc}
          alt="Yetiş Grup — yöresel peynir ve kırsal süt ürünleri"
          fill
          priority
          quality={75}
          className="object-cover object-center"
          sizes="100vw"
        />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/52 to-black/40"
      />

      <div
        className={cn(
          "relative z-10 flex flex-col",
          "px-4 pb-7 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:px-6",
          "md:min-h-[min(82svh,880px)] md:justify-end md:px-10 md:pb-14 md:pt-28 lg:px-14",
        )}
      >
        <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)] lg:items-end lg:gap-10">
          <div className="min-w-0">
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-[12px] font-semibold tracking-[0.04em] text-white/70 uppercase"
            >
              Yöresel &amp; kırsal gıda
            </motion.p>
            <motion.h1
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mkt-display mt-3 max-w-2xl text-balance text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.4)] md:mt-4"
            >
              Temiz gıdaya eriş, sağlıklı yetiş.
            </motion.h1>
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="mt-3 max-w-md text-[14px] leading-relaxed text-white/80 sm:mt-4 sm:text-[15px] md:text-base"
            >
              <span className="sm:hidden">Toptan tedarik. Net fiyat listesi, onaylı sipariş.</span>
              <span className="hidden sm:inline">
                Market, şarküteri ve mutfaklar için toptan tedarik. Fiyatın listende net; sipariş
                onaydan sonra açılır.
              </span>
            </motion.p>

            {/* Mobile: one primary CTA + text link — fewer competing buttons */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.26 }}
              className="mt-6 flex flex-col gap-4 sm:mt-7 sm:flex-row sm:items-center sm:gap-4"
            >
              <PillCta href="/auth" className="h-12 w-full justify-center sm:h-[3.25rem] sm:w-auto">
                Bayi Girişi
              </PillCta>
              <Link
                href="/auth?tab=uye"
                className="inline-flex items-center justify-center gap-1.5 text-[15px] font-semibold text-white underline-offset-4 hover:underline sm:justify-start"
              >
                Üye ol
                <ArrowUpRight className="size-3.5 opacity-80" aria-hidden />
              </Link>
            </motion.div>

            {/* Mobile shortcuts: text row, not a button stack */}
            <motion.nav
              aria-label="Hızlı linkler"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.34 }}
              className="mt-7 flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-white/15 pt-5 text-[13px] lg:hidden"
            >
              {shortcuts.map((link, i) => (
                <span key={link.href} className="inline-flex items-center">
                  {i > 0 ? <span className="mx-2 text-white/25" aria-hidden>·</span> : null}
                  <Link
                    href={link.href}
                    className="font-medium text-white/75 underline-offset-2 hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                </span>
              ))}
            </motion.nav>
          </div>

          {/* Desktop / large tablet only — keeps hero calm on phones */}
          <motion.aside
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32 }}
            className="mt-8 hidden rounded-[1.35rem] border border-white/20 bg-white/10 p-5 text-white backdrop-blur-xl lg:mt-0 lg:block lg:p-6"
          >
            <p className="text-[12px] font-semibold tracking-wide text-white/70 uppercase">
              Bugün ne lazım?
            </p>
            <ul className="mt-4 space-y-2">
              {shortcuts.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex min-h-11 items-center justify-between rounded-xl bg-white/10 px-3 py-2.5 transition-colors hover:bg-white/18"
                  >
                    <span className="text-[15px] font-semibold">{link.label}</span>
                    <ArrowUpRight className="size-4 opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
