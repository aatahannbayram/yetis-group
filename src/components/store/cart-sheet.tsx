"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy, Landmark, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
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

type BankTransferInfo = {
  bankName: string;
  accountHolder: string;
  iban: string;
  note: string;
};

export function CartSheet({ bankTransfer }: { bankTransfer: BankTransferInfo | null }) {
  const { lines, isOpen, close, removeLine, setQuantity } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [ibanCopied, setIbanCopied] = useState(false);

  const total = sum(
    lines.map((line) => multiplyByQuantity(money(line.unitPriceKurus), line.quantity)),
  );

  function handleCheckout() {
    if (!session) {
      close();
      router.push("/auth");
      return;
    }
    setSubmitted(true);
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : close())}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Sepetim</SheetTitle>
          <SheetDescription>
            {lines.length === 0 ? "Sepetiniz boş." : `${lines.length} kalem`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {lines.length === 0 ? (
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

            {submitted ? (
              <div className="space-y-2">
                <p className="rounded-md bg-info-bg px-3 py-2 text-body-sm leading-body-sm text-info-fg">
                  Sepetiniz sunucuda kayıtlı. Gerçek sipariş gönderimi yakında eklenecek.
                </p>
                {bankTransfer ? (
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
                          <dd className="font-medium text-neutral-900">
                            {bankTransfer.accountHolder}
                          </dd>
                        </div>
                      ) : null}
                      {bankTransfer.iban ? (
                        <div className="flex items-center justify-between gap-2">
                          <dt>IBAN</dt>
                          <dd className="flex items-center gap-1 font-mono font-medium text-neutral-900">
                            {bankTransfer.iban}
                            <button
                              type="button"
                              onClick={() => {
                                void navigator.clipboard.writeText(bankTransfer.iban);
                                setIbanCopied(true);
                                setTimeout(() => setIbanCopied(false), 1500);
                              }}
                              className="text-neutral-400 hover:text-brand-700"
                              aria-label="IBAN kopyala"
                            >
                              <Copy className="size-3.5" />
                            </button>
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                    {ibanCopied ? (
                      <p className="mt-1 text-caption text-brand-700">IBAN kopyalandı.</p>
                    ) : null}
                    {bankTransfer.note ? (
                      <p className="mt-2 text-caption text-neutral-500">{bankTransfer.note}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <Button
                size="lg"
                className="h-11 w-full rounded-2xl text-base"
                onClick={handleCheckout}
              >
                {session ? "Sipariş Ver" : "Giriş Yap ve Devam Et"}
              </Button>
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
