"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type HomeFaqItem = {
  question: string;
  answer: string;
  icon?: "building" | "package" | "shield";
};

/**
 * Single bordered panel + divide-y — no inter-item gaps.
 * Expand uses grid-template-rows so opening one item grows in place
 * without shifting sibling margins/gaps.
 */
export function HomeFaq({ items }: { items: HomeFaqItem[] }) {
  const [openId, setOpenId] = useState(0);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-[color:var(--mkt-border)] bg-white sm:rounded-[1.25rem]"
      role="list"
    >
      {items.map((item, i) => {
        const open = openId === i;
        const n = String(i + 1).padStart(2, "0");
        const panelId = `home-faq-panel-${i}`;
        const buttonId = `home-faq-btn-${i}`;

        return (
          <div
            key={item.question}
            role="listitem"
            className={cn(i > 0 && "border-t border-[color:var(--mkt-border)]")}
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
                <span
                  className={cn(
                    "mt-0.5 w-6 shrink-0 font-mono text-[11px] font-semibold tabular-nums sm:w-7 sm:text-[12px]",
                    open ? "text-mkt-green-text" : "text-mkt-ink-muted",
                  )}
                >
                  {n}
                </span>
                <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug tracking-[-0.015em] text-mkt-ink sm:text-[1.05rem]">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "mt-0.5 size-4 shrink-0 text-mkt-ink-muted transition-transform duration-200 ease-out",
                    open && "rotate-180 text-mkt-green-text",
                  )}
                  aria-hidden
                />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-[grid-template-rows] duration-200 ease-out",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="px-4 pb-3.5 pl-[calc(1rem+1.5rem+0.75rem)] text-[14px] leading-relaxed text-mkt-ink-muted sm:px-5 sm:pb-4 sm:pl-[calc(1.25rem+1.75rem+1rem)] sm:text-[15px]">
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
