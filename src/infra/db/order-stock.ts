import { Prisma } from "@/generated/prisma";
import { allocateOrderLinesFefo } from "@/domain/inventory/reservation";
import { availableKgFromMovements } from "@/domain/inventory/movements";
import { fromCases } from "@/domain/weight";
import { type LotSummary } from "@/domain/inventory/fefo";
import { lockLotRows, type DbTx } from "@/infra/db/inventory";

function orderShortCode(orderId: string) {
  return orderId.slice(-6);
}

export async function reserveOrderStockTx(
  tx: DbTx,
  order: {
    id: string;
    lines: Array<{
      id: string;
      variantId: string;
      quantity: number;
      variant: { unitFactor: Prisma.Decimal };
    }>;
  },
) {
  const already = await tx.orderLotAllocation.count({
    where: { orderId: order.id, releasedAt: null },
  });
  if (already > 0) return;

  const variantIds = order.lines.map((line) => line.variantId);
  await lockLotRows(tx, { variantIds });

  const lotsByVariant = new Map<string, LotSummary[]>();
  for (const variantId of [...new Set(variantIds)]) {
    const lots = await tx.lot.findMany({
      where: { variantId },
      include: { movements: true },
    });
    lotsByVariant.set(
      variantId,
      lots.map((lot) => ({
        id: lot.id,
        lotNumber: lot.lotNumber,
        expirationDate: lot.expirationDate,
        availableKg: availableKgFromMovements(lot.movements),
      })),
    );
  }

  const allocations = allocateOrderLinesFefo(
    lotsByVariant,
    order.lines.map((line) => ({
      orderLineId: line.id,
      variantId: line.variantId,
      requiredKg: fromCases(line.quantity, line.variant.unitFactor.toString()),
    })),
  );

  const note = `Sipariş #${orderShortCode(order.id)} onay`;
  for (const allocation of allocations) {
    await tx.orderLotAllocation.create({
      data: {
        orderId: order.id,
        orderLineId: allocation.orderLineId,
        lotId: allocation.lotId,
        quantityKg: allocation.quantityKg.toString(),
      },
    });
    await tx.stockMovement.create({
      data: {
        lotId: allocation.lotId,
        type: "CIKIS",
        quantityKg: allocation.quantityKg.toString(),
        note,
      },
    });
  }
}

export async function releaseOrderStockTx(tx: DbTx, orderId: string) {
  const blocking = await tx.shipment.findFirst({
    where: { orderId, status: { in: ["YOLDA", "TESLIM_EDILDI"] } },
    select: { id: true },
  });
  if (blocking) {
    throw new Error("Yoldaki veya teslim edilmiş sevkiyat varken sipariş iptal edilemez.");
  }

  const allocations = await tx.orderLotAllocation.findMany({
    where: { orderId, releasedAt: null },
  });
  await lockLotRows(tx, { lotIds: allocations.map((row) => row.lotId) });

  const note = `Sipariş #${orderShortCode(orderId)} iptal`;
  const now = new Date();
  for (const allocation of allocations) {
    await tx.stockMovement.create({
      data: {
        lotId: allocation.lotId,
        type: "GIRIS",
        quantityKg: allocation.quantityKg,
        note,
      },
    });
  }
  if (allocations.length > 0) {
    await tx.orderLotAllocation.updateMany({
      where: { orderId, releasedAt: null },
      data: { releasedAt: now },
    });
  }

  await tx.shipment.updateMany({
    where: { orderId, status: "HAZIRLANIYOR" },
    data: { status: "IPTAL" },
  });
}
