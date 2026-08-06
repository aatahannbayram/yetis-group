import { cookies } from "next/headers";
import { prisma } from "@/infra/db/client";
import { getVariantUnitPrice } from "@/infra/db/pricing";

const GUEST_COOKIE = "yetis_cart_guest";

export async function getOrCreateCart(opts: {
  userId?: string | null;
  dealerId?: string | null;
  createGuest?: boolean;
}) {
  if (opts.userId) {
    const existing = await prisma.cart.findFirst({
      where: { userId: opts.userId },
      include: cartInclude,
    });
    if (existing) {
      if (opts.dealerId && existing.dealerId !== opts.dealerId) {
        return prisma.cart.update({
          where: { id: existing.id },
          data: { dealerId: opts.dealerId },
          include: cartInclude,
        });
      }
      return existing;
    }
    return prisma.cart.create({
      data: { userId: opts.userId, dealerId: opts.dealerId ?? null },
      include: cartInclude,
    });
  }

  const jar = await cookies();
  let guestKey = jar.get(GUEST_COOKIE)?.value;
  if (!guestKey && opts.createGuest !== false) {
    guestKey = crypto.randomUUID();
    jar.set(GUEST_COOKIE, guestKey, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  if (!guestKey) return null;

  const existing = await prisma.cart.findUnique({
    where: { guestKey },
    include: cartInclude,
  });
  if (existing) return existing;

  return prisma.cart.create({
    data: { guestKey },
    include: cartInclude,
  });
}

const cartInclude = {
  lines: {
    include: {
      variant: { include: { product: true } },
      lot: true,
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export async function addCartLine(input: {
  cartId: string;
  variantId: string;
  quantity: number;
  userId?: string | null;
  lotId?: string | null;
}) {
  const { unitPriceKurus, variant } = await getVariantUnitPrice(input.variantId, input.userId ?? undefined);
  const lotId = input.lotId ?? null;

  const existing = await prisma.cartLine.findFirst({
    where: {
      cartId: input.cartId,
      variantId: input.variantId,
      lotId,
    },
  });

  if (existing) {
    return prisma.cartLine.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + input.quantity,
        unitPriceKurus,
        vatRateBasisPoints: variant.vatRateBasisPoints,
      },
    });
  }

  return prisma.cartLine.create({
    data: {
      cartId: input.cartId,
      variantId: input.variantId,
      lotId,
      quantity: input.quantity,
      unitPriceKurus,
      vatRateBasisPoints: variant.vatRateBasisPoints,
      discountBreakdown: [],
    },
  });
}

export async function setCartLineQuantity(lineId: string, quantity: number) {
  if (quantity <= 0) {
    return prisma.cartLine.delete({ where: { id: lineId } });
  }
  return prisma.cartLine.update({ where: { id: lineId }, data: { quantity } });
}

export async function removeCartLine(lineId: string) {
  return prisma.cartLine.delete({ where: { id: lineId } });
}
