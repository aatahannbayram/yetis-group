"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  Copy,
  CreditCard,
  Landmark,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/components/store/cart-context";
import { useSession } from "@/infra/auth/client";
import { money, multiplyByQuantity, sum } from "@/domain/money";
import { formatMoney } from "@/lib/format/money";
import {
  CreditCardForm,
  type CardState,
  type CardValidity,
} from "@/components/ui/credit-card-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type BankTransferInfo = {
  bankName: string;
  accountHolder: string;
  iban: string;
  note: string;
};

type PayMethod = "havale" | "kart";

export function CartSheet({ bankTransfer }: { bankTransfer: BankTransferInfo | null }) {
  const { lines, isOpen, close, removeLine, setQuantity } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<"cart" | "pay">("cart");
  const [payMethod, setPayMethod] = useState<PayMethod>(bankTransfer ? "havale" : "kart");
  const [ibanCopied, setIbanCopied] = useState(false);
  const [cardOk, setCardOk] = useState(false);
  const [cardLast4, setCardLast4] = useState("");
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [draftCardOk, setDraftCardOk] = useState(false);
  const [draftLast4, setDraftLast4] = useState("");
  const [paid, setPaid] = useState(false);

  const total = sum(
    lines.map((line) => multiplyByQuantity(money(line.unitPriceKurus), line.quantity)),
  );
  const unitCount = lines.reduce((n, l) => n + l.quantity, 0);

  const onCardChange = useCallback((state: CardState, validity: CardValidity) => {
    setDraftCardOk(validity.allValid);
    setDraftLast4(state.number.length >= 4 ? state.number.slice(-4) : "");
  }, []);

  function resetCheckout() {
    setStep("cart");
    setPaid(false);
    setCardOk(false);
    setCardLast4("");
    setDraftCardOk(false);
    setDraftLast4("");
    setCardModalOpen(false);
    setPayMethod(bankTransfer ? "havale" : "kart");
  }

  function handleStartCheckout() {
    if (!session) {
      close();
      router.push("/auth");
      return;
    }
    setStep("pay");
    setPaid(false);
    if (!bankTransfer) {
      setPayMethod("kart");
      setCardModalOpen(true);
    }
  }

  function selectPayMethod(method: PayMethod) {
    setPayMethod(method);
    if (method === "kart") {
      setCardModalOpen(true);
    } else {
      setCardModalOpen(false);
    }
  }

  function handleConfirmPay() {
    if (payMethod === "kart" && !cardOk) {
      setCardModalOpen(true);
      return;
    }
    setPaid(true);
    setCardModalOpen(false);
  }

  function handleSaveCard() {
    if (!draftCardOk) return;
    setCardOk(true);
    setCardLast4(draftLast4);
    setCardModalOpen(false);
  }

  return (
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
        className={cn(
          "flex w-full flex-col gap-0 border-l border-[color:var(--mkt-border)] bg-white p-0 sm:max-w-md",
        )}
      >
        <SheetHeader className="border-b border-[color:var(--mkt-border)] px-5 py-4 pr-12">
          <SheetTitle className="text-[1.25rem] font-semibold tracking-[-0.02em] text-mkt-ink">
            {step === "pay" ? "Ödeme" : "Sepetim"}
          </SheetTitle>
          <SheetDescription className="text-[13px] text-mkt-ink-muted">
            {step === "pay"
              ? formatMoney(total)
              : lines.length === 0
                ? "Henüz ürün yok"
                : `${lines.length} kalem · ${unitCount} adet`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === "cart" ? (
            lines.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-[var(--mkt-card-muted)] text-mkt-ink-muted">
                  <ShoppingBag className="size-6" aria-hidden />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-mkt-ink">Sepetiniz boş</p>
                  <p className="mt-1 max-w-[16rem] text-[13px] leading-relaxed text-mkt-ink-muted">
                    Katalogdan ürün ekleyin; fiyat listenizdeki tutarlar burada görünür.
                  </p>
                </div>
                <Link
                  href="/urunler"
                  onClick={close}
                  className="mkt-pill inline-flex h-10 items-center bg-mkt-accent px-5 text-[14px] font-semibold text-mkt-accent-ink"
                >
                  Kataloğa git
                </Link>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {lines.map((line) => (
                  <li
                    key={line.id}
                    className="rounded-2xl border border-[color:var(--mkt-border)] bg-[var(--mkt-card-muted)]/40 p-3"
                  >
                    <div className="flex gap-3">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-white">
                        {line.imageUrl ? (
                          <Image
                            src={line.imageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-mkt-ink-muted">
                            <Package className="size-5" aria-hidden />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-mkt-ink">
                              {line.name}
                            </p>
                            <p className="mt-0.5 text-[12px] text-mkt-ink-muted">
                              {line.unitLabel}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(line.id)}
                            className="flex size-8 shrink-0 items-center justify-center rounded-full text-mkt-ink-muted transition-colors hover:bg-white hover:text-[color:var(--danger-fg)]"
                            aria-label="Kaldır"
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="inline-flex items-center gap-0.5 rounded-full border border-[color:var(--mkt-border)] bg-white p-0.5">
                            <button
                              type="button"
                              onClick={() => setQuantity(line.id, line.quantity - 1)}
                              className="flex size-8 items-center justify-center rounded-full text-mkt-ink transition-colors hover:bg-[var(--mkt-card-muted)]"
                              aria-label="Azalt"
                            >
                              <Minus className="size-3.5" aria-hidden />
                            </button>
                            <span className="w-8 text-center text-[14px] font-semibold tabular-nums text-mkt-ink">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuantity(line.id, line.quantity + 1)}
                              className="flex size-8 items-center justify-center rounded-full text-mkt-ink transition-colors hover:bg-[var(--mkt-card-muted)]"
                              aria-label="Artır"
                            >
                              <Plus className="size-3.5" aria-hidden />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-[15px] font-semibold tabular-nums text-mkt-ink">
                              {formatMoney(money(line.lineTotalKurus))}
                            </p>
                            {line.quantity > 1 ? (
                              <p className="text-[11px] tabular-nums text-mkt-ink-muted">
                                {formatMoney(money(line.unitPriceKurus))} / adet
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : paid ? (
            <div className="space-y-3 py-2">
              <p className="rounded-2xl bg-info-bg px-4 py-3 text-body-sm text-info-fg">
                Ödeme tercihiniz alındı. Gerçek tahsilat / sipariş FSM yakında bağlanacak.
              </p>
              {payMethod === "kart" && cardLast4 ? (
                <p className="text-body-sm text-neutral-600">
                  Kart referansı: •••• {cardLast4} (tam numara ve CVV saklanmaz)
                </p>
              ) : null}
              {payMethod === "havale" && bankTransfer ? (
                <BankBlock
                  bankTransfer={bankTransfer}
                  ibanCopied={ibanCopied}
                  onCopy={() => {
                    void navigator.clipboard.writeText(bankTransfer.iban);
                    setIbanCopied(true);
                    setTimeout(() => setIbanCopied(false), 1500);
                  }}
                />
              ) : null}
            </div>
          ) : (
            <div className="space-y-4 py-1">
              <div className={cn("grid gap-2", bankTransfer ? "grid-cols-2" : "grid-cols-1")}>
                {bankTransfer ? (
                  <button
                    type="button"
                    onClick={() => selectPayMethod("havale")}
                    className={cn(
                      "flex flex-col items-start gap-1.5 rounded-2xl border px-3.5 py-3.5 text-left transition-colors",
                      payMethod === "havale"
                        ? "border-brand-600 bg-brand-50"
                        : "border-[color:var(--mkt-border)] bg-white hover:bg-[var(--mkt-card-muted)]",
                    )}
                  >
                    <Landmark className="size-4 text-brand-700" aria-hidden />
                    <span className="text-[13px] font-semibold text-mkt-ink">Havale / EFT</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => selectPayMethod("kart")}
                  className={cn(
                    "flex flex-col items-start gap-1.5 rounded-2xl border px-3.5 py-3.5 text-left transition-colors",
                    payMethod === "kart"
                      ? "border-brand-600 bg-brand-50"
                      : "border-[color:var(--mkt-border)] bg-white hover:bg-[var(--mkt-card-muted)]",
                  )}
                >
                  <CreditCard className="size-4 text-brand-700" aria-hidden />
                  <span className="text-[13px] font-semibold text-mkt-ink">Kart ile ödeme</span>
                </button>
              </div>

              {payMethod === "havale" && bankTransfer ? (
                <BankBlock
                  bankTransfer={bankTransfer}
                  ibanCopied={ibanCopied}
                  onCopy={() => {
                    void navigator.clipboard.writeText(bankTransfer.iban);
                    setIbanCopied(true);
                    setTimeout(() => setIbanCopied(false), 1500);
                  }}
                />
              ) : null}

              {payMethod === "kart" ? (
                <button
                  type="button"
                  onClick={() => setCardModalOpen(true)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[color:var(--mkt-border)] bg-[var(--mkt-card-muted)]/50 px-4 py-3.5 text-left transition-colors hover:bg-[var(--mkt-card-muted)]"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-mkt-ink">Kart bilgileri</p>
                    <p className="mt-0.5 text-[12px] text-mkt-ink-muted">
                      {cardOk && cardLast4
                        ? `•••• ${cardLast4} kaydedildi. Düzenlemek için dokunun.`
                        : "Kart numarasını güvenli formda girin."}
                    </p>
                  </div>
                  <span className="shrink-0 text-[12px] font-semibold text-mkt-green-text">
                    {cardOk ? "Düzenle" : "Aç"}
                  </span>
                </button>
              ) : null}
            </div>
          )}
        </div>

        {lines.length > 0 ? (
          <SheetFooter className="gap-3 border-t border-[color:var(--mkt-border)] bg-[var(--mkt-card-muted)]/50 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-[12px] font-medium text-mkt-ink-muted">Ara toplam</p>
                <p className="text-[11px] text-mkt-ink-muted">KDV siparişte netleşir</p>
              </div>
              <span className="tabular-nums text-[1.5rem] font-bold tracking-[-0.02em] text-mkt-ink">
                {formatMoney(total)}
              </span>
            </div>

            {step === "cart" ? (
              <button
                type="button"
                onClick={handleStartCheckout}
                className="mkt-pill inline-flex h-12 w-full items-center justify-center bg-brand-700 text-[15px] font-semibold text-white transition-colors hover:bg-brand-800"
              >
                {session ? "Ödemeye Geç" : "Giriş Yap ve Devam Et"}
              </button>
            ) : paid ? (
              <Button
                size="lg"
                variant="outline"
                className="mkt-pill h-12 w-full text-base"
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
                  className="mkt-pill h-12 flex-1"
                  onClick={() => setStep("cart")}
                >
                  Geri
                </Button>
                <button
                  type="button"
                  disabled={payMethod === "kart" && !cardOk}
                  onClick={handleConfirmPay}
                  className="mkt-pill inline-flex h-12 flex-[1.5] items-center justify-center bg-brand-700 text-[15px] font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
                >
                  {payMethod === "kart" ? "Kartı Onayla" : "Havale ile Tamamla"}
                </button>
              </div>
            )}

            {!session ? (
              <p className="text-center text-[12px] text-mkt-ink-muted">
                Sipariş için{" "}
                <Link href="/auth" className="font-medium text-mkt-green-text underline" onClick={close}>
                  bayi girişi
                </Link>{" "}
                gerekir.
              </p>
            ) : null}
          </SheetFooter>
        ) : null}
      </SheetContent>

      <Dialog open={cardModalOpen} onOpenChange={setCardModalOpen}>
        <DialogContent
          overlayClassName="z-[80]"
          className="z-[80] max-h-[min(92dvh,820px)] w-full max-w-[calc(100%-1.25rem)] overflow-y-auto p-0 sm:max-w-lg"
        >
          <DialogHeader className="border-b border-[color:var(--mkt-border)] px-5 py-4 pr-12">
            <DialogTitle className="text-[1.125rem] font-semibold tracking-[-0.02em] text-mkt-ink">
              Kart ile ödeme
            </DialogTitle>
            <DialogDescription className="text-[13px] text-mkt-ink-muted">
              {formatMoney(total)} · CVV ve tam numara saklanmaz
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

          <DialogFooter className="mx-0 mb-0 gap-2 rounded-b-xl border-t border-[color:var(--mkt-border)] bg-[var(--mkt-card-muted)]/50 p-4 sm:justify-stretch">
            <Button
              type="button"
              variant="outline"
              className="mkt-pill h-11 flex-1"
              onClick={() => setCardModalOpen(false)}
            >
              Vazgeç
            </Button>
            <button
              type="button"
              disabled={!draftCardOk}
              onClick={handleSaveCard}
              className="mkt-pill inline-flex h-11 flex-[1.4] items-center justify-center bg-brand-700 text-[14px] font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
            >
              Kartı Kaydet
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}

function BankBlock({
  bankTransfer,
  ibanCopied,
  onCopy,
}: {
  bankTransfer: BankTransferInfo;
  ibanCopied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-brand-700">
        <Landmark className="size-4" aria-hidden />
        Banka Havalesi / EFT
      </div>
      <dl className="mt-3 space-y-2 text-[12px] text-mkt-ink-muted">
        {bankTransfer.bankName ? (
          <div className="flex justify-between gap-2">
            <dt>Banka</dt>
            <dd className="font-medium text-mkt-ink">{bankTransfer.bankName}</dd>
          </div>
        ) : null}
        {bankTransfer.accountHolder ? (
          <div className="flex justify-between gap-2">
            <dt>Hesap Sahibi</dt>
            <dd className="font-medium text-mkt-ink">{bankTransfer.accountHolder}</dd>
          </div>
        ) : null}
        {bankTransfer.iban ? (
          <div className="flex items-center justify-between gap-2">
            <dt>IBAN</dt>
            <dd className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-mkt-ink">
              {bankTransfer.iban}
              <button
                type="button"
                onClick={onCopy}
                className="text-mkt-ink-muted hover:text-brand-700"
                aria-label="IBAN kopyala"
              >
                <Copy className="size-3.5" aria-hidden />
              </button>
            </dd>
          </div>
        ) : null}
      </dl>
      {ibanCopied ? <p className="mt-2 text-[12px] text-brand-700">IBAN kopyalandı.</p> : null}
      {bankTransfer.note ? (
        <p className="mt-2 text-[12px] text-mkt-ink-muted">{bankTransfer.note}</p>
      ) : null}
    </div>
  );
}
