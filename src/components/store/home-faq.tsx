"use client";

import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Building2,
  ChevronDown,
  Package,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type HomeFaqItem = {
  question: string;
  answer: string;
  icon?: "building" | "package" | "shield";
};

const icons = {
  building: Building2,
  package: Package,
  shield: ShieldCheck,
} as const;

export function HomeFaq({
  items,
  imageSrc,
  imageAlt = "",
}: {
  items: HomeFaqItem[];
  imageSrc: string;
  imageAlt?: string;
}) {
  const reduced = useReducedMotion();
  const [openId, setOpenId] = useState(0);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-6">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative min-h-[240px] overflow-hidden rounded-[1.35rem] lg:min-h-full"
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          quality={70}
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#0a1f14]/75 via-[#0a1f14]/15 to-transparent"
        />
        <p className="absolute bottom-5 left-5 right-5 text-[15px] font-medium tracking-[-0.02em] text-white md:bottom-7 md:left-7">
          Net soru, net cevap — bayilik süreci sürpriz istemez.
        </p>
      </motion.div>

      <div className="space-y-2.5">
        {items.map((item, i) => {
          const Icon = icons[item.icon ?? "shield"];
          const open = openId === i;
          return (
            <motion.div
              key={item.question}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.45,
                delay: reduced ? 0 : i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? -1 : i)}
                aria-expanded={open}
                className={cn(
                  "w-full rounded-[1.25rem] border border-transparent text-left transition-colors",
                  open
                    ? "border-[color:var(--mkt-border)] bg-white shadow-[0_12px_40px_-24px_rgba(0,0,0,0.35)]"
                    : "bg-mkt-card-muted hover:bg-white",
                )}
              >
                <span className="flex items-start gap-3 px-5 py-4 md:px-6 md:py-5">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-50)] text-mkt-green-text">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-[1.05rem] font-medium tracking-[-0.015em] text-mkt-ink">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          "mt-1 size-4 shrink-0 text-mkt-ink-muted transition-transform duration-300",
                          open && "rotate-180",
                        )}
                        aria-hidden
                      />
                    </span>
                    <span
                      className={cn(
                        "grid transition-[grid-template-rows] duration-300 ease-out",
                        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <span className="overflow-hidden">
                        <span className="mkt-body mt-2.5 block pb-1 text-[13px] md:text-[14px]">
                          {item.answer}
                        </span>
                      </span>
                    </span>
                  </span>
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
