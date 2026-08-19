"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site";
import { SceneImage } from "@/components/store/scene-image";
import { ScrollItem, ScrollReveal, ScrollStagger } from "@/components/store/scroll-reveal";
import { cn } from "@/lib/utils";

function isWithinBusinessHours(now = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "numeric",
    hour12: false,
    weekday: "short",
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const isWeekend = weekday === "Sat" || weekday === "Sun";
  if (isWeekend) return false;
  return hour >= 9 && hour < 18;
}

const TOPICS = [
  { href: "/iletisim?konu=bayilik", label: "Bayilik" },
  { href: "/iletisim?konu=numune", label: "Numune" },
  { href: "/iletisim?konu=horeca", label: "HORECA" },
  { href: "/iletisim", label: "İletişim formu" },
] as const;

export function SupportStrip() {
  const [openNow, setOpenNow] = useState(true);
  const wa = `https://wa.me/${SITE.phone.replace("+", "")}`;

  useEffect(() => {
    setOpenNow(isWithinBusinessHours());
  }, []);

  return (
    <div className="relative overflow-hidden">
      <SceneImage
        id="support-team"
        fill
        quality={55}
        className="object-center"
        sizes="100vw"
      />
      <div aria-hidden className="absolute inset-0 bg-[#0c1612]/90" />

      <div className="mkt-pad relative z-10 py-12 md:py-16 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 xl:gap-24">
        <ScrollReveal from="left" className="max-w-md">
          <p className="mkt-section-label !text-mkt-accent">İletişim</p>
          <h2 className="mt-4 text-balance text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.03em] text-white sm:text-[2rem] md:text-[2.25rem]">
            Sipariş ve bayilik için yazın.
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/55">
            Numune, fiyat listesi veya bölge teslimatı için yazın; ekip mesai içinde dönüş yapar.
          </p>
          <p className="mt-6 flex items-center gap-2 text-[13px] text-white/40">
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                openNow ? "bg-[#45c980]" : "bg-white/30",
              )}
              aria-hidden
            />
            {openNow
              ? "Mesai içinde · 09:00–18:00 (TR)"
              : "Mesai dışı · ilk iş günü dönüş"}
          </p>
        </ScrollReveal>

        <ScrollStagger className="flex flex-col justify-center">
          <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
            <ScrollItem>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-4 py-4 transition-colors hover:bg-white/[0.03] sm:py-5"
              >
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-white">WhatsApp</p>
                  <p className="mt-0.5 text-[13px] text-white/40">Anlık mesaj</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-[#45c980] transition-transform group-hover:translate-x-0.5">
                  Yazın
                  <ArrowUpRight className="size-3.5 opacity-70" aria-hidden />
                </span>
              </a>
            </ScrollItem>
            <ScrollItem>
              <a
                href={`tel:${SITE.phone}`}
                className="group flex items-center justify-between gap-4 py-4 transition-colors hover:bg-white/[0.03] sm:py-5"
              >
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-white">Telefon</p>
                  <p className="mt-0.5 tabular-nums text-[13px] text-white/40">
                    {SITE.phoneDisplay}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-white/70 transition-colors group-hover:text-white">
                  Ara
                  <ArrowUpRight className="size-3.5 opacity-70" aria-hidden />
                </span>
              </a>
            </ScrollItem>
            <ScrollItem>
              <a
                href={`mailto:${SITE.email}`}
                className="group flex items-center justify-between gap-4 py-4 transition-colors hover:bg-white/[0.03] sm:py-5"
              >
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-white">E-posta</p>
                  <p className="mt-0.5 truncate text-[13px] text-white/40">{SITE.email}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-white/70 transition-colors group-hover:text-white">
                  Mail
                  <ArrowUpRight className="size-3.5 opacity-70" aria-hidden />
                </span>
              </a>
            </ScrollItem>
          </div>

          <ScrollItem>
            <nav
              aria-label="İletişim konuları"
              className="mt-8 flex flex-wrap items-center gap-x-1 gap-y-2 text-[13px] text-white/35"
            >
              {TOPICS.map((item, i) => (
                <span key={item.href} className="inline-flex items-center gap-1">
                  {i > 0 ? <span className="mx-1.5 text-white/20" aria-hidden>·</span> : null}
                  <Link
                    href={item.href}
                    className="font-medium text-white/50 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    {item.label}
                  </Link>
                </span>
              ))}
            </nav>
          </ScrollItem>
        </ScrollStagger>
      </div>
      </div>
    </div>
  );
}
