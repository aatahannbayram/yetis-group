"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { assertCan } from "@/policies";
import {
  createDeliveryRoute,
  reorderRouteStops,
  startDeliveryRoute,
  markStopEnRoute,
  completeDeliveryStop,
} from "@/infra/db/routes";
import { saveUploadedImage } from "@/infra/storage/local";
import { setOrderPaymentSlip } from "@/infra/db/orders";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
  return session;
}

export async function createRouteAction(formData: FormData) {
  const session = await requireStaff();
  assertCan("route:plan", { isStaff: true, userId: session.user.id, dealerId: null });

  const dateRaw = String(formData.get("date") ?? "");
  const note = String(formData.get("note") ?? "").trim() || undefined;
  const assignedUserId = String(formData.get("assignedUserId") ?? "").trim() || null;
  const dealerIds = formData.getAll("dealerId").map(String).filter(Boolean);
  if (!dateRaw) throw new Error("Tarih gerekli");

  const route = await createDeliveryRoute({
    date: new Date(`${dateRaw}T12:00:00.000Z`),
    assignedUserId,
    note,
    dealerIds,
  });
  revalidatePath("/panel/rotalar");
  return route?.id;
}

export async function reorderStopsAction(formData: FormData) {
  const session = await requireStaff();
  assertCan("route:plan", { isStaff: true, userId: session.user.id, dealerId: null });
  const routeId = String(formData.get("routeId") ?? "");
  const ordered = String(formData.get("orderedDealerIds") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!routeId) throw new Error("Rota gerekli");
  await reorderRouteStops(routeId, ordered);
  revalidatePath("/panel/rotalar");
  revalidatePath(`/panel/rota/${routeId}`);
}

export async function startRouteAction(formData: FormData) {
  const session = await requireStaff();
  assertCan("route:run", { isStaff: true, userId: session.user.id, dealerId: null });
  const routeId = String(formData.get("routeId") ?? "");
  if (!routeId) throw new Error("Rota gerekli");
  await startDeliveryRoute(routeId);
  revalidatePath("/panel/rotalar");
  revalidatePath(`/panel/rota/${routeId}`);
}

export async function markStopEnRouteAction(formData: FormData) {
  const session = await requireStaff();
  assertCan("route:run", { isStaff: true, userId: session.user.id, dealerId: null });
  const stopId = String(formData.get("stopId") ?? "");
  const routeId = String(formData.get("routeId") ?? "");
  if (!stopId) throw new Error("Durak gerekli");
  await markStopEnRoute(stopId);
  revalidatePath("/panel/rotalar");
  if (routeId) revalidatePath(`/panel/rota/${routeId}`);
}

export async function completeStopAction(formData: FormData) {
  const session = await requireStaff();
  assertCan("route:run", { isStaff: true, userId: session.user.id, dealerId: null });
  const stopId = String(formData.get("stopId") ?? "");
  const routeId = String(formData.get("routeId") ?? "");
  if (!stopId) throw new Error("Durak gerekli");

  const collectIds = formData.getAll("collectOrderId").map(String).filter(Boolean);
  const paymentSlipUrls: Record<string, string> = {};

  for (const orderId of collectIds) {
    const file = formData.get(`slip-${orderId}`);
    if (file instanceof File && file.size > 0) {
      const url = await saveUploadedImage(file, `payment-slips-${orderId}`);
      await setOrderPaymentSlip(orderId, url);
      paymentSlipUrls[orderId] = url;
    }
  }

  await completeDeliveryStop(stopId, {
    collectCodOrderIds: collectIds,
    paymentSlipUrls,
  });
  revalidatePath("/panel/rotalar");
  revalidatePath("/panel/siparisler");
  revalidatePath("/panel/sevkiyat");
  if (routeId) revalidatePath(`/panel/rota/${routeId}`);
}
