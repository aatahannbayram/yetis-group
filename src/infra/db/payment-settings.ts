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
  depotLabel?: string;
  depotLat?: number | null;
  depotLng?: number | null;
}) {
  const row = await prisma.paymentSettings.upsert({
    where: { id: SINGLETON_ID },
    update: {
      bankTransferEnabled: data.bankTransferEnabled,
      bankName: data.bankName,
      accountHolder: data.accountHolder,
      iban: data.iban,
      note: data.note,
      ...(data.depotLabel !== undefined ? { depotLabel: data.depotLabel } : {}),
      ...(data.depotLat !== undefined ? { depotLat: data.depotLat } : {}),
      ...(data.depotLng !== undefined ? { depotLng: data.depotLng } : {}),
    },
    create: {
      id: SINGLETON_ID,
      bankTransferEnabled: data.bankTransferEnabled,
      bankName: data.bankName,
      accountHolder: data.accountHolder,
      iban: data.iban,
      note: data.note,
      depotLabel: data.depotLabel ?? "Yetiş Grup Depo",
      depotLat: data.depotLat ?? null,
      depotLng: data.depotLng ?? null,
    },
  });
  revalidateTag("payment-settings", "max");
  return row;
}
