"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { PillCta } from "@/components/store/pill-cta";
import { SceneImage } from "@/components/store/scene-image";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/lib/motion-presets";

const shortcuts = [
  { href: "/urunler", label: "Katalog" },
  { href: "/iletisim?konu=numune", label: "Numune" },
  { href: "/iletisim?konu=bayilik", label: "Bayilik" },
] as const;

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOutExpo },
  },
};

/**
 * Hero photograph + copy. Motion runs on first paint; parent keeps the server header.
 */
export function HomeHeroScene() {
  const reduced = useReducedMotion();

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#1a120c]">
      <motion.div
        className="absolute inset-0"
        initial={reduced ? false : { scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: easeOutExpo }}
      >
        <SceneImage
          id="home-hero-portrait"
          fill
          priority
          quality={72}
          className="object-[center_42%]"
          sizes="100vw"
        />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,12,9,0.58)_0%,rgba(16,12,9,0.36)_36%,rgba(16,12,9,0.12)_58%,transparent_82%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,8,0.42)_0%,transparent_28%,transparent_64%,rgba(12,10,8,0.46)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-[18%] left-0 w-[min(42rem,78%)] bg-[radial-gradient(ellipse_at_left,rgba(12,10,8,0.42)_0%,transparent_72%)]"
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-10 pt-28 sm:px-8 sm:pb-12 md:px-12 md:pb-14 lg:justify-center lg:px-16 lg:pb-16 lg:pt-32">
        <motion.div
          className="max-w-xl"
          initial={reduced ? "visible" : "hidden"}
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1, delayChildren: 0.08 },
            },
          }}
        >
          <motion.p
            variants={item}
            className="mkt-section-label !text-mkt-accent [text-shadow:0_1px_10px_rgba(0,0,0,0.4)]"
          >
            Temiz gıdaya eriş, sağlıklı yetiş
          </motion.p>
          <motion.h1
            variants={item}
            className={cn(
              "mkt-display mt-4 text-balance text-white",
              "text-[clamp(2.4rem,6.2vw,4.35rem)] leading-[1.06] tracking-[-0.03em]",
              "[text-shadow:0_2px_28px_rgba(0,0,0,0.38)]",
            )}
          >
            Toptan peynir.
            <span className="mt-1 block text-[0.72em] font-medium tracking-[-0.028em] text-white/92">
              Listeniz hesabınızda.
            </span>
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-5 max-w-md text-[15px] leading-relaxed text-white/88 md:mt-6 md:text-[16px] md:leading-relaxed"
          >
            Market, şarküteri ve HORECA. Onaylı hesapta kademeli fiyat açılır; sipariş lot ve SKT
            ile kilitlenir. SKT’si geçen yola çıkmaz.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
          >
            <PillCta href="/auth" className="w-full justify-center sm:w-auto sm:min-w-[12.5rem]">
              Bayi Girişi
            </PillCta>
            <PillCta href="/auth?tab=uye" variant="glass" className="w-full justify-center sm:w-auto">
              Bayi ol
            </PillCta>
          </motion.div>

          <motion.nav
            variants={item}
            aria-label="Kısa yollar"
            className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold text-white/78"
          >
            {shortcuts.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </motion.nav>
        </motion.div>
      </div>
    </section>
  );
}
