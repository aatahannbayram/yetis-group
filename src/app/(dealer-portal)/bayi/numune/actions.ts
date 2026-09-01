"use server";

import { revalidatePath } from "next/cache";
import { requireDealerPortal } from "@/features/dealer/portal-context";
import { prisma } from "@/infra/db/client";
import { can } from "@/policies";
import { createSampleRequest, transitionSampleRequest } from "@/infra/db/samples";

export async function createSampleRequestAction(input: {
  deliveryAddressLine: string;
  note?: string;
  items: { variantId: string; quantity: number }[];
}) {
  const ctx = await requireDealerPortal();
  if (!can("sample:create", { isStaff: false, staffRole: null, userId: ctx.userId, dealerId: ctx.dealerId })) {
    throw new Error("Yetkisiz");
  }
  if (!input.deliveryAddressLine.trim()) throw new Error("Teslimat adresi gerekli");

  const request = await createSampleRequest({
    dealerId: ctx.dealerId,
    createdByUserId: ctx.userId,
    createdByRole: "BAYI",
    deliveryAddressLine: input.deliveryAddressLine.trim(),
    note: input.note,
    items: input.items,
  });
  revalidatePath("/bayi/numune");
  revalidatePath("/panel/numuneler");
  return { requestNo: request.requestNo, flaggedForReview: request.flaggedForReview };
}

export async function cancelSampleRequestAction(id: string) {
  const ctx = await requireDealerPortal();
  const request = await prisma.sampleRequest.findUniqueOrThrow({
    where: { id },
    select: { dealerId: true },
  });
  if (request.dealerId !== ctx.dealerId) throw new Error("Yetkisiz");
  if (
    !can("sample:cancel", { isStaff: false, staffRole: null, userId: ctx.userId, dealerId: ctx.dealerId })
  ) {
    throw new Error("Yetkisiz");
  }
  await transitionSampleRequest(id, "IPTAL", { actorUserId: ctx.userId });
  revalidatePath("/bayi/numune");
  revalidatePath("/panel/numuneler");
}
