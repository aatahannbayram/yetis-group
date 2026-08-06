"use client";

import { useReducedMotion } from "motion/react";
import { motion } from "motion/react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type HomeFaqItem = {
  question: string;
  answer: string;
  icon?: "building" | "package" | "shield";
};

export function HomeFaq({ items }: { items: HomeFaqItem[] }) {
  const reduced = useReducedMotion();
  const [openId, setOpenId] = useState(0);

  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-[color:var(--mkt-border)] bg-white">
      {items.map((item, i) => {
        const open = openId === i;
        const n = String(i + 1).padStart(2, "0");
        return (
          <motion.div
            key={item.question}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: 0.4,
              delay: reduced ? 0 : i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
              i > 0 && "border-t border-[color:var(--mkt-border)]",
            )}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? -1 : i)}
              aria-expanded={open}
              className="flex w-full items-start gap-4 px-4 py-4 text-left transition-colors hover:bg-mkt-card-muted/60 sm:gap-5 sm:px-6 sm:py-5"
            >
              <span
                className={cn(
                  "mt-0.5 font-mono text-[12px] font-semibold tabular-nums tracking-wide sm:text-[13px]",
                  open ? "text-mkt-green-text" : "text-mkt-ink-muted",
                )}
              >
                {n}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-3">
                  <span className="text-[1.05rem] font-semibold tracking-[-0.02em] text-mkt-ink sm:text-[1.125rem]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "mt-1 size-4 shrink-0 text-mkt-ink-muted transition-transform duration-300",
                      open && "rotate-180 text-mkt-green-text",
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
                    <span className="mt-2.5 block pb-1 text-[14px] leading-relaxed text-mkt-ink-muted sm:text-[15px]">
                      {item.answer}
                    </span>
                  </span>
                </span>
              </span>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
