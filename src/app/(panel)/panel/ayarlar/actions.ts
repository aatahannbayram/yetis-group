"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { updatePaymentSettings } from "@/infra/db/payment-settings";
import { updateSampleLimitSettings } from "@/infra/db/samples";
import { updateReturnSettings } from "@/infra/db/returns";
import { getStaffProfile } from "@/infra/db/users";
import { assertCan } from "@/policies";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

async function requireYonetici() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Yetkisiz");
  const profile = await getStaffProfile(session.user.id);
  if (!profile?.isStaff) throw new Error("Yetkisiz");
  return { userId: session.user.id, staffRole: profile.staffRole };
}

export async function savePaymentSettingsAction(formData: FormData) {
  await requireStaff();
  const depotLatRaw = String(formData.get("depotLat") ?? "").trim();
  const depotLngRaw = String(formData.get("depotLng") ?? "").trim();
  await updatePaymentSettings({
    bankTransferEnabled: formData.get("bankTransferEnabled") === "on",
    bankName: String(formData.get("bankName") ?? "").trim(),
    accountHolder: String(formData.get("accountHolder") ?? "").trim(),
    iban: String(formData.get("iban") ?? "").trim(),
    note: String(formData.get("note") ?? "").trim(),
    depotLabel: String(formData.get("depotLabel") ?? "").trim() || "Yetiş Grup Depo",
    depotLat: depotLatRaw ? Number(depotLatRaw) : null,
    depotLng: depotLngRaw ? Number(depotLngRaw) : null,
  });
  revalidatePath("/panel/ayarlar");
  revalidatePath("/panel/rotalar");
  revalidatePath("/urunler");
  revalidatePath("/");
}

export async function saveSampleLimitSettingsAction(formData: FormData) {
  const ctx = await requireYonetici();
  assertCan("settings:sample_limits", { isStaff: true, staffRole: ctx.staffRole, userId: ctx.userId, dealerId: null });
  await updateSampleLimitSettings({
    maxRequestsPerDealerPerMonth: Number(formData.get("maxRequestsPerDealerPerMonth") ?? 3),
    maxValueKurusPerDealerPerMonth: Math.round(Number(formData.get("maxValueTl") ?? 5000) * 100),
    maxQtyPerProduct: Number(formData.get("maxQtyPerProduct") ?? 5),
    repeatBlockDays: Number(formData.get("repeatBlockDays") ?? 90),
    conversionWindowDays: Number(formData.get("conversionWindowDays") ?? 60),
    staleFollowupDays: Number(formData.get("staleFollowupDays") ?? 60),
  });
  revalidatePath("/panel/ayarlar");
  revalidatePath("/panel/numuneler");
}

export async function saveReturnSettingsAction(formData: FormData) {
  const ctx = await requireYonetici();
  assertCan("settings:return", { isStaff: true, staffRole: ctx.staffRole, userId: ctx.userId, dealerId: null });
  await updateReturnSettings({
    returnWindowDays: Number(formData.get("returnWindowDays") ?? 14),
    returnRatioAlertBps: Math.round(Number(formData.get("returnRatioAlertPercent") ?? 10) * 100),
  });
  revalidatePath("/panel/ayarlar");
  revalidatePath("/panel/iadeler");
}
