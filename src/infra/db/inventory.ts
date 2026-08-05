import { prisma } from "@/infra/db/client";
import { add, compare, kg, subtract, zeroKg, type Kg } from "@/domain/weight";
import { assertNotExpired, isLotExpired, type LotSummary } from "@/domain/inventory/fefo";

function availableKgFromMovements(movements: { type: string; quantityKg: unknown }[]): Kg {
  return movements.reduce((total, movement) => {
    const quantity = kg(String(movement.quantityKg));
    return movement.type === "GIRIS" ? add(total, quantity) : subtract(total, quantity);
  }, zeroKg);
}

export async function getLotsForProduct(productId: string) {
  const lots = await prisma.lot.findMany({
    where: { productId },
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
    select: { id: true, lots: { include: { movements: true } } },
  });

  return new Map(
    products.map((product) => {
      const allMovements = product.lots.flatMap((lot) => lot.movements);
      return [product.id, availableKgFromMovements(allMovements)];
    }),
  );
}

export async function createLot(input: {
  productId: string;
  lotNumber: string;
  expirationDate: Date;
  initialKg: number;
}) {
  return prisma.lot.create({
    data: {
      productId: input.productId,
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
