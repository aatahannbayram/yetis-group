import { prisma } from "@/infra/db/client";

const SINGLETON_ID = "singleton";

export async function getPaymentSettings() {
  return prisma.paymentSettings.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}

export async function updatePaymentSettings(data: {
  bankTransferEnabled: boolean;
  bankName: string;
  accountHolder: string;
  iban: string;
  note: string;
}) {
  return prisma.paymentSettings.upsert({
    where: { id: SINGLETON_ID },
    update: data,
    create: { id: SINGLETON_ID, ...data },
  });
}
