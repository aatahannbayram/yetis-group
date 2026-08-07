"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { addLeadActivity, promoteLeadToDealer, transitionLeadStage } from "@/infra/db/leads";
import { LEAD_ACTIVITY_TYPES, type LeadStage } from "@/domain/leads";
import { assertCan } from "@/policies";

export async function addLeadActivityAction(
  leadId: string,
  type: (typeof LEAD_ACTIVITY_TYPES)[number],
  note: string,
) {
  if (!note.trim()) return;
  await addLeadActivity(leadId, type, note.trim());
  revalidatePath("/panel/bayi-adaylari");
}

const transitionSchema = z.object({
  leadId: z.string().min(1),
  toStage: z.enum([
    "YENI",
    "ILETISIMDE",
    "NITELIKLI",
    "NUMUNE",
    "NUMUNE_TEKLIF",
    "TEKLIF",
    "MUZAKERE",
    "KAZANILDI",
    "KAYBEDILDI",
  ]),
  lostReason: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
});

export async function transitionLeadStageAction(raw: z.infer<typeof transitionSchema>) {
  const input = transitionSchema.parse(raw);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz.");
  }
  assertCan("lead:transition", {
    isStaff: true,
    userId: session.user.id,
    dealerId: null,
  });

  await transitionLeadStage({
    leadId: input.leadId,
    toStage: input.toStage as LeadStage,
    lostReason: input.lostReason,
    reason: input.reason,
    actorId: session.user.id,
  });
  revalidatePath("/panel/bayi-adaylari");
  revalidatePath("/panel/bayiler");
}

const bulkTransitionSchema = z.object({
  leadIds: z.array(z.string().min(1)).min(1),
  toStage: transitionSchema.shape.toStage,
  lostReason: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
});

export async function bulkTransitionLeadStageAction(raw: z.infer<typeof bulkTransitionSchema>) {
  const input = bulkTransitionSchema.parse(raw);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz.");
  }
  assertCan("lead:transition", {
    isStaff: true,
    userId: session.user.id,
    dealerId: null,
  });

  if (input.toStage === "KAYBEDILDI" && !input.lostReason?.trim()) {
    throw new Error("Kaybedildi aşaması için kayıp nedeni zorunlu.");
  }

  let updated = 0;
  const errors: string[] = [];
  for (const leadId of input.leadIds) {
    try {
      await transitionLeadStage({
        leadId,
        toStage: input.toStage as LeadStage,
        lostReason: input.lostReason,
        reason: input.reason,
        actorId: session.user.id,
      });
      updated += 1;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : leadId);
    }
  }

  revalidatePath("/panel/bayi-adaylari");
  revalidatePath("/panel/bayiler");
  return { updated, failed: errors.length, errors: errors.slice(0, 3) };
}

export async function promoteLeadAction(leadId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz.");
  }
  assertCan("lead:promote", { isStaff: true, userId: session.user.id, dealerId: null });
  await promoteLeadToDealer(leadId, session.user.id);
  revalidatePath("/panel/bayi-adaylari");
  revalidatePath("/panel/bayiler");
}
