import { prisma } from "@/infra/db/client";
import { Prisma } from "@/generated/prisma";
import { add, kg, zeroKg } from "@/domain/weight";
import { isLotExpired, type LotSummary } from "@/domain/inventory/fefo";
import { packLabel } from "@/lib/format/packaging";
import {
  availableKgFromMovements,
  assertCanRecordMovement,
  type RecordableMovementType,
} from "@/domain/inventory/movements";

export { availableKgFromMovements } from "@/domain/inventory/movements";

export type DbTx = Prisma.TransactionClient;

/** Serializes lot reads before CIKIS/GIRIS so two confirms cannot share the same kg. */
export async function lockLotRows(
  tx: DbTx,
  input: { variantIds?: readonly string[]; lotIds?: readonly string[] },
) {
  const variantIds = [...new Set(input.variantIds ?? [])].sort();
  const lotIds = [...new Set(input.lotIds ?? [])].sort();
  if (variantIds.length > 0) {
    await tx.$queryRaw(Prisma.sql`
      SELECT id FROM lot WHERE "variantId" IN (${Prisma.join(variantIds)}) ORDER BY id FOR UPDATE
    `);
  }
  if (lotIds.length > 0) {
    await tx.$queryRaw(Prisma.sql`
      SELECT id FROM lot WHERE id IN (${Prisma.join(lotIds)}) ORDER BY id FOR UPDATE
    `);
  }
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
  const expiredOnHandKg = lots
    .filter((lot) => lot.expired)
    .reduce((sum, lot) => add(sum, lot.availableKg), zeroKg);
  const shippableKg = shippable.reduce((sum, lot) => add(sum, lot.availableKg), zeroKg);

  return {
    totalKg: add(shippableKg, expiredOnHandKg),
    shippableKg,
    expiredOnHandKg,
    lotCount: lots.length,
  };
}

export async function getVariantStockSummary(variantId: string) {
  const lots = await getLotsForVariant(variantId);
  const expiredOnHandKg = lots
    .filter((lot) => lot.expired)
    .reduce((sum, lot) => add(sum, lot.availableKg), zeroKg);
  const shippableKg = lots
    .filter((lot) => !lot.expired)
    .reduce((sum, lot) => add(sum, lot.availableKg), zeroKg);
  return {
    totalKg: add(shippableKg, expiredOnHandKg),
    shippableKg,
    expiredOnHandKg,
    lotCount: lots.length,
  };
}

export async function getInventoryDashboardSummary() {
  const lots = await prisma.lot.findMany({ include: { movements: true } });
  const now = new Date();
  const soon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  let shippableKg = zeroKg;
  let expiredOnHandKg = zeroKg;
  for (const lot of lots) {
    const available = availableKgFromMovements(lot.movements);
    if (isLotExpired(lot.expirationDate, now)) {
      expiredOnHandKg = add(expiredOnHandKg, available);
    } else {
      shippableKg = add(shippableKg, available);
    }
  }

  const expiringSoonCount = lots.filter(
    (lot) => lot.expirationDate >= now && lot.expirationDate <= soon,
  ).length;
  const expiredCount = lots.filter((lot) => lot.expirationDate < now).length;
  const healthyCount = lots.filter((lot) => lot.expirationDate > soon).length;

  return {
    /** Sevk edilebilir stok (SKT geçmiş hariç). Eski alan adı uyumluluk için korunur. */
    totalKg: shippableKg,
    shippableKg,
    expiredOnHandKg,
    lotCount: lots.length,
    expiringSoonCount,
    expiredCount,
    healthyCount,
  };
}

export type StockBoardLot = {
  id: string;
  lotNumber: string;
  expirationDate: string;
  expired: boolean;
  daysToExpiry: number;
  availableKg: number;
  movements: Array<{
    id: string;
    type: "GIRIS" | "CIKIS" | "REPACK" | "FIRE";
    quantityKg: number;
    note: string | null;
    createdAt: string;
  }>;
};

export type StockBoardRow = {
  variantId: string;
  sku: string;
  packSize: string | null;
  packagingType: string;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  productActive: boolean;
  totalKg: number;
  shippableKg: number;
  expiredOnHandKg: number;
  lotCount: number;
  nearestExpiry: string | null;
  lots: StockBoardLot[];
};

