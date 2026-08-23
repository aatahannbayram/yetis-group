"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import {
  Building2,
  Banknote,
  CreditCard,
  Landmark,
  Package,
  ShoppingCart,
  Trash2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QtyInput } from "@/components/ui/qty-input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { OrderCelebrate, OrderCelebrateStamp } from "@/components/store/order-celebrate";
import { useDealerCart } from "@/components/dealer/dealer-cart-context";
import { dealerSubmitOrderAction } from "@/app/(dealer-portal)/bayi/siparis/actions";
import type { OrderPaymentMethod } from "@/generated/prisma";
import { money } from "@/domain/money";
import { formatMoney } from "@/lib/format/money";
import { mixedQuantityNoun, salesUnitLabel } from "@/lib/format/packaging";
import { cn } from "@/lib/utils";

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

export function DealerCartSheet({
  payment,
  cari,
}: {
  payment: PaymentInfo;
  cari: CariInfo;
}) {
  const { cart, itemCount, totalKurus, isOpen, close, removeLine, setQuantity, setCart } =
    useDealerCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<"cart" | "pay">("cart");
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>(
    payment.bankTransferEnabled ? "HAVALE" : "ONLINE",
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardOk, setCardOk] = useState(false);
  const [cardLast4, setCardLast4] = useState("");
  const [draftCardOk, setDraftCardOk] = useState(false);
  const [draftLast4, setDraftLast4] = useState("");
  const [celebrate, setCelebrate] = useState(false);

  const lines = cart?.lines ?? [];
  const unitNoun = mixedQuantityNoun(lines.map((l) => l.packagingType));

  const onCardChange = useCallback((state: CardState, validity: CardValidity) => {
    setDraftCardOk(validity.allValid);
    setDraftLast4(state.number.length >= 4 ? state.number.slice(-4) : "");
  }, []);

  function resetCheckout() {
    setStep("cart");
    setNote("");
    setError(null);
    setCelebrate(false);
    setCardModalOpen(false);
    setPaymentMethod(payment.bankTransferEnabled ? "HAVALE" : "ONLINE");
  }

  function selectPaymentMethod(next: OrderPaymentMethod) {
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

  function handleStartCheckout() {
    setStep("pay");
    setError(null);
  }

  function handleConfirmPay() {
    if (paymentMethod === "ONLINE" && !cardOk) {
      setCardModalOpen(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await dealerSubmitOrderAction({ paymentMethod, note });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setCart({ id: cart?.id ?? "", lines: [], itemCount: 0, totalKurus: 0 });
      setCelebrate(true);
      window.setTimeout(() => {
        close();
        resetCheckout();
        router.push(`/bayi/siparislerim?yeni=${res.orderId}`);
        router.refresh();
      }, 1100);
    });
  }

  return (
    <>
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            close();
            resetCheckout();
          }
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-hidden border-l border-[var(--panel-border)] bg-[var(--panel-canvas)] p-0 sm:max-w-md"
        >
          <OrderCelebrate active={celebrate} />

          <SheetHeader className="border-b border-[var(--panel-border)] bg-[var(--panel-surface)] px-5 py-4 pr-12">
            <SheetTitle className="text-[1.25rem] font-semibold tracking-[-0.02em] text-[var(--panel-ink)]">
              {step === "pay" ? (celebrate ? "Sipariş alındı" : "Ödeme") : "Sepet"}
            </SheetTitle>
            <SheetDescription className="text-[13px] text-[var(--panel-ink-muted)]">
              {step === "pay"
                ? formatMoney(money(totalKurus))
                : lines.length === 0
                  ? "Henüz ürün yok"
                  : `${lines.length} kalem · ${itemCount} ${unitNoun}`}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {step === "cart" ? (
              lines.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-[var(--surface-3)] text-[var(--panel-ink-muted)]">
                    <ShoppingCart className="size-6" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-[var(--panel-ink)]">
                      Sepetiniz boş
                    </p>
                    <p className="mt-1 max-w-[16rem] text-[13px] leading-relaxed text-[var(--panel-ink-muted)]">
                      Kataloğa dönüp ürün ekleyin.
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="flex flex-col divide-y divide-[var(--panel-border)]">
                  {lines.map((line) => (
                    <li key={line.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex gap-3">
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-3)]">
                          {line.imageUrl ? (
                            <Image
                              src={line.imageUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-[var(--panel-ink-muted)]">
                              <Package className="size-5" aria-hidden />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-[var(--panel-ink)]">
                                {line.name}
                              </p>
                              <p className="mt-0.5 text-[12px] text-[var(--panel-ink-muted)]">
                                {line.unitLabel} · {line.sku}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeLine(line.id)}
                              className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--panel-ink-muted)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--danger-text)]"
                              aria-label="Kaldır"
                            >
                              <Trash2 className="size-4" aria-hidden />
                            </button>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between gap-2">
                            <QtyInput
                              size="sm"
                              value={line.quantity}
                              min={1}
                              ariaLabel={salesUnitLabel(line.packagingType)}
                              onCommit={(next) => setQuantity(line.id, next)}
                            />
                            <div className="text-right">
                              <p className="text-[15px] font-semibold tabular-nums text-[var(--panel-ink)]">
                                {formatMoney(money(line.lineTotalKurus))}
                              </p>
                              <p className="text-[11px] tabular-nums text-[var(--panel-ink-muted)]">
                                {formatMoney(money(line.unitPriceKurus))} /{" "}
                                {salesUnitLabel(line.packagingType)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            ) : celebrate ? (
              <div className="space-y-3 py-2">
                <OrderCelebrateStamp />
              </div>
            ) : (
              <div className="space-y-4 py-1">
                <div className="grid grid-cols-1 gap-2">
                  {payment.bankTransferEnabled ? (
                    <PayOption
                      active={paymentMethod === "HAVALE"}
                      onSelect={() => selectPaymentMethod("HAVALE")}
                      icon={Landmark}
                      title="Havale / EFT"
                      description="Sipariş sonrası IBAN bilgisi"
                    />
                  ) : null}
                  <PayOption
                    active={paymentMethod === "ONLINE"}
                    onSelect={() => selectPaymentMethod("ONLINE")}
                    icon={CreditCard}
                    title="Online ödeme"
                    description={
                      cardOk && cardLast4 ? `•••• ${cardLast4} kaydedildi` : "Kartla anında öde"
                    }
                  />
                  <PayOption
                    active={paymentMethod === "KAPIDA_NAKIT"}
                    onSelect={() => selectPaymentMethod("KAPIDA_NAKIT")}
                    icon={Banknote}
                    title="Kapıda nakit"
                    description="Teslimatta nakit tahsil edilir"
                  />
                  <PayOption
                    active={paymentMethod === "KAPIDA_POS"}
                    onSelect={() => selectPaymentMethod("KAPIDA_POS")}
                    icon={CreditCard}
                    title="Kapıda kart (POS)"
                    description="Kurye POS fişini sisteme yükler"
                  />
                  {cari.eligible ? (
                    <PayOption
                      active={paymentMethod === "CARI"}
                      onSelect={() => selectPaymentMethod("CARI")}
                      icon={Wallet}
                      title="Cari hesap"
                      description="Vade ve limit üzerinden"
                    />
                  ) : null}
                </div>

                {paymentMethod === "KAPIDA_NAKIT" || paymentMethod === "KAPIDA_POS" ? (
                  <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--surface-3)]/60 p-4 text-[12px] text-[var(--panel-ink)]">
                    <p className="font-semibold">
                      {paymentMethod === "KAPIDA_POS" ? "Kapıda POS" : "Kapıda nakit"}
                    </p>
                    <p className="mt-1 text-[var(--panel-ink-muted)]">
                      {paymentMethod === "KAPIDA_POS"
                        ? "Teslimatta pos cihazından çekim yapılır; kurye fiş görselini yükler. Hem siz hem panelde görünür."
                        : "Teslimatta nakit tahsil edilir; ön ödeme gerekmez."}
                    </p>
                  </div>
                ) : null}

                {paymentMethod === "ONLINE" ? (
                  <button
                    type="button"
                    onClick={() => setCardModalOpen(true)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--panel-border)] bg-[var(--surface-3)]/50 px-4 py-3.5 text-left transition-colors hover:bg-[var(--surface-3)]"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--panel-ink)]">
                        Kart bilgileri
                      </p>
                      <p className="mt-0.5 text-[12px] text-[var(--panel-ink-muted)]">
                        {cardOk && cardLast4
                          ? `•••• ${cardLast4} kaydedildi. Düzenlemek için dokunun.`
                          : "Kart numarasını güvenli formda girin."}
                      </p>
                    </div>
                    <span className="shrink-0 text-[12px] font-semibold text-[var(--primary-text)]">
                      {cardOk ? "Düzenle" : "Aç"}
                    </span>
                  </button>
                ) : null}

                {paymentMethod === "HAVALE" && payment.bankTransferEnabled ? (
                  <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--surface-3)]/60 p-4 text-[12px] text-[var(--panel-ink)]">
                    <p className="flex items-center gap-1.5 font-semibold">
                      <Building2 className="size-3.5" aria-hidden />
                      {payment.bankName || "Banka"}
                    </p>
                    <p className="mt-1 text-[var(--panel-ink-muted)]">{payment.accountHolder}</p>
                    <p className="mt-1 font-mono text-[13px] tracking-wide break-all">
                      {payment.iban}
                    </p>
                    {payment.note ? (
                      <p className="mt-2 text-[var(--panel-ink-muted)]">{payment.note}</p>
                    ) : null}
                  </div>
                ) : null}

                {paymentMethod === "CARI" && cari.eligible && cari.availableKurus != null ? (
                  <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--surface-3)]/60 p-4 text-[12px] text-[var(--panel-ink)]">
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
                  <span className="text-xs font-medium text-[var(--panel-ink-muted)]">
                    Sipariş notu
                  </span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="Teslimat / özel istek"
                    className="mt-1 w-full resize-none rounded-lg border border-[var(--panel-border)] bg-[var(--panel-surface)] px-3 py-2 text-sm outline-none focus-visible:border-[var(--primary-solid)]"
                  />
                </label>

                {error ? <p className="text-xs text-[var(--danger-text)]">{error}</p> : null}
              </div>
            )}
          </div>

          {lines.length > 0 ? (
            <SheetFooter className="gap-3 border-t border-[var(--panel-border)] bg-[var(--panel-surface)] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-[12px] font-medium text-[var(--panel-ink-muted)]">
                    Ara toplam
                  </p>
                </div>
                <span className="tabular-nums text-[1.5rem] font-bold tracking-[-0.02em] text-[var(--panel-ink)]">
                  {formatMoney(money(totalKurus))}
                </span>
              </div>

              {step === "cart" ? (
                <button
                  type="button"
                  onClick={handleStartCheckout}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--panel-ink)] text-[15px] font-semibold text-[var(--panel-canvas)] transition-colors hover:opacity-90"
                >
                  Ödemeye Geç
                </button>
              ) : celebrate ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full text-base"
                  onClick={() => {
                    close();
                    resetCheckout();
                  }}
                >
                  Kapat
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 flex-1 rounded-full"
                    onClick={() => setStep("cart")}
                    disabled={pending}
                  >
                    Geri
                  </Button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={handleConfirmPay}
                    className="inline-flex h-12 flex-[1.5] items-center justify-center rounded-full bg-[var(--panel-ink)] text-[15px] font-semibold text-[var(--panel-canvas)] transition-colors hover:opacity-90 disabled:opacity-50"
                  >
                    {pending ? "Gönderiliyor…" : "Siparişi Gönder"}
                  </button>
                </div>
              )}
            </SheetFooter>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog open={cardModalOpen} onOpenChange={setCardModalOpen}>
        <DialogContent
          overlayClassName="z-[80]"
          className="z-[80] max-h-[min(92dvh,880px)] w-full max-w-[calc(100%-1.25rem)] overflow-y-auto p-0 sm:max-w-3xl"
        >
          <DialogHeader className="border-b border-[var(--panel-border)] px-5 py-4 pr-12">
            <DialogTitle className="text-[1.125rem] font-semibold tracking-[-0.02em] text-[var(--panel-ink)]">
              Kart ile ödeme
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[var(--panel-ink-muted)]">
              {formatMoney(money(totalKurus))} · CVV ve tam numara saklanmaz
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5">
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

function PayOption({
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
        "flex w-full items-start gap-2.5 rounded-2xl border px-3.5 py-3.5 text-left transition-colors",
        active
          ? "border-[var(--primary-solid)] bg-[var(--primary-subtle)]"
          : "border-[var(--panel-border)] bg-[var(--panel-surface)] hover:bg-[var(--surface-3)]",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-[var(--primary-text)]" aria-hidden />
      <span>
        <span className="block text-[13px] font-semibold text-[var(--panel-ink)]">{title}</span>
        <span className="block text-[12px] text-[var(--panel-ink-muted)]">{description}</span>
      </span>
    </button>
  );
}
