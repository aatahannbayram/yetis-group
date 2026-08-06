"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { createOrder, transitionOrder } from "@/infra/db/orders";
import { createShipment } from "@/infra/db/shipments";
import { prisma } from "@/infra/db/client";
import type { OrderStatus } from "@/domain/order/state-machine";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

export async function createOrderAction(formData: FormData) {
  await requireStaff();
  const dealerId = String(formData.get("dealerId") ?? "");
  const note = String(formData.get("note") ?? "").trim() || undefined;
  const linesRaw = String(formData.get("lines") ?? "[]");

  let lines: { variantId: string; quantity: number }[];
  try {
    lines = JSON.parse(linesRaw);
  } catch {
    throw new Error("Satır bilgisi okunamadı");
  }

  if (!dealerId) throw new Error("Bayi seçimi gerekli");
  if (!Array.isArray(lines) || lines.length === 0) throw new Error("En az bir ürün satırı gerekli");

  await createOrder({ dealerId, lines, note });
  revalidatePath("/panel/siparisler");
}

export async function transitionOrderAction(formData: FormData) {
  await requireStaff();
  const orderId = String(formData.get("orderId") ?? "");
  const status = formData.get("status") as OrderStatus;
  const note = String(formData.get("note") ?? "").trim() || undefined;
  const cancelReason = String(formData.get("cancelReason") ?? "").trim() || undefined;

  if (!orderId || !status) throw new Error("Eksik bilgi");

  await transitionOrder(orderId, status, { note, cancelReason });
  revalidatePath("/panel/siparisler");
  revalidatePath("/panel/cari");
}

export async function createShipmentFromOrderAction(formData: FormData) {
  await requireStaff();
  const orderId = String(formData.get("orderId") ?? "");
  const orderLineId = String(formData.get("orderLineId") ?? "");
  if (!orderId || !orderLineId) throw new Error("Eksik bilgi");

  const line = await prisma.orderLine.findUniqueOrThrow({
    where: { id: orderLineId },
    include: { order: { select: { dealerId: true } }, variant: { select: { unitFactor: true } } },
  });

  const quantityKg = line.variant.unitFactor.mul(line.quantity).toNumber();

  await createShipment({
    dealerId: line.order.dealerId,
    variantId: line.variantId,
    quantityKg,
    orderId,
    note: `Sipariş #${orderId.slice(-6)}`,
  });
  revalidatePath("/panel/siparisler");
  revalidatePath("/panel/sevkiyat");
}
