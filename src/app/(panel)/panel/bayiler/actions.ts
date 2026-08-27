"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import { getStaffProfile } from "@/infra/db/users";
import {
  createDealer,
  updateDealer,
  deleteDealer,
  getDealerById,
  type DealerInput,
} from "@/infra/db/dealers";
import { isValidTrIban, isValidVergiNo, normalizeIban } from "@/lib/validation/tr-ids";
import type { DealerPaymentMethod, MembershipTier } from "@/generated/prisma/client";
import { assertCan } from "@/policies";

async function requireStaffSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Yetkisiz");
  const profile = await getStaffProfile(session.user.id);
  if (!profile?.isStaff) throw new Error("Yetkisiz");
  return { session, profile };
}

function readDealerInput(formData: FormData): DealerInput {
  const num = (key: string) => {
    const raw = String(formData.get(key) ?? "").trim();
    return raw ? Number(raw) : null;
  };
  const str = (key: string) => {
    const raw = String(formData.get(key) ?? "").trim();
    return raw || null;
  };
  const tlToKurus = (key: string) => {
    const raw = String(formData.get(key) ?? "").trim();
    return raw ? Math.round(Number(raw) * 100) : null;
  };

  const vergiNo = str("vergiNo");
  if (vergiNo && !isValidVergiNo(vergiNo)) {
    throw new Error("Vergi no 10 veya 11 hane olmalıdır");
  }

  const ibanRaw = str("iban");
  const iban = ibanRaw ? normalizeIban(ibanRaw) : null;
  if (iban && !isValidTrIban(iban)) {
    throw new Error("Geçersiz IBAN");
  }

  const tierRaw = str("membershipTier");
  const membershipTier =
    tierRaw === "STANDART" || tierRaw === "PREMIUM" || tierRaw === "VIP"
      ? (tierRaw as MembershipTier)
      : null;

  const payRaw = str("paymentMethod");
  const paymentMethod =
    payRaw === "VADELI" || payRaw === "PESIN" || payRaw === "HAVALE" || payRaw === "KARMA"
      ? (payRaw as DealerPaymentMethod)
      : null;

  return {
    unvan: String(formData.get("unvan") ?? "").trim(),
    dealerType: formData.get("dealerType") as DealerInput["dealerType"],
    status: formData.get("status") as DealerInput["status"],
    vergiNo,
    vergiDairesi: str("vergiDairesi"),
    membershipTier,
    email: str("email"),
    phone: str("phone"),
    addressLine: str("addressLine"),
    city: str("city"),
    district: str("district"),
    deliveryAddressLine: str("deliveryAddressLine"),
    paymentMethod,
    iban,
    creditLimitKurus: tlToKurus("creditLimitTl"),
    paymentTermDays: num("paymentTermDays"),
    deliveryZoneCode: str("deliveryZoneCode"),
    priceListId: str("priceListId"),
    salesRepId: str("salesRepId"),
    lat: num("lat"),
    lng: num("lng"),
  };
}

export async function createDealerAction(formData: FormData) {
  const { session, profile } = await requireStaffSession();
  assertCan("dealer:write_all", {
    isStaff: true,
    staffRole: profile.staffRole,
    userId: session.user.id,
    dealerId: null,
  });
  const input = readDealerInput(formData);
  if (!input.unvan) throw new Error("Ünvan gerekli");
  await createDealer(input);
  revalidatePath("/panel/bayiler");
  revalidatePath("/panel/siparisler");
}

/** Quick create from order sheet — returns the new dealer for immediate selection. */
export async function createDealerQuickAction(
  formData: FormData,
): Promise<{ id: string; unvan: string }> {
  const { session, profile } = await requireStaffSession();
  assertCan("dealer:write_all", {
    isStaff: true,
    staffRole: profile.staffRole,
    userId: session.user.id,
    dealerId: null,
  });
  if (!formData.get("status")) formData.set("status", "AKTIF");
  if (!formData.get("dealerType")) formData.set("dealerType", "BAYI");
  const input = readDealerInput(formData);
  if (!input.unvan) throw new Error("Ünvan gerekli");
  const dealer = await createDealer(input);
  revalidatePath("/panel/bayiler");
  revalidatePath("/panel/siparisler");
  return { id: dealer.id, unvan: dealer.unvan };
}

export async function updateDealerAction(formData: FormData) {
  const { session, profile } = await requireStaffSession();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Bayi bulunamadı");

  if (profile.isPlasiyer) {
    const existing = await getDealerById(id);
    if (!existing || existing.salesRepId !== session.user.id) {
      throw new Error("Yetkisiz");
    }
    throw new Error("Plasiyer bayi kaydını düzenleyemez; bayi portalına geçin.");
  }

  assertCan("dealer:write_all", {
    isStaff: true,
    staffRole: profile.staffRole,
    userId: session.user.id,
    dealerId: null,
  });

  const input = readDealerInput(formData);
  if (!input.unvan) throw new Error("Ünvan gerekli");
  await updateDealer(id, input);
  revalidatePath("/panel/bayiler");
  revalidatePath("/panel/siparisler");
}

export async function deleteDealerAction(formData: FormData) {
  const { session, profile } = await requireStaffSession();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Bayi bulunamadı");

  assertCan("dealer:write_all", {
    isStaff: true,
    staffRole: profile.staffRole,
    userId: session.user.id,
    dealerId: null,
  });

  await deleteDealer(id);
  revalidatePath("/panel/bayiler");
  revalidatePath("/panel/siparisler");
}
