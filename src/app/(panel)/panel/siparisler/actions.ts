"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { confirmOrderPayment, confirmCodCollection, setOrderPaymentSlip, createOrder, transitionOrder } from "@/infra/db/orders";
import { createShipment } from "@/infra/db/shipments";
import { prisma } from "@/infra/db/client";
import type { OrderPaymentMethod } from "@/generated/prisma";
import type { OrderStatus } from "@/domain/order/state-machine";
import { trySendProforma, voidAndReissueProforma } from "@/infra/db/proforma";
import { saveUploadedImage } from "@/infra/storage/local";
import { assertCan } from "@/policies";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
  return session;
}

export async function createOrderAction(formData: FormData) {
  await requireStaff();
  const dealerId = String(formData.get("dealerId") ?? "");
  const note = String(formData.get("note") ?? "").trim() || undefined;
  const linesRaw = String(formData.get("lines") ?? "[]");
  const paymentMethodRaw = String(formData.get("paymentMethod") ?? "");
  const paymentMethod = (
    ["HAVALE", "CARI", "ONLINE", "KAPIDA_NAKIT", "KAPIDA_POS"] as const
  ).includes(paymentMethodRaw as OrderPaymentMethod)
    ? (paymentMethodRaw as OrderPaymentMethod)
    : undefined;

  let lines: { variantId: string; quantity: number }[];
  try {
    lines = JSON.parse(linesRaw);
  } catch {
    throw new Error("Satır bilgisi okunamadı");
  }

  if (!dealerId) throw new Error("Bayi seçimi gerekli");
  if (!Array.isArray(lines) || lines.length === 0) throw new Error("En az bir ürün satırı gerekli");

  await createOrder({ dealerId, lines, note, paymentMethod });
  revalidatePath("/panel/siparisler");
  revalidatePath("/panel/cari");
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

export async function confirmOrderPaymentAction(formData: FormData) {
  await requireStaff();
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Sipariş gerekli");

  await confirmOrderPayment(orderId);
  revalidatePath("/panel/siparisler");
  revalidatePath("/panel/cari");
  revalidatePath("/bayi/cari");
  revalidatePath("/bayi/siparislerim");
}

export async function confirmCodCollectionAction(formData: FormData) {
  const session = await requireStaff();
  assertCan("order:cod_collect", {
    isStaff: true,
    userId: session.user.id,
    dealerId: null,
  });
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Sipariş gerekli");
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { paymentSlipUrl: true },
  });
  await confirmCodCollection(orderId, { paymentSlipUrl: order.paymentSlipUrl });
  revalidatePath("/panel/siparisler");
  revalidatePath("/panel/cari");
  revalidatePath("/bayi/cari");
  revalidatePath("/bayi/siparislerim");
  revalidatePath("/panel/rotalar");
}

export async function uploadOrderPaymentSlipAction(formData: FormData) {
  await requireStaff();
  const orderId = String(formData.get("orderId") ?? "");
  const file = formData.get("file");
  if (!orderId) throw new Error("Sipariş gerekli");
  if (!(file instanceof File) || file.size === 0) throw new Error("Fiş görseli gerekli");
  const url = await saveUploadedImage(file, `payment-slips-${orderId}`);
  await setOrderPaymentSlip(orderId, url);
  revalidatePath("/panel/siparisler");
  revalidatePath("/bayi/siparislerim");
  revalidatePath("/panel/rotalar");
  return url;
}

export async function createShipmentFromOrderAction(formData: FormData) {
  await requireStaff();
  const orderId = String(formData.get("orderId") ?? "");
  const orderLineId = String(formData.get("orderLineId") ?? "");
  if (!orderId || !orderLineId) throw new Error("Eksik bilgi");

  const line = await prisma.orderLine.findUniqueOrThrow({
    where: { id: orderLineId },
    include: {
      order: { select: { dealerId: true, status: true } },
      variant: { select: { unitFactor: true } },
    },
  });
  if (line.orderId !== orderId) throw new Error("Kalem bu siparişe ait değil");
  if (line.order.status !== "CONFIRMED" && line.order.status !== "PREPARING") {
    throw new Error("Sevkiyat yalnızca onaylı siparişlerden oluşturulur.");
  }

  const quantityKg = line.variant.unitFactor.mul(line.quantity).toNumber();

  await createShipment({
    dealerId: line.order.dealerId,
    variantId: line.variantId,
    quantityKg,
    orderId,
    orderLineId,
    note: `Sipariş #${orderId.slice(-6)}`,
  });
  revalidatePath("/panel/siparisler");
  revalidatePath("/panel/sevkiyat");
}

export async function reissueProformaAction(orderId: string) {
  await requireStaff();
  if (!orderId) throw new Error("Sipariş gerekli");
  await voidAndReissueProforma(orderId);
  revalidatePath("/panel/siparisler");
}

export async function sendProformaEmailAction(proformaId: string) {
  await requireStaff();
  if (!proformaId) throw new Error("Proforma gerekli");
  const result = await trySendProforma(proformaId);
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/panel/siparisler");
}
