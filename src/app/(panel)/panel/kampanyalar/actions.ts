"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { createCampaign, updateCampaign, deleteCampaign } from "@/infra/db/campaigns";
import type { CampaignKind } from "@/generated/prisma";

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

function parseKind(value: FormDataEntryValue | null): CampaignKind {
  return String(value ?? "") === "KAMPANYA" ? "KAMPANYA" : "DUYURU";
}

function parseSortOrder(value: FormDataEntryValue | null): number {
  const n = Number(String(value ?? "0").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

export async function createCampaignAction(formData: FormData) {
  await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Kampanya adı gerekli");
  await createCampaign({
    name,
    note: String(formData.get("note") ?? ""),
    kind: parseKind(formData.get("kind")),
    href: String(formData.get("href") ?? "").trim() || null,
    ctaLabel: String(formData.get("ctaLabel") ?? "").trim() || null,
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
    sortOrder: parseSortOrder(formData.get("sortOrder")),
    startDate: parseDate(formData.get("startDate")),
    endDate: parseDate(formData.get("endDate")),
  });
  revalidatePath("/panel/kampanyalar");
  revalidatePath("/");
  revalidatePath("/urunler");
  revalidatePath("/bayi");
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
    kind: parseKind(formData.get("kind")),
    href: String(formData.get("href") ?? "").trim() || null,
    ctaLabel: String(formData.get("ctaLabel") ?? "").trim() || null,
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
    sortOrder: parseSortOrder(formData.get("sortOrder")),
    startDate: parseDate(formData.get("startDate")),
    endDate: parseDate(formData.get("endDate")),
  });
  revalidatePath("/panel/kampanyalar");
  revalidatePath("/");
  revalidatePath("/urunler");
  revalidatePath("/bayi");
}

export async function toggleCampaignActiveAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) throw new Error("id gerekli");
  await updateCampaign(id, { active: !active });
  revalidatePath("/panel/kampanyalar");
  revalidatePath("/");
  revalidatePath("/urunler");
  revalidatePath("/bayi");
}

export async function deleteCampaignAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("id gerekli");
  await deleteCampaign(id);
  revalidatePath("/panel/kampanyalar");
  revalidatePath("/");
  revalidatePath("/urunler");
  revalidatePath("/bayi");
}
