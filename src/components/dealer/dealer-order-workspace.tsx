"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Building2,
  Check,
  CreditCard,
  Landmark,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Wallet,
} from "lucide-react";
import { QtyInput } from "@/components/ui/qty-input";
import type { DealerCatalogProduct } from "@/infra/db/dealer-catalog";
import type { DealerCartView } from "@/app/(dealer-portal)/bayi/siparis/actions";
import {
  dealerAddToCartAction,
  dealerRemoveLineAction,
  dealerSetQtyAction,
  dealerSubmitOrderAction,
} from "@/app/(dealer-portal)/bayi/siparis/actions";
import { DealerProductSheet } from "@/components/dealer/dealer-product-sheet";
import { OrderCelebrate } from "@/components/store/order-celebrate";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCardForm,
  type CardState,
  type CardValidity,
} from "@/components/ui/credit-card-form";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { stockAvailabilityLabel, stockTone } from "@/lib/format/stock";
import { cn } from "@/lib/utils";
import { mixedQuantityNoun, packLabel, packagingTypeLabel, salesUnitLabel } from "@/lib/format/packaging";
import { formatKg } from "@/lib/format/weight";
import { kg } from "@/domain/weight";

type PaymentInfo = {
  bankTransferEnabled: boolean;
  bankName: string;
  accountHolder: string;
  iban: string;
  note: string;
};

type CariInfo = {
  eligible: boolean;
  availableKurus: number | null;
};

function stockLabel(stockKg: number) {
  const tone = stockTone(stockKg);
  return { text: stockAvailabilityLabel(stockKg), tone };
}

/** Stoktaki kg'yi paket adedine çevirir (koli/teneke↔kg katsayısı üzerinden). */
function maxOrderableQty(stockKg: number, unitFactor: string) {
  const factor = Number(unitFactor);
  if (!Number.isFinite(factor) || factor <= 0) return 0;
  return Math.max(0, Math.floor(stockKg / factor));
}

