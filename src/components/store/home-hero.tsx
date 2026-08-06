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
    <div
      className={cn(
        "relative overflow-hidden",
        /* Mobile: tall cinematic first screen */
        "min-h-[min(92svh,760px)]",
        "md:min-h-[min(82svh,880px)]",
      )}
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        initial={reduced ? false : { scale: 1.06 }}
        animate={reduced ? undefined : { scale: 1 }}
        transition={{ duration: 16, ease: "linear" }}
      >
        <Image
          src={imageSrc}
          alt="Yetiş Grup, yöresel peynir ve kırsal süt ürünleri"
          fill
          priority
          quality={80}
          className="object-cover object-[center_42%] md:object-center"
          sizes="100vw"
        />
      </motion.div>

      {/* Depth: soft top for logo, rich bottom for copy */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-transparent md:from-black/35"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/45 to-transparent"
      />

      <div
        className={cn(
          "relative z-10 flex flex-col justify-end",
          "min-h-[min(92svh,760px)]",
          "px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[calc(4.5rem+env(safe-area-inset-top))]",
          "sm:px-6",
          "md:min-h-[min(82svh,880px)] md:px-10 md:pb-14 md:pt-28 lg:px-14",
        )}
      >
        <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)] lg:items-end lg:gap-10">
          <div className="min-w-0">
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="hidden text-[12px] font-semibold tracking-[0.06em] text-white/65 uppercase sm:block"
            >
              Yöresel &amp; kırsal gıda
            </motion.p>

            <motion.h1
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className={cn(
                "mkt-display max-w-[14ch] text-balance text-white",
                "text-[clamp(2.35rem,9.5vw,3.25rem)] leading-[1.06] tracking-[-0.03em]",
                "drop-shadow-[0_2px_28px_rgba(0,0,0,0.45)]",
                "sm:mt-3 sm:max-w-2xl sm:text-[clamp(2.5rem,5vw,4.5rem)] sm:leading-[var(--leading-display)]",
                "md:mt-4",
              )}
            >
              Temiz gıdaya eriş,
              <br className="sm:hidden" /> sağlıklı yetiş.
            </motion.h1>

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16 }}
              className="mt-3 hidden max-w-md text-[15px] leading-relaxed text-white/80 sm:block md:text-base"
            >
              Market, şarküteri ve mutfaklar için toptan tedarik. Fiyatın listende net; sipariş
              onaydan sonra açılır.
            </motion.p>

            {/* Mobile: one clear entry action */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.22 }}
              className="mt-8 flex flex-col gap-4 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-3"
            >
              <PillCta
                href="/auth"
                className="h-12 w-full justify-center text-[15px] sm:h-12 sm:w-auto sm:min-w-[11rem] sm:justify-start"
              >
                Bayi Girişi
              </PillCta>
              <Link
                href="/auth?tab=uye"
                className="text-center text-[14px] font-medium text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline sm:text-left sm:font-semibold sm:text-white/90"
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
                    <ArrowUpRight
                      className="size-4 opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
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
