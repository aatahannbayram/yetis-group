"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import { getStaffProfile } from "@/infra/db/users";
import { assertCan } from "@/policies";
import type { StaffRole } from "@/domain/staff/roles";
import {
  createReturnRequest,
  getReturnableOrderLines,
  getReturnSettings,
  transitionReturnRequest,
  updateReturnSettings,
} from "@/infra/db/returns";
import { saveUploadedImage } from "@/infra/storage/local";
import type { ReturnRequestStatus } from "@/domain/return/state-machine";
import type { ReturnReason } from "@/domain/return/reasons";

async function requireFullStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Yetkisiz.");
  const profile = await getStaffProfile(session.user.id);
  if (!profile?.isStaff) throw new Error("Yetkisiz.");
  return { session, profile };
}

function policyCtx(profile: { staffRole: StaffRole | null }, userId: string) {
  return { isStaff: true, staffRole: profile.staffRole, userId, dealerId: null };
}

export async function loadReturnableOrderLinesAction(orderId: string) {
  await requireFullStaff();
  return getReturnableOrderLines(orderId);
}

export async function createReturnRequestAsStaffAction(input: {
  dealerId: string;
  orderId: string;
  items: {
    orderLineId: string;
    quantity: number;
    reason: ReturnReason;
    lotNumber?: string;
    note?: string;
  }[];
}) {
  const { session, profile } = await requireFullStaff();
  assertCan("return:create", policyCtx(profile, session.user.id));
  const request = await createReturnRequest({
    dealerId: input.dealerId,
    orderId: input.orderId,
    createdByUserId: session.user.id,
    createdByRole: "STAFF",
    items: input.items,
  });
  revalidatePath("/panel/iadeler");
  revalidatePath("/bayi/iade");
  return request;
}

export async function transitionReturnRequestAction(
  id: string,
  to: ReturnRequestStatus,
  input?: {
    rejectReason?: string;
    approvedQtyByItem?: Record<string, number>;
    acceptedByItem?: Record<string, { goodQty: number; damagedQty: number }>;
    shippingCostResponsibility?: "YETIS" | "BAYI";
    shippingCostKurus?: number;
    cashRefundNeeded?: boolean;
    cashRefundNote?: string;
  },
) {
  const { session, profile } = await requireFullStaff();
  if (to === "URUN_TESLIM_ALINDI") {
    assertCan("return:warehouse_accept", policyCtx(profile, session.user.id));
  } else if (to === "FATURALANDI") {
    assertCan("return:invoice", policyCtx(profile, session.user.id));
  } else {
    assertCan("return:review", policyCtx(profile, session.user.id));
  }
  const result = await transitionReturnRequest(id, to, { actorUserId: session.user.id, ...input });
  revalidatePath("/panel/iadeler");
  revalidatePath("/panel/cari");
  revalidatePath("/bayi/iade");
  return result;
}

export async function uploadReturnPhotoAction(formData: FormData) {
  await requireFullStaff();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Dosya gerekli");
  return saveUploadedImage(file, "iade");
}

export async function getReturnSettingsAction() {
  await requireFullStaff();
  return getReturnSettings();
}

export async function updateReturnSettingsAction(data: {
  returnWindowDays: number;
  returnRatioAlertBps: number;
}) {
  const { session, profile } = await requireFullStaff();
  assertCan("settings:return", policyCtx(profile, session.user.id));
  const row = await updateReturnSettings(data);
  revalidatePath("/panel/iadeler");
  return row;
}
