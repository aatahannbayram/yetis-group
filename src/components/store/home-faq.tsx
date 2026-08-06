"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOTION } from "@/lib/motion";

export type HomeFaqItem = {
  question: string;
  answer: string;
};

export function HomeFaq({ items }: { items: HomeFaqItem[] }) {
  const [openId, setOpenId] = useState(0);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-[color:var(--mkt-border)] bg-white sm:rounded-[1.25rem]"
      role="list"
    >
      {items.map((item, i) => {
        const open = openId === i;
        const panelId = `home-faq-panel-${i}`;
        const buttonId = `home-faq-btn-${i}`;

        return (
          <div
            key={item.question}
            role="listitem"
            className={cn(
              i > 0 && "border-t border-[color:var(--mkt-border)]",
              open && "border-l-[3px] border-l-mkt-accent",
            )}
          >
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                onClick={() => setOpenId(open ? -1 : i)}
                aria-expanded={open}
                aria-controls={panelId}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors sm:gap-4 sm:px-5 sm:py-4",
                  open ? "bg-mkt-card-muted/50" : "hover:bg-mkt-card-muted/40",
                )}
              >
                <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug tracking-[-0.015em] text-mkt-ink sm:text-[1.05rem]">
                  {item.question}
                </span>
                <Plus
                  className={cn(
                    "mt-0.5 size-4 shrink-0 text-mkt-ink-muted transition-transform ease-out",
                    open && "rotate-45 text-mkt-green-text",
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
                <p className="px-4 pb-3.5 text-[14px] leading-relaxed text-mkt-ink-muted sm:px-5 sm:pb-4 sm:text-[15px]">
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
