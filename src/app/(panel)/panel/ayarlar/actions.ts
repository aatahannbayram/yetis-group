"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { updatePaymentSettings } from "@/infra/db/payment-settings";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
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
