"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
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

export function CartSheet() {
  const { lines, isOpen, close, removeLine, setQuantity } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const total = sum(
    lines.map((line) => multiplyByQuantity(money(line.priceKurus), line.quantity)),
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
            {lines.length === 0 ? "Sepetiniz boş." : `${lines.length} ürün`}
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
                <li key={line.productId} className="flex gap-3 border-b border-neutral-100 pb-4">
                  <div className="flex-1">
                    <p className="text-body-sm leading-body-sm font-medium text-neutral-900">
                      {line.name}
                    </p>
                    <p className="text-caption text-neutral-500">{line.unitLabel}</p>
                    <p className="mt-1 tabular-nums text-body-sm font-medium text-brand-700">
                      {formatMoney(money(line.priceKurus))}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setQuantity(line.productId, line.quantity - 1)}
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
                        onClick={() => setQuantity(line.productId, line.quantity + 1)}
                        aria-label="Artır"
                      >
                        <Plus />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="ml-auto text-neutral-400 hover:text-danger-fg"
                        onClick={() => removeLine(line.productId)}
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
              <p className="rounded-md bg-info-bg px-3 py-2 text-body-sm leading-body-sm text-info-fg">
                Sepetiniz kaydedildi. Gerçek sipariş gönderimi yakında eklenecek —
                şimdilik satış ekibimiz sizinle iletişime geçecek.
              </p>
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
