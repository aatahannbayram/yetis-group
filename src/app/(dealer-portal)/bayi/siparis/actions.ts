"use server";

import { revalidatePath } from "next/cache";
import {
  addCartLine,
  getOrCreateCart,
  removeCartLine,
  setCartLineQuantity,
} from "@/infra/db/cart";
import { createOrderFromCart, transitionOrder } from "@/infra/db/orders";
import { prisma } from "@/infra/db/client";
import type { OrderPaymentMethod } from "@/generated/prisma";
import { resolveDealerContext } from "@/features/dealer/actions";
import { packLabel } from "@/lib/format/packaging";
import { getDealerCatalogProductById } from "@/infra/db/dealer-catalog";
import type { DealerCatalogProduct } from "@/infra/db/dealer-catalog";

export type DealerCartLineView = {
  id: string;
  variantId: string;
  name: string;
  sku: string;
  unitLabel: string;
  packagingType: string;
  imageUrl: string | null;
  quantity: number;
  unitPriceKurus: number;
  lineTotalKurus: number;
};

export type DealerCartView = {
  id: string;
  lines: DealerCartLineView[];
  itemCount: number;
  totalKurus: number;
};

function toCartView(
  cart: NonNullable<Awaited<ReturnType<typeof getOrCreateCart>>>,
): DealerCartView {
  const lines = cart.lines.map((line) => ({
    id: line.id,
    variantId: line.variantId,
    name: line.variant.product.name,
    sku: line.variant.sku,
    unitLabel: packLabel(line.variant.packSize, line.variant.packagingType),
    packagingType: line.variant.packagingType,
    imageUrl: line.variant.product.imageUrl,
    quantity: line.quantity,
    unitPriceKurus: line.unitPriceKurus,
    lineTotalKurus: line.unitPriceKurus * line.quantity,
  }));
  return {
    id: cart.id,
    lines,
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
    totalKurus: lines.reduce((n, l) => n + l.lineTotalKurus, 0),
  };
}

async function dealerCart(createGuest: boolean) {
  const ctx = await resolveDealerContext();
  if (!ctx) return null;
  const cart = await getOrCreateCart({
    userId: ctx.impersonating ? null : ctx.userId,
    dealerId: ctx.dealerId,
    createGuest: createGuest || ctx.impersonating,
  });
  return { ctx, cart };
}

export async function fetchDealerCartAction(): Promise<DealerCartView | null> {
  const pair = await dealerCart(false);
  if (!pair?.cart) return null;
  return toCartView(pair.cart);
}

/** Ürün detay çekmecesi: tam katalog kaydı, oturum doğrulamalı. */
export async function fetchDealerProductDetailAction(
  productId: string,
): Promise<DealerCatalogProduct | null> {
  const ctx = await resolveDealerContext();
  if (!ctx) return null;
  return getDealerCatalogProductById(ctx.dealerId, productId);
}

export async function dealerAddToCartAction(
  variantId: string,
  quantity: number,
): Promise<{ ok: true; cart: DealerCartView } | { ok: false; error: string }> {
  const pair = await dealerCart(true);
  if (!pair?.cart) return { ok: false, error: "Sepet oluşturulamadı" };
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { ok: false, error: "Geçerli adet girin" };
  }
  try {
    await addCartLine({
      cartId: pair.cart.id,
      variantId,
      quantity,
      userId: pair.ctx.userId,
    });
    const next = await getOrCreateCart({
      userId: pair.ctx.impersonating ? null : pair.ctx.userId,
      dealerId: pair.ctx.dealerId,
      createGuest: false,
    });
    revalidatePath("/bayi");
    revalidatePath("/bayi/siparis");
    return { ok: true, cart: toCartView(next!) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Sepete eklenemedi" };
  }
}

export async function dealerSetQtyAction(
  lineId: string,
  quantity: number,
): Promise<{ ok: true; cart: DealerCartView | null } | { ok: false; error: string }> {
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { ok: false, error: "Geçerli adet girin" };
  }
  try {
    const pair = await dealerCart(false);
    if (!pair?.cart) return { ok: false, error: "Sepet bulunamadı" };
    await setCartLineQuantity(lineId, quantity, pair.cart.id);
    const cart = await fetchDealerCartAction();
    revalidatePath("/bayi/siparis");
    return { ok: true, cart };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Güncellenemedi" };
  }
}

export async function dealerRemoveLineAction(
  lineId: string,
): Promise<{ ok: true; cart: DealerCartView | null } | { ok: false; error: string }> {
  try {
    const pair = await dealerCart(false);
    if (!pair?.cart) return { ok: false, error: "Sepet bulunamadı" };
    await removeCartLine(lineId, pair.cart.id);
    const cart = await fetchDealerCartAction();
    revalidatePath("/bayi/siparis");
    return { ok: true, cart };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Silinemedi" };
  }
}

export async function dealerSubmitOrderAction(input: {
  paymentMethod: OrderPaymentMethod;
  note?: string;
}): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
  const pair = await dealerCart(false);
  if (!pair?.cart) return { ok: false, error: "Sepet bulunamadı" };
  if (pair.cart.lines.length === 0) return { ok: false, error: "Sepet boş" };

  try {
    // Ensure dealerId is stamped before convert
    if (!pair.cart.dealerId) {
      await getOrCreateCart({
        userId: pair.ctx.impersonating ? null : pair.ctx.userId,
        dealerId: pair.ctx.dealerId,
        createGuest: true,
      });
    }
    const order = await createOrderFromCart({
      cartId: pair.cart.id,
      dealerId: pair.ctx.dealerId,
      paymentMethod: input.paymentMethod,
      note: input.note,
    });
    revalidatePath("/bayi");
    revalidatePath("/bayi/siparis");
    revalidatePath("/bayi/siparislerim");
    revalidatePath("/panel/siparisler");
    return { ok: true, orderId: order.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Sipariş oluşturulamadı" };
  }
}

const DEALER_CANCELABLE_STATUSES = ["DRAFT", "SUBMITTED", "UNDER_REVIEW"];

/**
 * Bayi, ekip henüz onaylamamış (stok kilitlenmemiş) bir siparişi kendi
 * iptal edebilir. Onaylandıktan sonra (CONFIRMED+) destek üzerinden gider.
 */
export async function dealerCancelOrderAction(input: {
  orderId: string;
  reason: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const ctx = await resolveDealerContext();
  if (!ctx) return { ok: false, error: "Oturum bulunamadı" };

  const reason = input.reason.trim();
  if (!reason) return { ok: false, error: "İptal nedeni gerekli" };

  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    select: { dealerId: true, status: true },
  });
  if (!order || order.dealerId !== ctx.dealerId) {
    return { ok: false, error: "Sipariş bulunamadı" };
  }
  if (!DEALER_CANCELABLE_STATUSES.includes(order.status)) {
    return {
      ok: false,
      error: "Bu sipariş onaylandığı için kendiniz iptal edemezsiniz, destek ile iletişime geçin.",
    };
  }

  try {
    await transitionOrder(input.orderId, "CANCELLED", { cancelReason: reason });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "İptal edilemedi" };
  }

  revalidatePath("/bayi/siparislerim");
  revalidatePath("/bayi");
  revalidatePath("/panel/siparisler");
  return { ok: true };
}
