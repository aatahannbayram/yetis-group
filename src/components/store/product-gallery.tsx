"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type MediaItem = {
  id: string;
  url: string;
  alt: string | null;
  kind: "IMAGE" | "VIDEO";
};

export function ProductGallery({
  items,
  fallbackUrl,
  fallbackAlt,
}: {
  items: MediaItem[];
  fallbackUrl: string | null;
  fallbackAlt: string;
}) {
  const gallery =
    items.length > 0
      ? items
      : fallbackUrl
        ? [{ id: "fallback", url: fallbackUrl, alt: fallbackAlt, kind: "IMAGE" as const }]
        : [];

  const [active, setActive] = useState(0);
  const current = gallery[active] ?? gallery[0];

  if (!current) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[1.25rem] bg-mkt-card-muted text-mkt-ink-muted">
        Görsel yok
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[1.25rem] bg-mkt-card-muted">
        {current.kind === "VIDEO" ? (
          <video src={current.url} controls className="size-full object-cover" />
        ) : (
          <Image
            src={current.url}
            alt={current.alt ?? fallbackAlt}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 45vw, 90vw"
            priority
          />
        )}
      </div>
      {gallery.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {gallery.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl border-2",
                i === active ? "border-mkt-accent" : "border-transparent",
              )}
            >
              <Image src={item.url} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
