"use client";

import type { ReactNode } from "react";
import { CalendarClock, MapPin, Snowflake } from "lucide-react";
import { catalogFallbackImage } from "@/content/catalog-images";
import { ProductGallery } from "@/components/store/product-gallery";
import type { DealerCatalogProduct, DealerCatalogVariant } from "@/infra/db/dealer-catalog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { splitPdpCopy } from "@/components/store/pdp-description";
import { DealerProductAttributes } from "@/components/dealer/dealer-product-attributes";
import { formatMoney } from "@/lib/format/money";
import { stockAvailabilityLabel, stockTone } from "@/lib/format/stock";
import { cn } from "@/lib/utils";
import { packLabel, salesUnitLabel } from "@/lib/format/packaging";
import { QtyInput } from "@/components/ui/qty-input";

function formatKg(n: number) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(n);
}

function maxOrderableQty(stockKg: number, unitFactor: string) {
  const factor = Number(unitFactor);
  if (!Number.isFinite(factor) || factor <= 0) return 0;
  return Math.max(0, Math.floor(stockKg / factor));
}

function CertificateChips({ labels }: { labels: string[] }) {
  if (labels.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {labels.map((label) => (
        <li
          key={label}
          className="rounded-md border border-[var(--panel-border)] bg-[var(--panel-surface)] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase"
        >
          {label}
        </li>
      ))}
    </ul>
  );
}

