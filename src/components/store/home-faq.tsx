"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOTION } from "@/lib/motion";

export type HomeFaqItem = {
  question: string;
  answer: string;
};

export function HomeFaq({ items }: { items: HomeFaqItem[] }) {
  const [openId, setOpenId] = useState(0);

  return (
    <div role="list" className="border-t border-[color:var(--mkt-border)]">
      {items.map((item, i) => {
        const open = openId === i;
        const panelId = `home-faq-panel-${i}`;
        const buttonId = `home-faq-btn-${i}`;

        return (
          <div
            key={item.question}
            role="listitem"
            className="border-b border-[color:var(--mkt-border)]"
          >
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                onClick={() => setOpenId(open ? -1 : i)}
                aria-expanded={open}
                aria-controls={panelId}
                className="flex w-full items-center gap-4 py-4 text-left sm:gap-6 sm:py-5"
              >
                <span
                  className={cn(
                    "min-w-0 flex-1 text-[15px] leading-snug tracking-[-0.02em] transition-colors sm:text-[1.0625rem]",
                    open
                      ? "font-semibold text-mkt-ink"
                      : "font-medium text-mkt-ink/85 hover:text-mkt-ink",
                  )}
                >
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-mkt-ink/35 transition-transform ease-out",
                    open && "rotate-180 text-mkt-green-text",
                  )}
                  style={{ transitionDuration: `${MOTION.faqMs}ms` }}
                  aria-hidden
                />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-[grid-template-rows] ease-out",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
              style={{ transitionDuration: `var(--mkt-motion-faq, ${MOTION.faqMs}ms)` }}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="max-w-xl pb-4 text-[14px] leading-relaxed text-mkt-ink-muted sm:pb-5 sm:text-[15px]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
