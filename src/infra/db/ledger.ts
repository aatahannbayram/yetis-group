import { prisma } from "@/infra/db/client";
import { calculateBalance } from "@/domain/ledger";

export async function listDealerBalances() {
  const dealers = await prisma.dealer.findMany({
    orderBy: { unvan: "asc" },
    select: {
      id: true,
      unvan: true,
      dealerType: true,
      status: true,
      creditLimitKurus: true,
      paymentTermDays: true,
      ledgerEntries: { orderBy: { createdAt: "desc" } },
    },
  });

  return dealers.map((d) => ({
    id: d.id,
    unvan: d.unvan,
    dealerType: d.dealerType,
    status: d.status,
    creditLimitKurus: d.creditLimitKurus,
    paymentTermDays: d.paymentTermDays,
    entryCount: d.ledgerEntries.length,
    balanceKurus: calculateBalance(d.ledgerEntries),
    entries: d.ledgerEntries,
  }));
}

export async function addLedgerEntry(input: {
  dealerId: string;
  type: "BORC" | "ODEME";
  amountKurus: number;
  description: string;
}) {
  if (input.amountKurus <= 0) throw new Error("Tutar sıfırdan büyük olmalı");
  return prisma.ledgerEntry.create({ data: input });
}

/**
 * Düzeltme = ters kayıt. Kayıtlar asla düzenlenmez veya silinmez;
 * bu, orijinali net sıfırlayan yeni bir kayıt oluşturur.
 */
export async function reverseLedgerEntry(entryId: string) {
  const original = await prisma.ledgerEntry.findUniqueOrThrow({ where: { id: entryId } });
  return prisma.ledgerEntry.create({
    data: {
      dealerId: original.dealerId,
      type: original.type === "BORC" ? "ODEME" : "BORC",
      amountKurus: original.amountKurus,
      description: `Düzeltme: "${original.description}" kaydının tersi`,
      reversesId: original.id,
    },
  });
}
