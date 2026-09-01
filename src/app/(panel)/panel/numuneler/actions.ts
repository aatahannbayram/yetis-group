"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import { getStaffProfile } from "@/infra/db/users";
import { assertCan } from "@/policies";
import {
  bulkApproveSampleRequests,
  bulkRejectSampleRequests,
  getSampleLimitSettings,
  listSampleRequests,
  transitionSampleRequest,
  updateSampleLimitSettings,
} from "@/infra/db/samples";
import { prisma } from "@/infra/db/client";
import type { SampleRequestStatus } from "@/domain/sample/state-machine";

async function requireFullStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Yetkisiz.");
  const profile = await getStaffProfile(session.user.id);
  if (!profile?.isStaff) throw new Error("Yetkisiz.");
  return { session, profile };
}

function policyCtx(profile: { staffRole: import("@/domain/staff/roles").StaffRole | null }, userId: string) {
  return { isStaff: true, staffRole: profile.staffRole, userId, dealerId: null };
}

export async function loadSampleRequestsAction(filters?: {
  status?: SampleRequestStatus;
  dealerId?: string;
}) {
  await requireFullStaff();
  return listSampleRequests(filters);
}

export async function transitionSampleRequestAction(
  id: string,
  to: SampleRequestStatus,
  input?: { rejectReason?: string; cargoCompany?: string; trackingNo?: string },
) {
  const { session, profile } = await requireFullStaff();
  assertCan("sample:review", policyCtx(profile, session.user.id));
  const result = await transitionSampleRequest(id, to, {
    actorUserId: session.user.id,
    ...input,
  });
  revalidatePath("/panel/numuneler");
  revalidatePath("/bayi/numune");
  return result;
}

export async function bulkApproveSampleRequestsAction(ids: string[]) {
  const { session, profile } = await requireFullStaff();
  assertCan("sample:approve", policyCtx(profile, session.user.id));
  const result = await bulkApproveSampleRequests(ids, session.user.id);
  revalidatePath("/panel/numuneler");
  revalidatePath("/bayi/numune");
  return result;
}

export async function bulkRejectSampleRequestsAction(ids: string[], reason: string) {
  const { session, profile } = await requireFullStaff();
  assertCan("sample:approve", policyCtx(profile, session.user.id));
  if (!reason.trim()) throw new Error("Red nedeni gerekli");
  const result = await bulkRejectSampleRequests(ids, reason.trim(), session.user.id);
  revalidatePath("/panel/numuneler");
  revalidatePath("/bayi/numune");
  return result;
}

export async function recordSampleFulfillmentAction(
  itemId: string,
  input: { unitCostKurus: number },
) {
  await requireFullStaff();
  if (!Number.isInteger(input.unitCostKurus) || input.unitCostKurus < 0) {
    throw new Error("Geçerli bir maliyet girin");
  }
  const item = await prisma.sampleRequestItem.findUniqueOrThrow({
    where: { id: itemId },
    select: { quantity: true },
  });
  await prisma.sampleRequestItem.update({
    where: { id: itemId },
    data: {
      unitCostKurus: input.unitCostKurus,
      totalCostKurus: input.unitCostKurus * item.quantity,
    },
  });
  revalidatePath("/panel/numuneler");
}

export async function getSampleLimitSettingsAction() {
  await requireFullStaff();
  return getSampleLimitSettings();
}

export async function updateSampleLimitSettingsAction(data: {
  maxRequestsPerDealerPerMonth: number;
  maxValueKurusPerDealerPerMonth: number;
  maxQtyPerProduct: number;
  repeatBlockDays: number;
  conversionWindowDays: number;
  staleFollowupDays: number;
}) {
  const { session, profile } = await requireFullStaff();
  assertCan("settings:sample_limits", policyCtx(profile, session.user.id));
  const row = await updateSampleLimitSettings(data);
  revalidatePath("/panel/numuneler");
  return row;
}
