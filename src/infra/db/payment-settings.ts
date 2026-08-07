import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import { prisma } from "@/infra/db/client";

const SINGLETON_ID = "singleton";

async function loadPaymentSettings() {
  const existing = await prisma.paymentSettings.findUnique({
    where: { id: SINGLETON_ID },
  });
  if (existing) return existing;
  return prisma.paymentSettings.create({ data: { id: SINGLETON_ID } });
}

/** Cached read — never upserts on hot path (Neon write latency). */
export const getPaymentSettings = unstable_cache(loadPaymentSettings, ["payment-settings"], {
  revalidate: 300,
  tags: ["payment-settings"],
});

export async function updatePaymentSettings(data: {
  bankTransferEnabled: boolean;
  bankName: string;
  accountHolder: string;
  iban: string;
  note: string;
}) {
  const row = await prisma.paymentSettings.upsert({
    where: { id: SINGLETON_ID },
    update: data,
    create: { id: SINGLETON_ID, ...data },
  });
  revalidateTag("payment-settings", "max");
  return row;
}
