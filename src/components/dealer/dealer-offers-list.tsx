"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Package } from "lucide-react";
import { Stagger, StaggerItem, HoverLift } from "@/components/motion";
import { cn } from "@/lib/utils";

export type DealerOffer = {
  id: string;
  productName: string;
  slug: string;
  variantId: string;
  imageUrl: string | null;
  packLabel: string;
  lotNumber: string;
  sku: string;
  expiryLabel: string;
  daysLeft: number;
  remainingKgLabel: string;
  priceLabel: string;
};

function urgencyTone(daysLeft: number) {
  if (daysLeft <= 7) return "danger" as const;
  if (daysLeft <= 14) return "warn" as const;
  return "soft" as const;
}

export function DealerOffersList({ offers }: { offers: DealerOffer[] }) {
  return (
    <Stagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {offers.map((o) => {
        const tone = urgencyTone(o.daysLeft);
        const detailHref = `/bayi/siparis?urun=${encodeURIComponent(o.slug)}&cins=${encodeURIComponent(o.variantId)}`;
        return (
          <StaggerItem key={o.id}>
            <HoverLift className="h-full">
              <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--panel-border)] bg-white shadow-[var(--shadow-sm)]">
                <Link
                  href={detailHref}
                  className="group/img relative block aspect-[16/10] overflow-hidden bg-[var(--surface-3)]"
                  title={`${o.productName} detayını aç`}
                >
                  {o.imageUrl ? (
                    <Image
                      src={o.imageUrl}
                      alt={o.productName}
                      fill
                      className="object-cover transition-transform duration-500 group-hover/img:scale-[1.06]"
                      sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 90vw"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-[var(--panel-ink-muted)]">
                      <Package className="size-8" aria-hidden />
                    </span>
                  )}
                  <span
                    className={cn(
                      "absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-sm",
                      tone === "danger" && "bg-[var(--danger-text)] text-white",
                      tone === "warn" && "bg-amber-100/95 text-amber-900",
                      tone === "soft" && "bg-white/90 text-[var(--panel-ink)]",
                    )}
                  >
                    <Clock className="size-3" aria-hidden />
                    SKT {o.daysLeft} gün
                  </span>
                </Link>

                <div className="flex flex-1 flex-col gap-2 p-3.5">
                  <div className="min-w-0">
                    <Link href={detailHref} className="block">
                      <h2 className="truncate text-[15px] font-semibold text-[var(--panel-ink)] transition-colors hover:text-[var(--primary-text)]">
                        {o.productName}
                      </h2>
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-[var(--panel-ink-muted)]">
                      {o.packLabel} · Lot {o.lotNumber}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--panel-ink-muted)]">
                      SKT {o.expiryLabel}
                    </p>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
                      Kalan {o.remainingKgLabel} kg
                    </span>
                    <span className="text-[15px] font-semibold tabular-nums text-[var(--panel-ink)]">
                      {o.priceLabel}
                    </span>
                  </div>

                  <Link
                    href={detailHref}
                    className="mt-auto inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[var(--primary-solid)] text-xs font-semibold text-white transition-colors hover:bg-[var(--primary-hover)]"
                  >
                    Siparişe git
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </div>
              </article>
            </HoverLift>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
