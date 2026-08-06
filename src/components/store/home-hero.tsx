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
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/35"
      />

      <div
        className={cn(
          "relative z-10 flex flex-col",
          "px-4 pb-8 pt-[calc(4.25rem+env(safe-area-inset-top))] sm:px-6",
          "md:min-h-[min(82svh,880px)] md:justify-end md:px-10 md:pb-14 md:pt-28 lg:px-14",
        )}
      >
        <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)] lg:items-end lg:gap-10">
          <div className="min-w-0">
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="hidden text-[12px] font-semibold tracking-[0.04em] text-white/70 uppercase sm:block"
            >
              Yöresel &amp; kırsal gıda
            </motion.p>
            <motion.h1
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mkt-display max-w-2xl text-balance text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.4)] sm:mt-3 md:mt-4"
            >
              Temiz gıdaya eriş, sağlıklı yetiş.
            </motion.h1>
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="mt-3 hidden max-w-md text-[15px] leading-relaxed text-white/80 sm:block md:text-base"
            >
              Market, şarküteri ve mutfaklar için toptan tedarik. Fiyatın listende net; sipariş
              onaydan sonra açılır.
            </motion.p>

            {/* Mobile: compact CTA row — not full-bleed clunky pill */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.26 }}
              className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-7"
            >
              <PillCta href="/auth" className="w-auto min-w-[10.5rem]">
                Bayi Girişi
              </PillCta>
              <Link
                href="/auth?tab=uye"
                className="text-[14px] font-semibold text-white/90 underline-offset-4 hover:text-white hover:underline"
              >
                Üye ol
              </Link>
            </motion.div>
          </div>

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
