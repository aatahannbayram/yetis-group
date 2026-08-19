"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import {
  addCartLine,
  getOrCreateCart,
  removeCartLine,
  setCartLineQuantity,
} from "@/infra/db/cart";
import { getUserDealerId } from "@/infra/db/users";
import { money } from "@/domain/money";

export type CartViewLine = {
  id: string;
  variantId: string;
  productId: string;
  name: string;
  unitLabel: string;
  imageUrl: string | null;
  quantity: number;
  unitPriceKurus: number;
  lineTotalKurus: number;
  lotId: string | null;
};

export type CartView = {
  id: string;
  lines: CartViewLine[];
  itemCount: number;
  totalKurus: number;
};

async function sessionContext() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id ?? null;
  const dealerId = userId ? await getUserDealerId(userId) : null;
  return { userId, dealerId };
}

function toView(cart: NonNullable<Awaited<ReturnType<typeof getOrCreateCart>>>): CartView {
  const lines: CartViewLine[] = cart.lines.map((line) => ({
    id: line.id,
    variantId: line.variantId,
    productId: line.variant.productId,
    name: line.variant.product.name,
    unitLabel: line.variant.packSize ?? line.variant.packagingType,
    imageUrl: line.variant.product.imageUrl,
    quantity: line.quantity,
    unitPriceKurus: line.unitPriceKurus,
    lineTotalKurus: line.unitPriceKurus * line.quantity,
    lotId: line.lotId,
  }));
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
  const totalKurus = lines.reduce((n, l) => n + l.lineTotalKurus, 0);
  return { id: cart.id, lines, itemCount, totalKurus };
}

export async function fetchCartAction(): Promise<CartView | null> {
  const { userId, dealerId } = await sessionContext();
  if (!dealerId) return null;
  const cart = await getOrCreateCart({ userId, dealerId, createGuest: false });
  return cart ? toView(cart) : null;
}

export async function addToCartAction(variantId: string, quantity = 1) {
  const { userId, dealerId } = await sessionContext();
  if (!dealerId) throw new Error("Bayi girişi gerekli.");
  const cart = await getOrCreateCart({ userId, dealerId, createGuest: true });
  if (!cart) throw new Error("Sepet oluşturulamadı.");
  await addCartLine({
    cartId: cart.id,
    variantId,
    quantity,
    userId,
  });
  revalidatePath("/");
  revalidatePath("/urunler");
  const next = await getOrCreateCart({ userId, dealerId, createGuest: false });
  return next ? toView(next) : null;
}

export async function setCartQuantityAction(lineId: string, quantity: number) {
  const { dealerId } = await sessionContext();
  if (!dealerId) throw new Error("Bayi girişi gerekli.");
  await setCartLineQuantity(lineId, quantity);
  revalidatePath("/");
  return fetchCartAction();
}

export async function removeFromCartAction(lineId: string) {
  const { dealerId } = await sessionContext();
  if (!dealerId) throw new Error("Bayi girişi gerekli.");
  await removeCartLine(lineId);
  revalidatePath("/");
  return fetchCartAction();
}

export async function cartTotalMoney(totalKurus: number) {
  return money(totalKurus);
}
