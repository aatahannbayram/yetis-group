"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { createCampaign, updateCampaign, deleteCampaign } from "@/infra/db/campaigns";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

function parseDate(value: FormDataEntryValue | null): Date | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createCampaignAction(formData: FormData) {
  await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Kampanya adı gerekli");
  await createCampaign({
    name,
    note: String(formData.get("note") ?? ""),
    startDate: parseDate(formData.get("startDate")),
    endDate: parseDate(formData.get("endDate")),
  });
  revalidatePath("/panel/kampanyalar");
}

export async function updateCampaignAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("id gerekli");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Kampanya adı gerekli");
  await updateCampaign(id, {
    name,
    note: String(formData.get("note") ?? ""),
    startDate: parseDate(formData.get("startDate")),
    endDate: parseDate(formData.get("endDate")),
  });
  revalidatePath("/panel/kampanyalar");
}

export async function toggleCampaignActiveAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) throw new Error("id gerekli");
  await updateCampaign(id, { active: !active });
  revalidatePath("/panel/kampanyalar");
}

export async function deleteCampaignAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("id gerekli");
  await deleteCampaign(id);
  revalidatePath("/panel/kampanyalar");
}
