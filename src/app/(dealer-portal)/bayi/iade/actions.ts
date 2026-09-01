"use server";

import { revalidatePath } from "next/cache";
import { requireDealerPortal } from "@/features/dealer/portal-context";
import { can } from "@/policies";
import { createReturnRequest, getReturnableOrderLines } from "@/infra/db/returns";
import { saveUploadedImage } from "@/infra/storage/local";
import { prisma } from "@/infra/db/client";
import type { ReturnReason } from "@/domain/return/reasons";

export async function loadReturnableOrderLinesAction(orderId: string) {
  const ctx = await requireDealerPortal();
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, select: { dealerId: true } });
  if (order.dealerId !== ctx.dealerId) throw new Error("Yetkisiz");
  return getReturnableOrderLines(orderId);
}

export async function uploadReturnPhotoAction(formData: FormData) {
  await requireDealerPortal();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Dosya gerekli");
  return saveUploadedImage(file, "iade");
}

export async function createReturnRequestAction(input: {
  orderId: string;
  items: {
    orderLineId: string;
    quantity: number;
    reason: ReturnReason;
    lotNumber?: string;
    photoUrls?: string[];
    note?: string;
  }[];
}) {
  const ctx = await requireDealerPortal();
  if (
    !can("return:create", { isStaff: false, staffRole: null, userId: ctx.userId, dealerId: ctx.dealerId })
  ) {
    throw new Error("Yetkisiz");
  }
  const request = await createReturnRequest({
    dealerId: ctx.dealerId,
    orderId: input.orderId,
    createdByUserId: ctx.userId,
    createdByRole: "BAYI",
    items: input.items,
  });
  revalidatePath("/bayi/iade");
  revalidatePath("/panel/iadeler");
  return { returnNo: request.returnNo };
}
