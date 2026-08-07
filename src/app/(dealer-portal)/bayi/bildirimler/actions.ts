"use server";

import { revalidatePath } from "next/cache";
import { resolveDealerContext } from "@/features/dealer/actions";
import { markDealerNotificationRead, markAllDealerRead } from "@/infra/db/notifications";

export async function markDealerNotificationReadAction(id: string) {
  const ctx = await resolveDealerContext();
  if (!ctx) throw new Error("Oturum veya bayi bulunamadı");
  await markDealerNotificationRead(ctx.dealerId, id);
  revalidatePath("/bayi/bildirimler");
  revalidatePath("/bayi");
}

export async function markAllDealerNotificationsReadAction() {
  const ctx = await resolveDealerContext();
  if (!ctx) throw new Error("Oturum veya bayi bulunamadı");
  await markAllDealerRead(ctx.dealerId);
  revalidatePath("/bayi/bildirimler");
  revalidatePath("/bayi");
}