/** All active variants with lots + balances for /panel/stok. */
export async function getStockBoard(): Promise<StockBoardRow[]> {
  const variants = await prisma.productVariant.findMany({
    where: { isActive: true },
    orderBy: [{ product: { name: "asc" } }, { sortOrder: "asc" }],
    include: {
      product: {
        select: { id: true, name: true, slug: true, imageUrl: true, active: true },
      },
      lots: {
        include: { movements: true },
        orderBy: { expirationDate: "asc" },
      },
    },
  });

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return variants.map((v) => {
    const lots: StockBoardLot[] = v.lots.map((lot) => {
      const available = availableKgFromMovements(lot.movements);
      const expMs = lot.expirationDate.getTime();
      const expired = expMs < now;
      return {
        id: lot.id,
        lotNumber: lot.lotNumber,
        expirationDate: lot.expirationDate.toISOString(),
        expired,
        daysToExpiry: Math.ceil((expMs - now) / dayMs),
        availableKg: available.toNumber(),
        movements: lot.movements
          .slice()
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map((m) => ({
            id: m.id,
            type: m.type as "GIRIS" | "CIKIS" | "REPACK" | "FIRE",
            quantityKg: Number(m.quantityKg),
            note: m.note,
            createdAt: m.createdAt.toISOString(),
          })),
      };
    });

    const totalKg = lots.reduce((s, l) => s + l.availableKg, 0);
    const shippableKg = lots.filter((l) => !l.expired).reduce((s, l) => s + l.availableKg, 0);
    const expiredOnHandKg = lots.filter((l) => l.expired).reduce((s, l) => s + l.availableKg, 0);
    const nearest = lots.find((l) => !l.expired && l.availableKg > 0);

    return {
      variantId: v.id,
      sku: v.sku,
      packSize: v.packSize,
      packagingType: v.packagingType,
      productId: v.product.id,
      productName: v.product.name,
      productSlug: v.product.slug,
      imageUrl: v.product.imageUrl,
      productActive: v.product.active,
      totalKg,
      shippableKg,
      expiredOnHandKg,
      lotCount: lots.length,
      nearestExpiry: nearest?.expirationDate ?? null,
      lots,
    };
  });
}

export async function listVariantsForStockPicker() {
  const variants = await prisma.productVariant.findMany({
    where: { isActive: true, product: { active: true } },
    orderBy: [{ product: { name: "asc" } }, { sortOrder: "asc" }],
    select: {
      id: true,
      sku: true,
      packSize: true,
      packagingType: true,
      product: { select: { name: true, slug: true } },
    },
  });
  return variants.map((v) => ({
    id: v.id,
    slug: v.product.slug,
    label: `${v.product.name} · ${packLabel(v.packSize, v.packagingType)} (${v.sku})`,
  }));
}

/** Ürün listesi stok sütunu: yalnızca sevk edilebilir kg. */
export async function getStockSummaryByProduct() {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: {
      id: true,
      variants: { select: { lots: { include: { movements: true } } } },
    },
  });

  const now = new Date();
  return new Map(
    products.map((product) => {
      const shippableMovements = product.variants.flatMap((v) =>
        v.lots
          .filter((lot) => !isLotExpired(lot.expirationDate, now))
          .flatMap((lot) => lot.movements),
      );
      return [product.id, availableKgFromMovements(shippableMovements)];
    }),
  );
}

/** Sevkiyat edilebilir (SKT geçmemiş) stok kg, varyant bazında. */
export async function getShippableStockByVariant() {
  const variants = await prisma.productVariant.findMany({
    where: { isActive: true },
    select: {
      id: true,
      lots: {
        include: { movements: true },
      },
    },
  });

  const now = new Date();
  return new Map(
    variants.map((variant) => {
      const shippable = variant.lots
        .filter((lot) => !isLotExpired(lot.expirationDate, now))
        .flatMap((lot) => lot.movements);
      return [variant.id, availableKgFromMovements(shippable)];
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
  type: RecordableMovementType;
  quantityKg: number;
  note?: string;
}) {
  return prisma.$transaction(async (tx) => {
    await lockLotRows(tx, { lotIds: [input.lotId] });
    const lot = await tx.lot.findUniqueOrThrow({
      where: { id: input.lotId },
      include: { movements: true },
    });

    const available = availableKgFromMovements(lot.movements);
    assertCanRecordMovement({
      type: input.type,
      quantityKg: input.quantityKg,
      note: input.note,
      lotNumber: lot.lotNumber,
      availableKg: available,
      expirationDate: lot.expirationDate,
    });

    return tx.stockMovement.create({
      data: {
        lotId: input.lotId,
        type: input.type,
        quantityKg: input.quantityKg,
        note: input.note?.trim() || undefined,
      },
    });
  });
}
