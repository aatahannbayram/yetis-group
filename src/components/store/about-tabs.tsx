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
  imageSide = "end",
}: {
  tabs: Tab[];
  /** Show accompanying image for the active tab (B2B process panels). */
  visual?: boolean;
  /** Which half of the 50/50 split holds the photograph. */
  imageSide?: "start" | "end";
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  if (!current) return null;

  const tabsRow = (
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
  );

  if (!visual || !current.imageSlot) {
    return (
      <div>
        {tabsRow}
        <h2 className="mkt-h2 mt-5 max-w-2xl text-balance text-mkt-ink md:mt-8">{current.title}</h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-mkt-ink-muted md:mt-5 md:text-base">
          {current.body}
        </p>
      </div>
    );
  }

  const copy = (
    <div className="flex flex-col justify-center mkt-pad">
      {tabsRow}
      <h2 className="mkt-h2 mt-5 text-balance text-mkt-ink md:mt-8">{current.title}</h2>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-mkt-ink-muted md:mt-5 md:text-base">
        {current.body}
      </p>
    </div>
  );

  const photo = (
    <div className="relative min-h-[280px] sm:min-h-[340px] lg:min-h-full">
      <SceneImage
        key={current.imageSlot}
        id={current.imageSlot}
        fill
        quality={55}
        className="object-center"
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
    </div>
  );

  return (
    <div className="grid h-full lg:grid-cols-2 lg:min-h-[36rem]">
      {imageSide === "start" ? (
        <>
          {photo}
          {copy}
        </>
      ) : (
        <>
          {copy}
          {photo}
        </>
      )}
    </div>
  );
}
