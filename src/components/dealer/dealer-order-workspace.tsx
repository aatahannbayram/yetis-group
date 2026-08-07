"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  Landmark,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Wallet,
} from "lucide-react";
import type { DealerCatalogProduct } from "@/infra/db/dealer-catalog";
import type { DealerCartView } from "@/app/(dealer-portal)/bayi/siparis/actions";
import {
  dealerAddToCartAction,
  dealerRemoveLineAction,
  dealerSetQtyAction,
  dealerSubmitOrderAction,
} from "@/app/(dealer-portal)/bayi/siparis/actions";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { stockAvailabilityLabel, stockTone } from "@/lib/format/stock";
import { cn } from "@/lib/utils";

const PACK_LABEL: Record<string, string> = {
  TENEKE: "Teneke",
  VAKUM: "Vakum",
  KOLI: "Koli",
  KUTU: "Kutu",
  DOKME: "Dökme",
};

type PaymentInfo = {
  bankTransferEnabled: boolean;
  bankName: string;
  accountHolder: string;
  iban: string;
  note: string;
};

function stockLabel(kg: number) {
  const tone = stockTone(kg);
  return { text: stockAvailabilityLabel(kg), tone };
}

function formatKg(n: number) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(n);
}

export function DealerOrderWorkspace({
  products,
  initialCart,
  payment,
}: {
  products: DealerCatalogProduct[];
  initialCart: DealerCartView | null;
  payment: PaymentInfo;
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
    return init;
  });
  const [qty, setQty] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<"BANK_TRANSFER" | "ON_ACCOUNT">(
    payment.bankTransferEnabled ? "BANK_TRANSFER" : "ON_ACCOUNT",
  );
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
      return p.variants.some(
        (v) =>
          v.sku.toLocaleLowerCase("tr-TR").includes(q) ||
          (v.packSize?.toLocaleLowerCase("tr-TR").includes(q) ?? false),
      );
    });
  }, [products, search, category]);

  function variantOf(product: DealerCatalogProduct) {
    const id = selected[product.id] ?? product.variants[0]?.id;
    return product.variants.find((v) => v.id === id) ?? product.variants[0]!;
  }

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
      router.push(`/bayi/siparislerim?yeni=${res.orderId}`);
      router.refresh();
    });
  }

  return (
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
              const amount = qty[product.id] ?? v.moq;
              return (
                <li key={product.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-3)] sm:size-20">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-[var(--panel-ink-muted)]">
                        <Package className="size-7" aria-hidden />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <p className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
                        {product.categoryName}
                      </p>
                      <h2 className="truncate text-[15px] font-semibold text-[var(--panel-ink)]">
                        {product.name}
                      </h2>
                    </div>

                    {product.variants.length > 1 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {product.variants.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              setSelected((s) => ({ ...s, [product.id]: opt.id }))
                            }
                            className={cn(
                              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                              selected[product.id] === opt.id
                                ? "border-[var(--primary-solid)] bg-[var(--primary-subtle)] text-[var(--primary-text)]"
                                : "border-[var(--panel-border)] text-[var(--panel-ink-muted)] hover:border-[var(--primary-solid)]/40",
                            )}
                          >
                            {opt.packSize ?? PACK_LABEL[opt.packagingType] ?? opt.sku}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--panel-ink-muted)]">
                        {v.packSize ?? PACK_LABEL[v.packagingType]} · {v.sku}
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
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center rounded-md border border-[var(--panel-border)]">
                        <button
                          type="button"
                          className="flex size-9 items-center justify-center text-[var(--panel-ink-muted)] hover:bg-[var(--surface-3)]"
                          onClick={() =>
                            setQty((q) => ({
                              ...q,
                              [product.id]: Math.max(v.moq, amount - 1),
                            }))
                          }
                          aria-label="Azalt"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">{amount}</span>
                        <button
                          type="button"
                          className="flex size-9 items-center justify-center text-[var(--panel-ink-muted)] hover:bg-[var(--surface-3)]"
                          onClick={() =>
                            setQty((q) => ({ ...q, [product.id]: amount + 1 }))
                          }
                          aria-label="Artır"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={pending || v.stockKg <= 0}
                        onClick={() => addProduct(product)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[var(--primary-solid)] px-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-40"
                      >
                        <Plus className="size-3.5" aria-hidden />
                        {v.stockKg <= 0 ? "Stok yok" : "Ekle"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <aside className="lg:sticky lg:top-20">
        <div className="overflow-hidden rounded-xl border border-[var(--panel-border)] bg-white shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between border-b border-[var(--panel-border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-4 text-[var(--primary-text)]" aria-hidden />
              <h2 className="text-sm font-semibold text-[var(--panel-ink)]">Sepet</h2>
            </div>
            <span className="text-xs tabular-nums text-[var(--panel-ink-muted)]">
              {cart?.itemCount ?? 0} adet
            </span>
          </div>

          <div className="max-h-[42vh] space-y-3 overflow-y-auto px-4 py-3">
            {!cart?.lines.length ? (
              <p className="py-6 text-center text-sm text-[var(--panel-ink-muted)]">
                Sepetiniz boş. Soldan ürün ekleyin.
              </p>
            ) : (
              cart.lines.map((line) => (
                <div key={line.id} className="flex gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-[var(--surface-3)]">
                    {line.imageUrl ? (
                      <Image src={line.imageUrl} alt="" fill className="object-cover" sizes="48px" />
                    ) : (
                      <Package className="m-auto size-5 text-[var(--panel-ink-muted)]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--panel-ink)]">{line.name}</p>
                    <p className="text-[11px] text-[var(--panel-ink-muted)]">
                      {line.unitLabel} · {line.sku}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded border border-[var(--panel-border)]">
                        <button
                          type="button"
                          className="flex size-7 items-center justify-center"
                          disabled={pending}
                          onClick={() => changeQty(line.id, line.quantity - 1)}
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-xs tabular-nums">{line.quantity}</span>
                        <button
                          type="button"
                          className="flex size-7 items-center justify-center"
                          disabled={pending}
                          onClick={() => changeQty(line.id, line.quantity + 1)}
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold tabular-nums">
                          {formatMoney(money(line.lineTotalKurus))}
                        </span>
                        <button
                          type="button"
                          className="text-[var(--panel-ink-muted)] hover:text-[var(--danger-text)]"
                          onClick={() => removeLine(line.id)}
                          aria-label="Satırı sil"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3 border-t border-[var(--panel-border)] px-4 py-4">
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
                  active={paymentMethod === "BANK_TRANSFER"}
                  onSelect={() => setPaymentMethod("BANK_TRANSFER")}
                  icon={Landmark}
                  title="Havale / EFT"
                  description="Sipariş sonrası IBAN bilgisi"
                />
              ) : null}
              <PaymentOption
                active={paymentMethod === "ON_ACCOUNT"}
                onSelect={() => setPaymentMethod("ON_ACCOUNT")}
                icon={Wallet}
                title="Cari hesap"
                description="Vade ve limit üzerinden"
              />
            </fieldset>

            {paymentMethod === "BANK_TRANSFER" && payment.bankTransferEnabled ? (
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

            {message ? (
              <p className="flex items-center gap-1.5 text-xs text-[var(--primary-text)]">
                <Check className="size-3.5" aria-hidden />
                {message}
              </p>
            ) : null}
            {error ? <p className="text-xs text-[var(--danger-text)]">{error}</p> : null}

            <button
              type="button"
              disabled={pending || !cart?.lines.length}
              onClick={submit}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-[var(--panel-ink)] text-sm font-semibold text-white transition-[transform,background-color] hover:bg-black active:scale-[0.99] disabled:opacity-40"
            >
              {pending ? "Gönderiliyor…" : "Siparişi gönder"}
            </button>
          </div>
        </div>
      </aside>
    </div>
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
