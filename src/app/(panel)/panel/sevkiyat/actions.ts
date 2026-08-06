"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { createShipment, updateShipmentStatus } from "@/infra/db/shipments";
import type { ShipmentStatus } from "@/domain/shipment";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

export async function createShipmentAction(formData: FormData) {
  await requireStaff();
  const dealerId = String(formData.get("dealerId") ?? "");
  const variantId = String(formData.get("variantId") ?? "");
  const quantityKg = Number(formData.get("quantityKg") ?? 0);
  const note = String(formData.get("note") ?? "").trim() || undefined;

  if (!dealerId || !variantId) throw new Error("Bayi ve ürün seçimi gerekli");

  await createShipment({ dealerId, variantId, quantityKg, note });
  revalidatePath("/panel/sevkiyat");
}

export async function updateShipmentStatusAction(formData: FormData) {
  await requireStaff();
  const shipmentId = String(formData.get("shipmentId") ?? "");
  const status = formData.get("status") as ShipmentStatus;
  if (!shipmentId || !status) throw new Error("Eksik bilgi");

  await updateShipmentStatus(shipmentId, status);
  revalidatePath("/panel/sevkiyat");
}
