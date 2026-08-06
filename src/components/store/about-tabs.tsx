"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
  title: string;
  body: string;
  image?: string;
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
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "mkt-pill mkt-label shrink-0 px-4 py-2 transition-colors",
              tab.id === active
                ? "bg-mkt-accent text-mkt-accent-ink"
                : "bg-mkt-card-muted text-mkt-ink-muted hover:text-mkt-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <h2 className="mkt-h2 mt-6 max-w-2xl text-balance text-mkt-ink md:mt-8">{current.title}</h2>
      <p className="mkt-body mt-4 max-w-xl md:mt-5">{current.body}</p>
    </div>
  );

  if (!visual || !current.image) return content;

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] md:items-stretch md:gap-8">
      {content}
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] md:aspect-auto md:min-h-[240px]">
        <Image
          key={current.image}
          src={current.image}
          alt=""
          fill
          className="object-cover transition-opacity duration-500"
          sizes="(min-width: 768px) 28vw, 90vw"
        />
      </div>
    </div>
  );
}
