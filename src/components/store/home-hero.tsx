"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PillCta } from "@/components/store/pill-cta";
import { cn } from "@/lib/utils";

export function HomeHero({
  imageSrc = "/hero-dairy.jpg",
}: {
  imageSrc?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div className="relative min-h-[min(70svh,640px)] overflow-hidden md:min-h-[min(85svh,900px)]">
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
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/40"
      />

      <div className="relative z-10 flex min-h-[min(70svh,640px)] flex-col justify-end px-5 pb-8 md:min-h-[min(85svh,900px)] md:px-10 md:pb-14 lg:px-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-end lg:gap-10">
          <div>
            <motion.span
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mkt-pill mkt-label inline-flex bg-black/35 px-4 py-1.5 text-white backdrop-blur-md"
            >
              Yöresel &amp; kırsal gıda
            </motion.span>
            <motion.h1
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="mkt-display mt-4 max-w-2xl text-balance text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] md:mt-5"
            >
              Temiz gıdaya eriş, sağlıklı yetiş.
            </motion.h1>
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/80 md:text-base"
            >
              Market, şarküteri ve mutfaklar için toptan tedarik. Fiyatın listende net; sipariş
              onaydan sonra açılır.
            </motion.p>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-8"
            >
              <PillCta href="/auth" className="w-full justify-center sm:w-auto">
                Bayi Girişi
              </PillCta>
              <Link
                href="/auth?tab=uye"
                className="mkt-pill inline-flex h-11 w-full items-center justify-center bg-white px-5 text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0a] shadow-sm hover:bg-white/92 sm:w-auto"
              >
                Üye ol
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32 }}
            className="rounded-[1.35rem] border border-white/25 bg-white/12 p-5 text-white shadow-lg backdrop-blur-xl md:p-6"
          >
            <p className="mkt-label text-white/70">Bugün ne lazım?</p>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/urunler", label: "Kataloğa bak" },
                { href: "/iletisim?konu=bayilik", label: "Bayilik sor" },
                { href: "/iletisim?konu=numune", label: "Numune iste" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "group flex items-center justify-between rounded-xl px-3 py-2.5",
                      "bg-white/8 transition-colors hover:bg-white/16",
                    )}
                  >
                    <span className="text-[14px] font-medium">{link.label}</span>
                    <ArrowUpRight className="size-4 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
