"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Link2,
  Loader2,
  Star,
  Trash2,
  ZoomIn,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MediaItem = { id: string; url: string; alt: string | null; isPrimary: boolean };

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export function ProductGallery({
  productId,
  slug,
  media,
  addMediaAction,
  uploadImageAction,
  deleteMediaAction,
  setPrimaryMediaAction,
}: {
  productId: string;
  slug: string;
  media: MediaItem[];
  addMediaAction: (formData: FormData) => Promise<void>;
  uploadImageAction: (formData: FormData) => Promise<void>;
  deleteMediaAction: (formData: FormData) => Promise<void>;
  setPrimaryMediaAction: (formData: FormData) => Promise<void>;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [queued, setQueued] = useState(0);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const openAt = (index: number) => setLightboxIndex(index);
  const close = () => setLightboxIndex(null);
  const step = (delta: number) => {
    if (lightboxIndex === null || media.length === 0) return;
    setLightboxIndex((lightboxIndex + delta + media.length) % media.length);
  };

  const active = lightboxIndex !== null ? media[lightboxIndex] : null;

  function uploadFiles(files: FileList | File[]) {
    const all = Array.from(files);
    const list = all.filter((f) => ACCEPTED_TYPES.includes(f.type));
    setUploadError(
      list.length < all.length ? "Bazı dosyalar desteklenmiyor (JPG, PNG, WEBP, AVIF, GIF)" : null,
    );
    if (list.length === 0) return;

    setQueued(list.length);
    startTransition(async () => {
      for (const file of list) {
        const formData = new FormData();
        formData.set("productId", productId);
        formData.set("slug", slug);
        formData.set("file", file);
        try {
          await uploadImageAction(formData);
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : "Yükleme başarısız oldu");
        } finally {
          setQueued((n) => Math.max(0, n - 1));
        }
      }
    });
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    dragCounter.current = 0;
    if (event.dataTransfer.files?.length) uploadFiles(event.dataTransfer.files);
  }

  return (
    <>
      {media.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {media.map((m, index) => (
            <div key={m.id} className="group/tile space-y-1.5">
              <button
                type="button"
                onClick={() => openAt(index)}
                className="group relative aspect-square w-full overflow-hidden rounded-[var(--radius-card)] border border-[var(--panel-border)] bg-[var(--surface-3)]"
              >
                <Image
                  src={m.url}
                  alt={m.alt ?? ""}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="180px"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
                  <ZoomIn className="size-5 text-white drop-shadow" aria-hidden />
                </div>
                {m.isPrimary ? (
                  <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--primary-solid)] px-2 py-0.5 text-[10px] font-semibold text-white shadow-[var(--shadow-sm)]">
                    <Star className="size-2.5 fill-current" aria-hidden />
                    Birincil
                  </span>
                ) : null}
              </button>
              <div className="flex items-center justify-between gap-1 opacity-0 transition-opacity group-hover/tile:opacity-100 focus-within:opacity-100">
                {!m.isPrimary ? (
                  <form action={setPrimaryMediaAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <button
                      type="submit"
                      className="inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
                    >
                      <Star className="size-3" aria-hidden />
                      Birincil yap
                    </button>
                  </form>
                ) : (
                  <span />
                )}
                <form action={deleteMediaAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <button
                    type="submit"
                    className="inline-flex size-6 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--danger-subtle)] hover:text-[var(--danger-text)]"
                    aria-label="Görseli sil"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          "relative mt-3 flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed p-6 text-center transition-colors duration-[var(--motion-hover)]",
          dragActive
            ? "border-[var(--primary-solid)] bg-[var(--primary-subtle)]"
            : "border-[var(--border-strong)] bg-[var(--surface-2)] hover:border-[var(--panel-accent-action)]/60",
        )}
        onDragEnter={(e) => {
          e.preventDefault();
          dragCounter.current += 1;
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          dragCounter.current -= 1;
          if (dragCounter.current <= 0) setDragActive(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {isPending || queued > 0 ? (
          <>
            <Loader2 className="size-6 animate-spin text-[var(--primary-text)]" aria-hidden />
            <p className="text-body-sm font-medium text-[var(--text-primary)]">
              {queued > 0 ? `${queued} görsel yükleniyor…` : "Yükleniyor…"}
            </p>
          </>
        ) : (
          <>
            <span className="flex size-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--primary-text)] shadow-[var(--shadow-sm)]">
              <ImagePlus className="size-5" aria-hidden />
            </span>
            <p className="text-body-sm font-medium text-[var(--text-primary)]">
              Görselleri buraya sürükleyip bırakın
            </p>
            <p className="text-caption text-[var(--text-muted)]">
              veya{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-medium text-[var(--primary-text)] underline-offset-2 hover:underline"
              >
                bilgisayardan seçin
              </button>{" "}
              &middot; JPG, PNG, WEBP, AVIF, GIF &middot; en fazla 8 MB
            </p>
          </>
        )}
      </div>

      {uploadError ? (
        <p className="mt-2 text-caption text-[var(--danger-text)]">{uploadError}</p>
      ) : null}

      <div className="mt-2">
        {urlMode ? (
          <form
            action={addMediaAction}
            onSubmit={() => setUrlMode(false)}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name="slug" value={slug} />
            <Input name="url" placeholder="https://…" required autoFocus className="flex-1" />
            <div className="flex gap-2">
              <Button type="submit" variant="secondary">
                Ekle
              </Button>
              <Button type="button" variant="ghost" onClick={() => setUrlMode(false)}>
                Vazgeç
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setUrlMode(true)}
            className="inline-flex items-center gap-1.5 text-caption font-medium text-[var(--text-muted)] hover:text-[var(--primary-text)]"
          >
            <Link2 className="size-3.5" aria-hidden />
            veya URL ile ekle
          </button>
        )}
      </div>

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