export function DealerOrderWorkspace({
  products,
  initialCart,
  initialProductSlug,
  initialCinsId,
  payment,
  cari,
}: {
  products: DealerCatalogProduct[];
  initialCart: DealerCartView | null;
  initialProductSlug?: string | null;
  initialCinsId?: string | null;
  payment: PaymentInfo;
  cari: CariInfo;
}) {
  const router = useRouter();
  const [cart, setCart] = useState<DealerCartView | null>(initialCart);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of products) {
      if (p.variants[0]) init[p.id] = p.variants[0].id;
    }
    if (initialProductSlug && initialCinsId) {
      const match = products.find((p) => p.slug === initialProductSlug);
      if (match?.variants.some((v) => v.id === initialCinsId)) {
        init[match.id] = initialCinsId;
      }
    }
    return init;
  });
  const [qty, setQty] = useState<Record<string, number>>({});
  const [detailId, setDetailId] = useState<string | null>(() => {
    if (!initialProductSlug) return null;
    return products.find((p) => p.slug === initialProductSlug)?.id ?? null;
  });
  const [paymentMethod, setPaymentMethod] = useState<"HAVALE" | "CARI" | "ONLINE">(
    payment.bankTransferEnabled ? "HAVALE" : "ONLINE",
  );
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardOk, setCardOk] = useState(false);
  const [cardLast4, setCardLast4] = useState("");
  const [draftCardOk, setDraftCardOk] = useState(false);
  const [draftLast4, setDraftLast4] = useState("");
  const [pending, startTransition] = useTransition();
  const reducedMotion = useReducedMotion();

  const onCardChange = useCallback((state: CardState, validity: CardValidity) => {
    setDraftCardOk(validity.allValid);
    setDraftLast4(state.number.length >= 4 ? state.number.slice(-4) : "");
  }, []);

  function selectPaymentMethod(next: "HAVALE" | "CARI" | "ONLINE") {
    setPaymentMethod(next);
    if (next === "ONLINE" && !cardOk) {
      setCardModalOpen(true);
    }
  }

  function handleSaveCard() {
    if (!draftCardOk) return;
    setCardOk(true);
    setCardLast4(draftLast4);
    setCardModalOpen(false);
  }

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.categoryName));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    return products.filter((p) => {
      if (category && p.categoryName !== category) return false;
      if (!q) return true;
      if (p.name.toLocaleLowerCase("tr-TR").includes(q)) return true;
      return p.variants.some((v) => {
        const pack = packLabel(v.packSize, v.packagingType).toLocaleLowerCase("tr-TR");
        const type = packagingTypeLabel(v.packagingType).toLocaleLowerCase("tr-TR");
        return (
          v.sku.toLocaleLowerCase("tr-TR").includes(q) ||
          pack.includes(q) ||
          type.includes(q)
        );
      });
    });
  }, [products, search, category]);

  function variantOf(product: DealerCatalogProduct) {
    const id = selected[product.id] ?? product.variants[0]?.id;
    return product.variants.find((v) => v.id === id) ?? product.variants[0]!;
  }

  const detailProduct = products.find((p) => p.id === detailId) ?? null;
  const detailVariant = detailProduct ? variantOf(detailProduct) : null;
  const cartUnitNoun = mixedQuantityNoun(
    (cart?.lines ?? []).map((l) => l.packagingType),
  );

  function addProduct(product: DealerCatalogProduct) {
    const v = variantOf(product);
    const amount = qty[product.id] ?? v.moq;
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await dealerAddToCartAction(v.id, amount);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setCart(res.cart);
      setMessage(`${product.name} sepete eklendi`);
    });
  }

  function changeQty(lineId: string, next: number) {
    startTransition(async () => {
      const res = await dealerSetQtyAction(lineId, next);
      if (res.ok) setCart(res.cart);
      else setError(res.error);
    });
  }

  function removeLine(lineId: string) {
    startTransition(async () => {
      const res = await dealerRemoveLineAction(lineId);
      if (res.ok) setCart(res.cart);
      else setError(res.error);
    });
  }

  function submit() {
    if (paymentMethod === "ONLINE" && !cardOk) {
      setCardModalOpen(true);
      return;
    }
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await dealerSubmitOrderAction({ paymentMethod, note });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setCart({ id: cart?.id ?? "", lines: [], itemCount: 0, totalKurus: 0 });
      setNote("");
      setCelebrate(true);
      window.setTimeout(() => {
        router.push(`/bayi/siparislerim?yeni=${res.orderId}`);
        router.refresh();
      }, 1100);
    });
  }

  return (
    <>
    <div className="grid gap-6 pb-28 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="space-y-4">
        <header className="border-b border-[var(--panel-border)] pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--panel-ink)]">
            Sipariş ver
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--panel-ink-muted)]">
            Ürünü seçin, paketi belirleyin, sepete ekleyin. Stok sevkiyat edilebilir lotlardan
            hesaplanır.
          </p>
        </header>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Ürün ara</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--panel-ink-muted)]"
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün adı veya stok kodu"
              className="h-11 w-full rounded-lg border border-[var(--panel-border)] bg-white pr-3 pl-10 text-sm outline-none focus-visible:border-[var(--primary-solid)] focus-visible:ring-3 focus-visible:ring-[var(--primary-solid)]/15"
            />
          </label>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterChip label="Tümü" active={!category} onClick={() => setCategory(null)} />
          {categories.map((c) => (
            <FilterChip
              key={c}
              label={c}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--panel-border)] bg-white/60 px-4 py-10 text-center text-sm text-[var(--panel-ink-muted)]">
            Eşleşen ürün yok.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--panel-border)] overflow-hidden rounded-xl border border-[var(--panel-border)] bg-white">
            {filtered.map((product) => {
              const v = variantOf(product);
              const stock = stockLabel(v.stockKg);
              const maxQty = maxOrderableQty(v.stockKg, v.unitFactor);
              const amount = qty[product.id] ?? v.moq;
              const insufficientForMoq = maxQty < v.moq;
              return (
                <li key={product.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
                  <button
                    type="button"
                    onClick={() => setDetailId(product.id)}
                    className="group/img relative size-16 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-3)] text-left sm:size-20"
                    title={`${product.name} detayını aç`}
                  >
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover/img:scale-105 motion-reduce:transition-none motion-reduce:group-hover/img:scale-100"
                        sizes="80px"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-[var(--panel-ink-muted)]">
                        <Package className="size-7" aria-hidden />
                      </span>
                    )}
                  </button>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <p className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
                        {product.categoryName}
                      </p>
                      <button
                        type="button"
                        onClick={() => setDetailId(product.id)}
                        className="block w-full text-left"
                      >
                        <h2 className="truncate text-[15px] font-semibold text-[var(--panel-ink)] transition-colors hover:text-[var(--primary-text)]">
                          {product.name}
                        </h2>
                        <p className="mt-0.5 text-[11px] text-[var(--panel-ink-muted)]">Detayı gör</p>
                      </button>
                    </div>

                    {product.variants.length > 1 ? (
                      <div>
                        <p className="mb-1 text-[11px] font-medium text-[var(--panel-ink-muted)]">
                          Cins
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                        {product.variants.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setSelected((s) => ({ ...s, [product.id]: opt.id }));
                              setQty((q) => {
                                const current = q[product.id] ?? opt.moq;
                                return {
                                  ...q,
                                  [product.id]: Math.max(opt.moq, current),
                                };
                              });
                            }}
                            className={cn(
                              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                              selected[product.id] === opt.id
                                ? "border-[var(--primary-solid)] bg-[var(--primary-subtle)] text-[var(--primary-text)]"
                                : "border-[var(--panel-border)] text-[var(--panel-ink-muted)] hover:border-[var(--primary-solid)]/40",
                            )}
                          >
                            {packLabel(opt.packSize, opt.packagingType)}
                          </button>
                        ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--panel-ink-muted)]">
                        {packLabel(v.packSize, v.packagingType)} · {v.sku}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--panel-ink-muted)]">
                      <span className="font-mono tabular-nums">{v.sku}</span>
                      <span
                        className={cn(
                          "tabular-nums",
                          stock.tone === "empty" && "text-[var(--danger-text)]",
                          stock.tone === "low" && "text-amber-700",
                          stock.tone === "ok" && "text-[var(--primary-text)]",
                        )}
                      >
                        {stock.text}
                      </span>
                      <span>%{(v.vatRateBasisPoints / 100).toString()} KDV</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <p className="text-lg font-semibold tabular-nums text-[var(--panel-ink)]">
                      {formatMoney(v.unitPrice)}
                      <span className="ml-1 text-xs font-medium text-[var(--panel-ink-muted)]">
                        / {salesUnitLabel(v.packagingType)}
                      </span>
                    </p>
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <QtyInput
                            value={amount}
                            min={v.moq}
                            max={Math.max(v.moq, maxQty)}
                            disabled={pending || insufficientForMoq}
                            ariaLabel={salesUnitLabel(v.packagingType)}
                            onCommit={(next) =>
                              setQty((q) => ({ ...q, [product.id]: next }))
                            }
                          />
                        <span className="text-xs font-medium text-[var(--panel-ink-muted)]">
                          {salesUnitLabel(v.packagingType)}
                        </span>
                        <button
                          type="button"
                          disabled={pending || insufficientForMoq}
                          onClick={() => addProduct(product)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--primary-solid)] px-3.5 text-sm font-semibold text-white transition-[transform,background-color] hover:bg-[var(--primary-hover)] active:scale-[0.97] disabled:opacity-40"
                        >
                          <Plus className="size-3.5" aria-hidden />
                          {insufficientForMoq ? "Stok yetersiz" : "Ekle"}
                        </button>
                      </div>
                      {!insufficientForMoq ? (
                        <p className="text-[11px] text-[var(--panel-ink-muted)]">
                          Maks. {maxQty} {salesUnitLabel(v.packagingType)} ({formatKg(kg(v.stockKg.toString()))})
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <aside className="lg:sticky lg:top-20">
        <div className="relative overflow-hidden rounded-xl border border-[var(--panel-border)] bg-white shadow-[var(--shadow-sm)]">
          <OrderCelebrate active={celebrate} />

          <div className="flex items-center justify-between border-b border-[var(--panel-border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-4 text-[var(--primary-text)]" aria-hidden />
              <h2 className="text-sm font-semibold text-[var(--panel-ink)]">Sepet</h2>
            </div>
            <span className="text-xs tabular-nums text-[var(--panel-ink-muted)]">
              {cart?.itemCount ?? 0} {cartUnitNoun}
            </span>
          </div>

          {celebrate ? (
            <motion.div
              className="flex flex-col items-center px-4 py-10 text-center"
              initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-[var(--primary-subtle)]">
                <Check className="size-6 text-[var(--primary-text)]" aria-hidden />
              </span>
              <p className="mt-3 text-[15px] font-semibold text-[var(--panel-ink)]">
                Siparişiniz alındı
              </p>
              <p className="mt-1 max-w-[16rem] text-[13px] leading-relaxed text-[var(--panel-ink-muted)]">
                Sipariş listenize yönlendiriliyorsunuz…
              </p>
            </motion.div>
          ) : (
            <div className="max-h-[42vh] space-y-3 overflow-y-auto px-4 py-3">
              {!cart?.lines.length ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--panel-ink-muted)]">
                    <ShoppingCart className="size-5" aria-hidden />
                  </span>
                  <p className="text-sm text-[var(--panel-ink-muted)]">
                    Sepetiniz boş. Soldan ürün ekleyin.
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {cart.lines.map((line) => (
                    <motion.div
                      key={line.id}
                      layout={!reducedMotion}
                      initial={reducedMotion ? false : { opacity: 0, height: 0, y: -6 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, height: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="flex gap-3 overflow-hidden"
                    >
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-[var(--surface-3)]">
                        {line.imageUrl ? (
                          <Image src={line.imageUrl} alt="" fill className="object-cover" sizes="48px" />
                        ) : (
                          <Package className="m-auto size-5 text-[var(--panel-ink-muted)]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pb-3">
                        <p className="truncate text-sm font-medium text-[var(--panel-ink)]">{line.name}</p>
                        <p className="text-[11px] text-[var(--panel-ink-muted)]">
                          {line.unitLabel} · {line.sku}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <QtyInput
                            size="sm"
                            value={line.quantity}
                            min={1}
                            max={(() => {
                              const v = products
                                .flatMap((p) => p.variants)
                                .find((x) => x.id === line.variantId);
                              if (!v) return undefined;
                              return Math.max(1, maxOrderableQty(v.stockKg, v.unitFactor));
                            })()}
                            disabled={pending}
                            ariaLabel={salesUnitLabel(line.packagingType)}
                            onCommit={(next) => changeQty(line.id, next)}
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold tabular-nums">
                              {formatMoney(money(line.lineTotalKurus))}
                            </span>
                            <button
                              type="button"
                              className="text-[var(--panel-ink-muted)] transition-colors hover:text-[var(--danger-text)]"
                              onClick={() => removeLine(line.id)}
                              aria-label="Satırı sil"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          )}

          <div className={cn("space-y-3 border-t border-[var(--panel-border)] px-4 py-4", celebrate && "hidden")}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[var(--panel-ink-muted)]">Ara toplam</span>
              <span className="text-lg font-semibold tabular-nums text-[var(--panel-ink)]">
                {formatMoney(money(cart?.totalKurus ?? 0))}
              </span>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold tracking-wide text-[var(--panel-ink-muted)] uppercase">
                Ödeme
              </legend>
              {payment.bankTransferEnabled ? (
                <PaymentOption
                  active={paymentMethod === "HAVALE"}
                  onSelect={() => selectPaymentMethod("HAVALE")}
                  icon={Landmark}
                  title="Havale / EFT"
                  description="Sipariş sonrası IBAN bilgisi"
                />
              ) : null}
              <PaymentOption
                active={paymentMethod === "ONLINE"}
                onSelect={() => selectPaymentMethod("ONLINE")}
                icon={CreditCard}
                title="Online ödeme"
                description={
                  cardOk && cardLast4 ? `•••• ${cardLast4} kaydedildi` : "Kartla anında öde"
                }
              />
              {cari.eligible ? (
                <PaymentOption
                  active={paymentMethod === "CARI"}
                  onSelect={() => selectPaymentMethod("CARI")}
                  icon={Wallet}
                  title="Cari hesap"
                  description="Vade ve limit üzerinden"
                />
              ) : null}
            </fieldset>

            {paymentMethod === "ONLINE" ? (
              <button
                type="button"
                onClick={() => setCardModalOpen(true)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-[var(--panel-border)] bg-[var(--surface-3)]/50 px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-3)]"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--panel-ink)]">Kart bilgileri</p>
                  <p className="mt-0.5 text-[11px] text-[var(--panel-ink-muted)]">
                    {cardOk && cardLast4
                      ? `•••• ${cardLast4} kaydedildi. Düzenlemek için dokunun.`
                      : "Kart numarasını güvenli formda girin."}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-[var(--primary-text)]">
                  {cardOk ? "Düzenle" : "Aç"}
                </span>
              </button>
            ) : null}

            {paymentMethod === "HAVALE" && payment.bankTransferEnabled ? (
              <div className="rounded-lg border border-[var(--panel-border)] bg-[var(--surface-3)]/60 p-3 text-xs text-[var(--panel-ink)]">
                <p className="flex items-center gap-1.5 font-semibold">
                  <Building2 className="size-3.5" aria-hidden />
                  {payment.bankName || "Banka"}
                </p>
                <p className="mt-1 text-[var(--panel-ink-muted)]">{payment.accountHolder}</p>
                <p className="mt-1 font-mono text-[13px] tracking-wide break-all">{payment.iban}</p>
                {payment.note ? (
                  <p className="mt-2 text-[var(--panel-ink-muted)]">{payment.note}</p>
                ) : null}
              </div>
            ) : null}

            {paymentMethod === "CARI" && cari.eligible && cari.availableKurus != null ? (
              <div className="rounded-lg border border-[var(--panel-border)] bg-[var(--surface-3)]/60 p-3 text-xs text-[var(--panel-ink)]">
                <p className="flex items-center gap-1.5 font-semibold">
                  <Wallet className="size-3.5" aria-hidden />
                  Kullanılabilir limit
                </p>
                <p className="mt-1 tabular-nums text-[var(--panel-ink-muted)]">
                  {formatMoney(money(cari.availableKurus))}
                </p>
              </div>
            ) : null}

            <label className="block">
              <span className="text-xs font-medium text-[var(--panel-ink-muted)]">Sipariş notu</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Teslimat / özel istek"
                className="mt-1 w-full resize-none rounded-lg border border-[var(--panel-border)] bg-white px-3 py-2 text-sm outline-none focus-visible:border-[var(--primary-solid)]"
              />
            </label>

            <AnimatePresence>
              {message ? (
                <motion.p
                  key="message"
                  initial={reducedMotion ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-1.5 text-xs text-[var(--primary-text)]"
                >
                  <Check className="size-3.5" aria-hidden />
                  {message}
                </motion.p>
              ) : null}
            </AnimatePresence>
            {error ? <p className="text-xs text-[var(--danger-text)]">{error}</p> : null}

            <button
              type="button"
              disabled={pending || !cart?.lines.length}
              onClick={submit}
              className="flex h-11 w-full items-center justify-center rounded-full bg-[var(--panel-ink)] text-sm font-semibold text-white transition-[transform,background-color] hover:bg-black active:scale-[0.97] disabled:opacity-40"
            >
              {pending ? "Gönderiliyor…" : "Siparişi gönder"}
            </button>
          </div>
        </div>
      </aside>
    </div>

      <DealerProductSheet
        product={detailProduct}
        variant={detailVariant}
        amount={
          detailProduct && detailVariant
            ? (qty[detailProduct.id] ?? detailVariant.moq)
            : 1
        }
        pending={pending}
        onClose={() => setDetailId(null)}
        onSelectVariant={(variantId) => {
          if (!detailProduct) return;
          setSelected((s) => ({ ...s, [detailProduct.id]: variantId }));
        }}
        onQty={(next) => {
          if (!detailProduct) return;
          setQty((q) => ({ ...q, [detailProduct.id]: next }));
        }}
        onAdd={() => {
          if (detailProduct) addProduct(detailProduct);
        }}
        notice={message}
        error={error}
      />

      <Dialog open={cardModalOpen} onOpenChange={setCardModalOpen}>
        <DialogContent
          overlayClassName="z-[80]"
          className="z-[80] max-h-[min(92dvh,820px)] w-full max-w-[calc(100%-1.25rem)] overflow-y-auto p-0 sm:max-w-lg"
        >
          <DialogHeader className="border-b border-[var(--panel-border)] px-5 py-4 pr-12">
            <DialogTitle className="text-[1.125rem] font-semibold tracking-[-0.02em] text-[var(--panel-ink)]">
              Kart ile ödeme
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[var(--panel-ink-muted)]">
              {formatMoney(money(cart?.totalKurus ?? 0))} · CVV ve tam numara saklanmaz
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 py-4">
            <CreditCardForm
              maskMiddle
              showSubmit={false}
              title="Kart bilgileri"
              brandLabel="Yetiş Kart"
              onChange={onCardChange}
            />
          </div>

          <DialogFooter className="mx-0 mb-0 gap-2 rounded-b-xl border-t border-[var(--panel-border)] bg-[var(--surface-3)]/50 p-4 sm:justify-stretch">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-full"
              onClick={() => setCardModalOpen(false)}
            >
              Vazgeç
            </Button>
            <button
              type="button"
              disabled={!draftCardOk}
              onClick={handleSaveCard}
              className="inline-flex h-11 flex-[1.4] items-center justify-center rounded-full bg-[var(--primary-solid)] text-[14px] font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50"
            >
              Kartı Kaydet
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 shrink-0 rounded-md border px-3 text-xs font-medium transition-colors",
        active
          ? "border-[var(--panel-ink)] bg-[var(--panel-ink)] text-white"
          : "border-[var(--panel-border)] bg-white text-[var(--panel-ink-muted)] hover:border-[var(--panel-ink)]/30",
      )}
    >
      {label}
    </button>
  );
}

function PaymentOption({
  active,
  onSelect,
  icon: Icon,
  title,
  description,
}: {
  active: boolean;
  onSelect: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
        active
          ? "border-[var(--primary-solid)] bg-[var(--primary-subtle)]"
          : "border-[var(--panel-border)] hover:border-[var(--primary-solid)]/35",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-[var(--primary-text)]" aria-hidden />
      <span>
        <span className="block text-sm font-semibold text-[var(--panel-ink)]">{title}</span>
        <span className="block text-[11px] text-[var(--panel-ink-muted)]">{description}</span>
      </span>
    </button>
  );
}
