"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Headphones, Mail, MessageCircle, Phone } from "lucide-react";
import { SITE } from "@/lib/site";

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

export function SupportStrip() {
  const [openNow, setOpenNow] = useState(true);
  const wa = `https://wa.me/${SITE.phone.replace("+", "")}`;

  useEffect(() => {
    setOpenNow(isWithinBusinessHours());
  }, []);

  return (
    <div className="mkt-pad relative py-10 md:py-14 lg:py-16">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        <div className="max-w-xl">
          <p className="mkt-section-label !text-mkt-accent">Destek</p>
          <h2 className="mkt-h2 mt-3 text-balance text-white">Takıldığın yerde yaz.</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/70 md:text-base">
            Sipariş, numune veya bayilik: satış ekibi cevaplar.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-mkt-accent"
              aria-hidden
            >
              <Headphones className="size-5" />
            </span>
            <div className="text-[13px] text-white/70">
              <p className="font-semibold text-white/90">Satış ekibi</p>
              <p className="flex items-center gap-2">
                <span
                  className={
                    openNow
                      ? "inline-block size-1.5 shrink-0 rounded-full bg-mkt-accent"
                      : "inline-block size-1.5 shrink-0 rounded-full bg-white/40"
                  }
                  aria-hidden
                />
                {openNow
                  ? "Şu an mesaide · 09:00–18:00 (TR)"
                  : "Mesai dışı · 09:00–18:00 (TR) yazın, ilk iş günü dönüş yaparız"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-2xl">
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col rounded-[1.15rem] border border-white/15 bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <MessageCircle className="size-5 text-mkt-accent" aria-hidden />
            <p className="mt-3 text-[15px] font-semibold text-white">WhatsApp</p>
            <p className="mt-1 text-[13px] text-white/60">Hızlı yanıt</p>
            <span className="mkt-pill mt-auto inline-flex h-10 items-center justify-center gap-2 bg-mkt-accent px-4 text-[13px] font-semibold text-mkt-accent-ink">
              Yazın
              <ArrowUpRight className="size-3.5" aria-hidden />
            </span>
          </a>
          <a
            href={`tel:${SITE.phone}`}
            className="flex flex-col rounded-[1.15rem] border border-white/15 bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <Phone className="size-5 text-mkt-accent" aria-hidden />
            <p className="mt-3 text-[15px] font-semibold text-white">Telefon</p>
            <p className="mt-1 tabular-nums text-[13px] text-white/60">{SITE.phoneDisplay}</p>
            <span className="mkt-pill mt-auto inline-flex h-10 items-center justify-center gap-2 border border-white/25 bg-white/5 px-4 text-[13px] font-semibold text-white">
              Ara
              <ArrowUpRight className="size-3.5" aria-hidden />
            </span>
          </a>
          <a
            href={`mailto:${SITE.email}`}
            className="flex flex-col rounded-[1.15rem] border border-white/15 bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <Mail className="size-5 text-mkt-accent" aria-hidden />
            <p className="mt-3 text-[15px] font-semibold text-white">E-posta</p>
            <p className="mt-1 break-all text-[13px] text-white/60">{SITE.email}</p>
            <span className="mkt-pill mt-auto inline-flex h-10 items-center justify-center gap-2 border border-white/25 bg-white/5 px-4 text-[13px] font-semibold text-white">
              Mail at
              <ArrowUpRight className="size-3.5" aria-hidden />
            </span>
          </a>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-8">
        {[
          { href: "/iletisim?konu=bayilik", label: "Bayilik" },
          { href: "/iletisim?konu=numune", label: "Numune" },
          { href: "/iletisim?konu=horeca", label: "HORECA" },
          { href: "/iletisim", label: "Form" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="mkt-pill inline-flex items-center border border-white/20 bg-white/5 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-white/10"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