export function DealerProductSheet({
  product,
  variant,
  amount,
  pending,
  onClose,
  onSelectVariant,
  onQty,
  onAdd,
  notice,
  error,
}: {
  product: DealerCatalogProduct | null;
  variant: DealerCatalogVariant | null;
  amount: number;
  pending: boolean;
  onClose: () => void;
  onSelectVariant: (variantId: string) => void;
  onQty: (next: number) => void;
  onAdd: () => void;
  notice?: string | null;
  error?: string | null;
}) {
  const open = Boolean(product && variant);
  const { lead, body } = splitPdpCopy(product?.description ?? "");
  const stockKg = variant?.stockKg ?? 0;
  const tone = variant ? stockTone(stockKg) : "empty";
  const maxQty = variant ? maxOrderableQty(stockKg, variant.unitFactor) : 0;
  const insufficientForMoq = variant ? maxQty < variant.moq : true;
  const outOfStock = tone === "empty";

  const storageBits: string[] = [];
  if (product?.storageCondition) storageBits.push(product.storageCondition);
  if (product?.shelfLifeDays) {
    storageBits.push(
      `Raf ömrü ${product.shelfLifeDays} gün. Sevkiyat FEFO ile önerilir; SKT geçmiş lot sevk edilmez.`,
    );
  }
  if (product?.usageTips) storageBits.push(product.usageTips);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="right"
        className="flex h-full max-h-[100dvh] w-full flex-col gap-0 overflow-hidden p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md data-[side=right]:md:max-w-lg data-[side=right]:lg:max-w-xl"
      >
        {product && variant ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="border-b border-[var(--panel-border)] px-4 pt-4 pb-4 sm:px-5 md:grid md:grid-cols-[10.5rem_minmax(0,1fr)] md:items-start md:gap-4 lg:grid-cols-[11.5rem_minmax(0,1fr)]">
                <div className="mx-auto w-full max-w-[13rem] overflow-hidden rounded-xl bg-[#EFEAE0] md:mx-0 md:max-w-none">
                  <ProductGallery
                    items={product.media.map((m) => ({
                      id: m.id,
                      url: m.url,
                      alt: null,
                      kind: m.kind,
                    }))}
                    fallbackUrl={catalogFallbackImage(product.categoryName, product.imageUrl)}
                    fallbackAlt={product.name}
                    stageClassName="aspect-[4/3] max-h-[11rem] w-full rounded-xl sm:max-h-[12rem] md:aspect-square md:max-h-[10.5rem]"
                    imageClassName="object-cover p-0"
                  />
                </div>

                <SheetHeader className="mt-4 min-w-0 space-y-2 p-0 text-left md:mt-0 md:pr-8">
                  <p className="text-[10px] font-semibold tracking-wider text-[var(--panel-ink-muted)] uppercase">
                    {product.categoryName}
                  </p>
                  <SheetTitle className="text-base leading-snug font-semibold tracking-tight text-[var(--panel-ink)] sm:text-lg">
                    {product.name}
                  </SheetTitle>
                  <SheetDescription className="text-xs leading-relaxed text-[var(--panel-ink-muted)]">
                    {packLabel(variant.packSize, variant.packagingType)}
                    {" · "}
                    <span className="font-mono tabular-nums">{variant.sku}</span>
                  </SheetDescription>
                  <CertificateChips labels={product.certificates} />
                </SheetHeader>
              </div>

              <div className="space-y-5 px-4 py-4 sm:px-5">
                {lead || body ? (
                  <div className="space-y-2">
                    {lead ? (
                      <p className="text-sm leading-relaxed text-[var(--panel-ink)]">{lead}</p>
                    ) : null}
                    {body ? (
                      <p className="text-xs leading-relaxed text-[var(--panel-ink-muted)]">{body}</p>
                    ) : null}
                  </div>
                ) : null}

                {product.attributeValues.length > 0 ? (
                  <DealerProductAttributes values={product.attributeValues} compact />
                ) : null}

                <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <Fact
                    icon={<Snowflake className="size-3.5" aria-hidden />}
                    title="Soğuk zincir"
                    body={
                      product.requiresColdChain
                        ? "Sevkiyat soğuk araçla yapılır."
                        : "Soğuk zincir zorunlu değil."
                    }
                  />
                  <Fact
                    icon={<CalendarClock className="size-3.5" aria-hidden />}
                    title="Saklama"
                    body={storageBits[0] ?? "Saklama bilgisi yok."}
                  />
                  <Fact
                    icon={<MapPin className="size-3.5" aria-hidden />}
                    title={product.producer.name}
                    body={
                      [product.producer.region, product.producer.story].filter(Boolean).join(" ") ||
                      "Üretici hikâyesi yok."
                    }
                  />
                </dl>

                {product.variants.length > 1 ? (
                  <div>
                    <p className="text-[11px] font-semibold tracking-wide text-[var(--panel-ink-muted)] uppercase">
                      Cins
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {product.variants.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onSelectVariant(opt.id)}
                          className={cn(
                            "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                            opt.id === variant.id
                              ? "border-[var(--primary-solid)] bg-[var(--primary-subtle)] text-[var(--primary-text)]"
                              : "border-[var(--panel-border)] text-[var(--panel-ink-muted)] hover:border-[var(--primary-solid)]/40",
                          )}
                        >
                          {packLabel(opt.packSize, opt.packagingType)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 space-y-2.5 border-t border-[var(--panel-border)] bg-[var(--panel-surface)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="text-lg font-semibold tabular-nums text-[var(--panel-ink)]">
                    {formatMoney(variant.unitPrice)}
                    <span className="ml-1 text-xs font-medium text-[var(--panel-ink-muted)]">
                      / {salesUnitLabel(variant.packagingType)}
                    </span>
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-xs font-medium tabular-nums",
                      tone === "empty" && "text-[var(--danger-text)]",
                      tone === "low" && "text-amber-700",
                      tone === "ok" && "text-[var(--panel-ink-muted)]",
                    )}
                  >
                    {stockAvailabilityLabel(stockKg)}
                    <span className="ml-2 font-normal text-[var(--panel-ink-muted)]">
                      %{variant.vatRateBasisPoints / 100} KDV
                    </span>
                  </p>
                </div>

                <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
                  <QtyInput
                    value={amount}
                    min={variant.moq}
                    max={Math.max(variant.moq, maxQty)}
                    disabled={pending || insufficientForMoq || outOfStock}
                    ariaLabel={salesUnitLabel(variant.packagingType)}
                    onCommit={onQty}
                  />
                  <span className="hidden shrink-0 text-xs font-medium text-[var(--panel-ink-muted)] sm:inline">
                    {salesUnitLabel(variant.packagingType)}
                  </span>
                  <button
                    type="button"
                    disabled={pending || insufficientForMoq || outOfStock}
                    onClick={onAdd}
                    className={cn(
                      "inline-flex h-10 flex-1 items-center justify-center rounded-md px-4 text-sm font-semibold disabled:pointer-events-none sm:flex-none",
                      outOfStock || insufficientForMoq
                        ? "bg-[var(--surface-3)] text-[var(--panel-ink-muted)] ring-1 ring-[var(--panel-border)]"
                        : "bg-[var(--primary-solid)] text-white hover:bg-[var(--primary-hover)] dark:text-[#06231a]",
                    )}
                  >
                    {outOfStock || insufficientForMoq ? "Stok yetersiz" : "Sepete ekle"}
                  </button>
                </div>
              </div>
              {!insufficientForMoq && !outOfStock ? (
                <p className="text-[11px] text-[var(--panel-ink-muted)]">
                  Maks. {maxQty} {salesUnitLabel(variant.packagingType)} ({formatKg(stockKg)} kg)
                </p>
              ) : null}
              {notice ? (
                <p className="text-xs font-medium text-[var(--primary-text)]">{notice}</p>
              ) : null}
              {error ? <p className="text-xs text-[var(--danger-text)]">{error}</p> : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Fact({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--panel-border)] bg-[var(--panel-surface)] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--primary-text)]">
          {icon}
        </div>
        <dt className="text-[11px] font-semibold text-[var(--panel-ink)]">{title}</dt>
      </div>
      <dd className="mt-1.5 line-clamp-3 text-[12px] leading-snug text-[var(--panel-ink-muted)]">
        {body}
      </dd>
    </div>
  );
}
