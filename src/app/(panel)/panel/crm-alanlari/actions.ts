"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import {
  createLeadFieldDefinition,
  setLeadFieldActive,
} from "@/infra/db/lead-fields";
import { completeLeadTask, createLeadTask } from "@/infra/db/crm";
import type { LeadFieldType } from "@/generated/prisma";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz.");
  }
  return session;
}

export async function createLeadFieldAction(formData: FormData) {
  await requireStaff();
  const label = String(formData.get("label") ?? "").trim();
  const type = String(formData.get("type") ?? "TEXT") as LeadFieldType;
  const optionsRaw = String(formData.get("options") ?? "");
  const options = optionsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!label) return;
  await createLeadFieldDefinition({
    label,
    type,
    options,
    required: formData.get("required") === "on",
    formVisible: formData.get("formVisible") === "on",
  });
  revalidatePath("/panel/crm-alanlari");
  revalidatePath("/iletisim");
}

export async function toggleLeadFieldAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;
  await setLeadFieldActive(id, active);
  revalidatePath("/panel/crm-alanlari");
  revalidatePath("/iletisim");
}

export async function createLeadTaskAction(formData: FormData) {
  await requireStaff();
  const leadId = String(formData.get("leadId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const dueRaw = String(formData.get("dueAt") ?? "");
  if (!leadId || !title) return;
  await createLeadTask({
    leadId,
    title,
    dueAt: dueRaw ? new Date(dueRaw) : null,
  });
  revalidatePath("/panel/bayi-adaylari");
}

export async function completeLeadTaskAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await completeLeadTask(id);
  revalidatePath("/panel/bayi-adaylari");
}
