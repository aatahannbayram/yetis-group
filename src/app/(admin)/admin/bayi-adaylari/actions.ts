"use server";

import { revalidatePath } from "next/cache";
import { addLeadActivity } from "@/infra/db/leads";
import type { LEAD_ACTIVITY_TYPES } from "@/domain/leads";

export async function addLeadActivityAction(
  leadId: string,
  type: (typeof LEAD_ACTIVITY_TYPES)[number],
  note: string,
) {
  if (!note.trim()) return;
  await addLeadActivity(leadId, type, note.trim());
  revalidatePath("/admin/bayi-adaylari");
}
