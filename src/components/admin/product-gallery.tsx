"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star, Trash2, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MediaItem = { id: string; url: string; alt: string | null; isPrimary: boolean };

export function ProductGallery({
  productId,
  slug,
  media,
  addMediaAction,
  deleteMediaAction,
  setPrimaryMediaAction,
}: {
  productId: string;
  slug: string;
  media: MediaItem[];
  addMediaAction: (formData: FormData) => Promise<void>;
  deleteMediaAction: (formData: FormData) => Promise<void>;
  setPrimaryMediaAction: (formData: FormData) => Promise<void>;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openAt = (index: number) => setLightboxIndex(index);
  const close = () => setLightboxIndex(null);
  const step = (delta: number) => {
    if (lightboxIndex === null || media.length === 0) return;
    setLightboxIndex((lightboxIndex + delta + media.length) % media.length);
  };

  const active = lightboxIndex !== null ? media[lightboxIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {media.map((m, index) => (
          <div key={m.id} className="space-y-2">
            <button
              type="button"
              onClick={() => openAt(index)}
              className="group relative aspect-square w-full overflow-hidden rounded-xl bg-muted"
            >
              <Image
                src={m.url}
                alt={m.alt ?? ""}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="180px"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
                <ZoomIn className="size-5 text-white drop-shadow" />
              </div>
              {m.isPrimary ? (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                  Birincil
                </span>
              ) : null}
            </button>
            <div className="flex flex-wrap gap-1">
              {!m.isPrimary ? (
                <form action={setPrimaryMediaAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <Button type="submit" size="sm" variant="outline" className="h-7 gap-1 text-caption">
                    <Star className="size-3" />
                    Birincil yap
                  </Button>
                </form>
              ) : null}
              <form action={deleteMediaAction}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="slug" value={slug} />
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 text-caption text-danger-fg hover:text-danger-fg"
                >
                  <Trash2 className="size-3" />
                  Sil
                </Button>
              </form>
            </div>
          </div>
        ))}
        {media.length === 0 ? (
          <div className="col-span-full flex aspect-[3/1] items-center justify-center rounded-xl border border-dashed border-border text-caption text-muted-foreground">
            Henüz görsel eklenmedi
          </div>
        ) : null}
      </div>

      <form action={addMediaAction} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="slug" value={slug} />
        <Input name="url" placeholder="/products/....jpg veya https://..." required className="flex-1" />
        <Button type="submit">Görsel Ekle</Button>
      </form>

      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent
          showCloseButton
          className="max-w-[calc(100%-2rem)] border-none bg-transparent p-0 shadow-none sm:max-w-4xl"
        >
          <DialogTitle className="sr-only">{active?.alt || "Ürün görseli"}</DialogTitle>
          {active ? (
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-black/90 sm:aspect-video">
              <Image
                src={active.url}
                alt={active.alt ?? ""}
                fill
                className="object-contain"
                sizes="90vw"
              />
              {media.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className={cn(
                      "absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20",
                    )}
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-2.5 py-1 text-caption text-white">
                    {lightboxIndex! + 1} / {media.length}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
