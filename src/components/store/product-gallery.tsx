"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { PdpOriginHint } from "@/components/store/pdp-origin-hint";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

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
  region,
}: {
  items: MediaItem[];
  fallbackUrl: string | null;
  fallbackAlt: string;
  region?: string | null;
}) {
  const gallery =
    items.length > 0
      ? items
      : fallbackUrl
        ? [{ id: "fallback", url: fallbackUrl, alt: fallbackAlt, kind: "IMAGE" as const }]
        : [];

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const current = gallery[active] ?? gallery[0];

  if (!current) {
    return (
      <div className="flex aspect-[4/5] max-h-[70vh] items-center justify-center rounded-[1.5rem] bg-[#FAF8F3] text-mkt-ink-muted sm:aspect-square sm:max-h-none">
        Görsel yok
      </div>
    );
  }

  const alt = current.alt ?? fallbackAlt;
  const isImage = current.kind === "IMAGE";

  return (
    <div>
      <div
        className={cn(
          "group/stage relative w-full overflow-hidden rounded-[1.5rem] bg-[#FAF8F3]",
          "aspect-[4/5] max-h-[70vh] sm:aspect-square sm:max-h-none",
        )}
      >
        {region ? <PdpOriginHint region={region} /> : null}

        {current.kind === "VIDEO" ? (
          <video
            src={current.url}
            controls
            className="relative z-10 size-full object-contain p-5 md:p-10"
          />
        ) : (
          <div className="absolute inset-0 z-10 p-6 md:p-10">
            <div className="relative size-full">
              <Image
                src={current.url}
                alt={alt}
                fill
                className="object-contain drop-shadow-[0_18px_36px_rgba(33,28,22,0.12)] motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover/stage:scale-[1.03]"
                sizes="(min-width: 1024px) 55vw, 92vw"
                priority
              />
            </div>
          </div>
        )}

        {region ? (
          <p className="pointer-events-none absolute bottom-4 left-4 z-30 mkt-label text-mkt-ink-muted">
            {region}
          </p>
        ) : null}

        {isImage ? (
          <button
            type="button"
            className="absolute inset-0 z-20 cursor-zoom-in"
            aria-label="Görseli büyüt"
            onClick={() => setLightbox(true)}
          >
            <span className="absolute right-4 bottom-4 flex size-12 items-center justify-center rounded-full bg-white/92 text-mkt-ink shadow-[0_8px_24px_rgba(33,28,22,0.12)] ring-1 ring-black/5">
              <ZoomIn className="size-5" aria-hidden />
            </span>
          </button>
        ) : (
          <button
            type="button"
            aria-label="Görseli büyüt"
            onClick={() => setLightbox(true)}
            className="absolute right-4 bottom-4 z-30 flex size-12 items-center justify-center rounded-full bg-white/92 text-mkt-ink shadow-[0_8px_24px_rgba(33,28,22,0.12)] ring-1 ring-black/5 transition-colors hover:bg-white"
          >
            <ZoomIn className="size-5" aria-hidden />
          </button>
        )}
      </div>

      {gallery.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {gallery.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Görsel ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl border-2 bg-[#FAF8F3]",
                i === active ? "border-mkt-accent" : "border-transparent",
              )}
            >
              <Image src={item.url} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent
          className="max-h-[92vh] w-[min(96vw,56rem)] max-w-[min(96vw,56rem)] overflow-hidden bg-[#FAF8F3] p-3 sm:max-w-[min(96vw,56rem)]"
          overlayClassName="bg-black/45"
        >
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <div className="relative mx-auto h-[min(82vh,48rem)] w-full">
            {current.kind === "VIDEO" ? (
              <video src={current.url} controls autoPlay className="size-full object-contain" />
            ) : (
              <Image
                src={current.url}
                alt={alt}
                fill
                className="object-contain"
                sizes="90vw"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
