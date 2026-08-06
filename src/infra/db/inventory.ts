import { prisma } from "@/infra/db/client";
import { add, compare, kg, subtract, zeroKg, type Kg } from "@/domain/weight";
import { assertNotExpired, isLotExpired, type LotSummary } from "@/domain/inventory/fefo";

function availableKgFromMovements(movements: { type: string; quantityKg: unknown }[]): Kg {
  return movements.reduce((total, movement) => {
    const quantity = kg(String(movement.quantityKg));
    if (movement.type === "GIRIS") return add(total, quantity);
    if (movement.type === "CIKIS") return subtract(total, quantity);
    // REPACK reserved - not applied to balance until M13+ implementation
    return total;
  }, zeroKg);
}

export async function getLotsForVariant(variantId: string) {
  const lots = await prisma.lot.findMany({
    where: { variantId },
    include: { movements: true },
    orderBy: { expirationDate: "asc" },
  });

  return lots.map((lot) => ({
    id: lot.id,
    lotNumber: lot.lotNumber,
    expirationDate: lot.expirationDate,
    createdAt: lot.createdAt,
    expired: isLotExpired(lot.expirationDate),
    availableKg: availableKgFromMovements(lot.movements),
    movements: lot.movements
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((m) => ({
        id: m.id,
        type: m.type,
        quantityKg: kg(m.quantityKg.toString()),
        note: m.note,
        createdAt: m.createdAt,
      })),
  }));
}

/** @deprecated prefer getLotsForVariant - aggregates all variants of a product */
export async function getLotsForProduct(productId: string) {
  const variants = await prisma.productVariant.findMany({
    where: { productId },
    select: { id: true },
  });
  const lots = [];
  for (const v of variants) {
    lots.push(...(await getLotsForVariant(v.id)));
  }
  return lots.sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());
}

export async function getProductStockSummary(productId: string) {
  const lots = await getLotsForProduct(productId);
  const shippable: LotSummary[] = lots
    .filter((lot) => !lot.expired)
    .map((lot) => ({
      id: lot.id,
      lotNumber: lot.lotNumber,
      expirationDate: lot.expirationDate,
      availableKg: lot.availableKg,
    }));

  return {
    totalKg: lots.reduce((sum, lot) => add(sum, lot.availableKg), zeroKg),
    shippableKg: shippable.reduce((sum, lot) => add(sum, lot.availableKg), zeroKg),
    lotCount: lots.length,
  };
}

export async function getVariantStockSummary(variantId: string) {
  const lots = await getLotsForVariant(variantId);
  return {
    totalKg: lots.reduce((sum, lot) => add(sum, lot.availableKg), zeroKg),
    shippableKg: lots
      .filter((lot) => !lot.expired)
      .reduce((sum, lot) => add(sum, lot.availableKg), zeroKg),
    lotCount: lots.length,
  };
}

export async function getInventoryDashboardSummary() {
  const lots = await prisma.lot.findMany({ include: { movements: true } });
  const now = new Date();
  const soon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const totalKg = lots.reduce(
    (sum, lot) => add(sum, availableKgFromMovements(lot.movements)),
    zeroKg,
  );
  const expiringSoonCount = lots.filter(
    (lot) => lot.expirationDate >= now && lot.expirationDate <= soon,
  ).length;

  return { totalKg, lotCount: lots.length, expiringSoonCount };
}

export async function getStockSummaryByProduct() {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: {
      id: true,
      variants: { select: { lots: { include: { movements: true } } } },
    },
  });

  return new Map(
    products.map((product) => {
      const allMovements = product.variants.flatMap((v) => v.lots.flatMap((lot) => lot.movements));
      return [product.id, availableKgFromMovements(allMovements)];
    }),
  );
}

export async function createLot(input: {
  variantId: string;
  lotNumber: string;
  expirationDate: Date;
  initialKg: number;
}) {
  return prisma.lot.create({
    data: {
      variantId: input.variantId,
      lotNumber: input.lotNumber,
      expirationDate: input.expirationDate,
      movements: {
        create: { type: "GIRIS", quantityKg: input.initialKg, note: "İlk stok girişi" },
      },
    },
  });
}

export async function addStockMovement(input: {
  lotId: string;
  type: "GIRIS" | "CIKIS";
  quantityKg: number;
  note?: string;
}) {
  const lot = await prisma.lot.findUniqueOrThrow({
    where: { id: input.lotId },
    include: { movements: true },
  });

  if (input.type === "CIKIS") {
    assertNotExpired({ lotNumber: lot.lotNumber, expirationDate: lot.expirationDate });

    const available = availableKgFromMovements(lot.movements);
    if (compare(available, kg(input.quantityKg)) < 0) {
      throw new Error(`${lot.lotNumber} lotunda yeterli stok yok (mevcut: ${available.toString()} kg).`);
    }
  }

  return prisma.stockMovement.create({
    data: {
      lotId: input.lotId,
      type: input.type,
      quantityKg: input.quantityKg,
      note: input.note,
    },
  });
}
