"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Copy, CreditCard, Landmark, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
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
  const [paid, setPaid] = useState(false);

  const total = sum(
    lines.map((line) => multiplyByQuantity(money(line.unitPriceKurus), line.quantity)),
  );

  const onCardChange = useCallback((state: CardState, validity: CardValidity) => {
    setCardOk(validity.allValid);
    setCardLast4(state.number.length >= 4 ? state.number.slice(-4) : "");
  }, []);

  function resetCheckout() {
    setStep("cart");
    setPaid(false);
    setCardOk(false);
    setCardLast4("");
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
  }

  function handleConfirmPay() {
    if (payMethod === "kart" && !cardOk) return;
    setPaid(true);
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
          "flex w-full flex-col",
          step === "pay" && payMethod === "kart" ? "sm:max-w-xl" : "sm:max-w-md",
        )}
      >
        <SheetHeader>
          <SheetTitle>{step === "pay" ? "Ödeme" : "Sepetim"}</SheetTitle>
          <SheetDescription>
            {step === "pay"
              ? formatMoney(total)
              : lines.length === 0
                ? "Sepetiniz boş."
                : `${lines.length} kalem`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {step === "cart" ? (
            lines.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-neutral-400">
                <ShoppingBag className="size-8" aria-hidden />
                <p className="text-body-sm leading-body-sm">
                  Ürünler sayfasından sepetinize ekleme yapabilirsiniz.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {lines.map((line) => (
                  <li key={line.id} className="flex gap-3 border-b border-neutral-100 pb-4">
                    <div className="flex-1">
                      <p className="text-body-sm leading-body-sm font-medium text-neutral-900">
                        {line.name}
                      </p>
                      <p className="text-caption text-neutral-500">{line.unitLabel}</p>
                      <p className="mt-1 tabular-nums text-body-sm font-medium text-brand-700">
                        {formatMoney(money(line.unitPriceKurus))}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setQuantity(line.id, line.quantity - 1)}
                          aria-label="Azalt"
                        >
                          <Minus />
                        </Button>
                        <span className="w-6 text-center tabular-nums text-body-sm">
                          {line.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setQuantity(line.id, line.quantity + 1)}
                          aria-label="Artır"
                        >
                          <Plus />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="ml-auto text-neutral-400 hover:text-danger-fg"
                          onClick={() => removeLine(line.id)}
                          aria-label="Kaldır"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : paid ? (
            <div className="space-y-3 py-4">
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
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2">
                {bankTransfer ? (
                  <button
                    type="button"
                    onClick={() => setPayMethod("havale")}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-2xl border px-3 py-3 text-left transition-colors",
                      payMethod === "havale"
                        ? "border-brand-600 bg-brand-50"
                        : "border-neutral-200 bg-white hover:bg-neutral-50",
                    )}
                  >
                    <Landmark className="size-4 text-brand-700" aria-hidden />
                    <span className="text-body-sm font-semibold">Havale / EFT</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setPayMethod("kart")}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-2xl border px-3 py-3 text-left transition-colors",
                    payMethod === "kart"
                      ? "border-brand-600 bg-brand-50"
                      : "border-neutral-200 bg-white hover:bg-neutral-50",
                    !bankTransfer && "col-span-2",
                  )}
                >
                  <CreditCard className="size-4 text-brand-700" aria-hidden />
                  <span className="text-body-sm font-semibold">Kart ile ödeme</span>
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
                <CreditCardForm
                  maskMiddle
                  showSubmit={false}
                  title="Kart bilgileri"
                  brandLabel="Yetiş Kart"
                  onChange={onCardChange}
                />
              ) : null}
            </div>
          )}
        </div>

        {lines.length > 0 ? (
          <SheetFooter className="border-t border-neutral-200">
            <div className="flex items-end justify-between">
              <span className="text-body-sm font-medium text-neutral-500">Ara Toplam</span>
              <span className="tabular-nums text-h2 leading-h2 font-bold text-neutral-900">
                {formatMoney(total)}
              </span>
            </div>

            {step === "cart" ? (
              <Button
                size="lg"
                className="h-11 w-full rounded-2xl text-base"
                onClick={handleStartCheckout}
              >
                {session ? "Ödemeye Geç" : "Giriş Yap ve Devam Et"}
              </Button>
            ) : paid ? (
              <Button
                size="lg"
                variant="outline"
                className="h-11 w-full rounded-2xl text-base"
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
                  className="h-11 flex-1 rounded-2xl"
                  onClick={() => setStep("cart")}
                >
                  Geri
                </Button>
                <Button
                  size="lg"
                  className="h-11 flex-[1.4] rounded-2xl text-base"
                  disabled={payMethod === "kart" && !cardOk}
                  onClick={handleConfirmPay}
                >
                  {payMethod === "kart" ? "Kartı Onayla" : "Havale ile Tamamla"}
                </Button>
              </div>
            )}

            {!session ? (
              <p className="text-center text-caption text-neutral-400">
                Sipariş vermek için{" "}
                <Link href="/auth" className="underline" onClick={close}>
                  bayi girişi
                </Link>{" "}
                yapmalısınız.
              </p>
            ) : null}
          </SheetFooter>
        ) : null}
      </SheetContent>
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
    <div className="rounded-2xl border border-brand-200 bg-brand-50 p-3">
      <div className="flex items-center gap-1.5 text-body-sm font-semibold text-brand-700">
        <Landmark className="size-4" />
        Banka Havalesi / EFT
      </div>
      <dl className="mt-2 space-y-1 text-caption text-neutral-600">
        {bankTransfer.bankName ? (
          <div className="flex justify-between gap-2">
            <dt>Banka</dt>
            <dd className="font-medium text-neutral-900">{bankTransfer.bankName}</dd>
          </div>
        ) : null}
        {bankTransfer.accountHolder ? (
          <div className="flex justify-between gap-2">
            <dt>Hesap Sahibi</dt>
            <dd className="font-medium text-neutral-900">{bankTransfer.accountHolder}</dd>
          </div>
        ) : null}
        {bankTransfer.iban ? (
          <div className="flex items-center justify-between gap-2">
            <dt>IBAN</dt>
            <dd className="flex items-center gap-1 font-mono font-medium text-neutral-900">
              {bankTransfer.iban}
              <button
                type="button"
                onClick={onCopy}
                className="text-neutral-400 hover:text-brand-700"
                aria-label="IBAN kopyala"
              >
                <Copy className="size-3.5" />
              </button>
            </dd>
          </div>
        ) : null}
      </dl>
      {ibanCopied ? <p className="mt-1 text-caption text-brand-700">IBAN kopyalandı.</p> : null}
      {bankTransfer.note ? (
        <p className="mt-2 text-caption text-neutral-500">{bankTransfer.note}</p>
      ) : null}
    </div>
  );
}
