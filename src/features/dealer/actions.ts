"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { auth } from "@/infra/auth/server";
import { getUserDealerId, isStaffUser } from "@/infra/db/users";
import { addCartLine, getOrCreateCart } from "@/infra/db/cart";
import { prisma } from "@/infra/db/client";
import { IMPERSONATE_COOKIE, parseImpersonationCookie } from "@/lib/impersonation";

export async function resolveDealerContext(): Promise<{
  userId: string;
  dealerId: string;
  impersonating: boolean;
} | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const jar = await cookies();
  const imp = parseImpersonationCookie(jar.get(IMPERSONATE_COOKIE)?.value);
  if (imp && (await isStaffUser(session.user.id))) {
    return { userId: session.user.id, dealerId: imp, impersonating: true };
  }

  const dealerId = await getUserDealerId(session.user.id);
  if (!dealerId) return null;
  return { userId: session.user.id, dealerId, impersonating: false };
}

/** Repeat last non-empty cart lines into the current cart. */
export async function repeatLastCartAction(): Promise<{ ok: true; lines: number } | { ok: false; error: string }> {
  const ctx = await resolveDealerContext();
  if (!ctx) return { ok: false, error: "Oturum veya bayi bulunamadı" };

  const previous = await prisma.cart.findFirst({
    where: {
      dealerId: ctx.dealerId,
      lines: { some: {} },
    },
    orderBy: { updatedAt: "desc" },
    include: { lines: true },
  });

  if (!previous || previous.lines.length === 0) {
    return { ok: false, error: "Tekrarlanacak önceki sepet bulunamadı" };
  }

  const cart = await getOrCreateCart({
    userId: ctx.impersonating ? null : ctx.userId,
    dealerId: ctx.dealerId,
    createGuest: ctx.impersonating,
  });
  if (!cart) return { ok: false, error: "Sepet oluşturulamadı" };

  // If source is the same cart, nothing to copy
  if (previous.id === cart.id && previous.lines.length > 0) {
    revalidatePath("/bayi");
    return { ok: true, lines: previous.lines.length };
  }

  await prisma.cartLine.deleteMany({ where: { cartId: cart.id } });

  for (const line of previous.lines) {
    await addCartLine({
      cartId: cart.id,
      variantId: line.variantId,
      quantity: line.quantity,
      userId: ctx.userId,
      lotId: line.lotId,
    });
  }

  revalidatePath("/bayi");
  revalidatePath("/bayi/siparis");
  return { ok: true, lines: previous.lines.length };
}
