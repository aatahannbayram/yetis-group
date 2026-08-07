"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { markNotificationRead, markAllStaffRead } from "@/infra/db/notifications";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

export async function markStaffNotificationReadAction(id: string) {
  await requireStaff();
  await markNotificationRead(id);
  revalidatePath("/panel/bildirimler");
  revalidatePath("/panel");
}

export async function markAllStaffNotificationsReadAction() {
  await requireStaff();
  await markAllStaffRead();
  revalidatePath("/panel/bildirimler");
  revalidatePath("/panel");
}
