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
        className="w-full gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl data-[side=right]:lg:max-w-3xl"
      >
        {product && variant ? (
          <>
            <div className="grid gap-5 px-6 pt-6 sm:grid-cols-[minmax(15rem,18.5rem)_minmax(0,1fr)] sm:items-stretch">
              <div className="h-full min-h-[16rem] overflow-hidden rounded-2xl bg-[#EFEAE0]">
                <ProductGallery
                  items={product.media.map((m) => ({ id: m.id, url: m.url, alt: null, kind: m.kind }))}
                  fallbackUrl={catalogFallbackImage(product.categoryName, null)}
                  fallbackAlt={product.name}
                  className="h-full"
                  stageClassName="aspect-auto h-full min-h-[16rem] max-h-none sm:aspect-auto sm:max-h-none rounded-2xl"
                  imageClassName="object-cover p-0"
                />
              </div>

              <SheetHeader className="min-w-0 p-0 text-left">
                <p className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
                  {product.categoryName}
                </p>
                <SheetTitle className="text-2xl font-semibold tracking-tight text-[var(--panel-ink)]">
                  {product.name}
                </SheetTitle>
                <SheetDescription className="text-[var(--panel-ink-muted)]">
                  {packLabel(variant.packSize, variant.packagingType)}
                  {" · "}
                  {variant.sku}
                </SheetDescription>
                {product.certificates.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {product.certificates.map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-[var(--primary-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--primary-text)]"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ) : null}
                {lead ? (
                  <p className="pt-3 text-[15px] leading-relaxed text-[var(--panel-ink)]">{lead}</p>
                ) : null}
                {body ? (
                  <p className="text-sm leading-relaxed text-[var(--panel-ink-muted)]">{body}</p>
                ) : null}
                {product.attributeValues.length > 0 ? (
                  <div className="pt-3">
                    <DealerProductAttributes values={product.attributeValues} />
                  </div>
                ) : null}
              </SheetHeader>
            </div>

            <div className="space-y-6 px-6 py-6">
              <dl className="grid gap-3 sm:grid-cols-3">
                <Fact
                  icon={<Snowflake className="size-4" aria-hidden />}
                  title="Soğuk zincir"
                  body={
                    product.requiresColdChain
                      ? "Sevkiyat soğuk araçla yapılır."
                      : "Soğuk zincir zorunlu değil."
                  }
                />
                <Fact
                  icon={<CalendarClock className="size-4" aria-hidden />}
                  title="Saklama"
                  body={storageBits[0] ?? "Saklama bilgisi yok."}
                />
                <Fact
                  icon={<MapPin className="size-4" aria-hidden />}
                  title={product.producer.name}
                  body={
                    [product.producer.region, product.producer.story].filter(Boolean).join(" ") ||
                    "Üretici hikâyesi yok."
                  }
                />
              </dl>

              {product.variants.length > 1 ? (
                <div>
                  <p className="text-xs font-medium text-[var(--panel-ink)]">Cins</p>
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

            <div className="sticky bottom-0 mt-auto space-y-3 border-t border-[var(--panel-border)] bg-[var(--panel-surface)] px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                <div>
                  <p className="text-xl font-semibold tabular-nums text-[var(--panel-ink)]">
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

                <div className="flex items-center gap-2">
                  <QtyInput
                    value={amount}
                    min={variant.moq}
                    max={Math.max(variant.moq, maxQty)}
                    disabled={pending || insufficientForMoq || outOfStock}
                    ariaLabel={salesUnitLabel(variant.packagingType)}
                    onCommit={onQty}
                  />
                  <span className="hidden text-xs font-medium text-[var(--panel-ink-muted)] sm:inline">
                    {salesUnitLabel(variant.packagingType)}
                  </span>
                  <button
                    type="button"
                    disabled={pending || insufficientForMoq || outOfStock}
                    onClick={onAdd}
                    className={cn(
                      "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold disabled:pointer-events-none",
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
    <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--surface-3)] px-3.5 py-3">
      <div className="flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--panel-surface)] text-[var(--primary-text)]">
          {icon}
        </div>
        <dt className="text-xs font-semibold text-[var(--panel-ink)]">{title}</dt>
      </div>
      <dd className="mt-2 text-[13px] leading-snug text-[var(--panel-ink-muted)]">
        {body}
      </dd>
    </div>
  );
}
