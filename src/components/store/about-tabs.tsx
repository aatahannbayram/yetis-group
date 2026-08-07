"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SceneImage } from "@/components/store/scene-image";
import type { ImageSlotId } from "@/content/images";

type Tab = {
  id: string;
  label: string;
  title: string;
  body: string;
  imageSlot?: ImageSlotId;
};

export function AboutTabs({
  tabs,
  visual = false,
}: {
  tabs: Tab[];
  /** Show accompanying image for the active tab (B2B process panels). */
  visual?: boolean;
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  if (!current) return null;

  const content = (
    <div className={visual ? "flex flex-1 flex-col" : undefined}>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "mkt-pill shrink-0 px-3.5 py-2.5 text-[13px] font-semibold tracking-[-0.01em] transition-colors sm:px-4 sm:text-[14px]",
              tab.id === active
                ? "bg-mkt-accent text-mkt-accent-ink"
                : "bg-mkt-card-muted text-mkt-ink hover:text-mkt-green-text",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <h2 className="mkt-h2 mt-5 max-w-2xl text-balance text-mkt-ink md:mt-8">{current.title}</h2>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-mkt-ink-muted md:mt-5 md:text-base">
        {current.body}
      </p>
    </div>
  );

  if (!visual || !current.imageSlot) return content;

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] md:items-stretch md:gap-8">
      {content}
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] md:aspect-auto md:min-h-[240px]">
        <SceneImage
          key={current.imageSlot}
          id={current.imageSlot}
          fill
          quality={55}
          className="transition-opacity duration-500"
          sizes="(min-width: 768px) 28vw, 90vw"
        />
      </div>
    </div>
  );
}
