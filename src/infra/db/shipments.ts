import { prisma } from "@/infra/db/client";
import { lockLotRows, availableKgFromMovements } from "@/infra/db/inventory";
import { suggestFefoShipment } from "@/domain/inventory/fefo";
import { canTransitionShipment, type ShipmentStatus } from "@/domain/shipment";
import { kg, sum } from "@/domain/weight";
import { packLabel } from "@/lib/format/packaging";

export async function listShippableVariants() {
  const variants = await prisma.productVariant.findMany({
    where: { isActive: true },
    orderBy: { product: { name: "asc" } },
    include: { product: { select: { name: true } } },
  });
  return variants.map((v) => ({
    id: v.id,
    label: `${v.product.name} · ${packLabel(v.packSize, v.packagingType)}`,
  }));
}

export async function listShipments() {
  return prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      dealer: { select: { id: true, unvan: true, dealerType: true } },
      variant: { select: { id: true, sku: true, packSize: true, packagingType: true, product: { select: { name: true } } } },
      allocations: { include: { lot: { select: { lotNumber: true } } } },
    },
  });
}

export async function listShipmentsForDealer(dealerId: string) {
  return prisma.shipment.findMany({
    where: { dealerId },
    orderBy: { createdAt: "desc" },
    include: {
      variant: {
        select: {
          id: true,
          sku: true,
          packSize: true,
          packagingType: true,
          product: { select: { name: true, imageUrl: true } },
        },
      },
      allocations: { include: { lot: { select: { lotNumber: true, expirationDate: true } } } },
      order: { select: { id: true, status: true } },
    },
  });
}

export async function createShipment(input: {
  dealerId: string;
  variantId: string;
  quantityKg: number;
  note?: string;
  orderId?: string;
  orderLineId?: string;
}) {
  if (input.quantityKg <= 0) throw new Error("Miktar sıfırdan büyük olmalı");

  return prisma.$transaction(
    async (tx) => {
      await lockLotRows(tx, { variantIds: [input.variantId] });

      let allocationRows: Array<{ lotId: string; quantityKg: string }> | null = null;
      let writeCikis = true;

      if (input.orderId && input.orderLineId) {
        const existingShip = await tx.shipment.findFirst({
          where: {
            orderId: input.orderId,
            orderLineId: input.orderLineId,
            status: { not: "IPTAL" },
          },
          select: { id: true },
        });
        if (existingShip) {
          throw new Error("Bu kalem için sevkiyat zaten oluşturuldu.");
        }

        const reserved = await tx.orderLotAllocation.findMany({
          where: {
            orderId: input.orderId,
            orderLineId: input.orderLineId,
            releasedAt: null,
          },
        });
        if (reserved.length > 0) {
          allocationRows = reserved.map((row) => ({
            lotId: row.lotId,
            quantityKg: row.quantityKg.toString(),
          }));
          writeCikis = false;
        }
      }

      if (!allocationRows) {
        const lots = await tx.lot.findMany({
          where: { variantId: input.variantId },
          include: { movements: true },
        });
        const fefo = suggestFefoShipment(
          lots.map((lot) => ({
            id: lot.id,
            lotNumber: lot.lotNumber,
            expirationDate: lot.expirationDate,
            availableKg: availableKgFromMovements(lot.movements),
          })),
          kg(input.quantityKg),
        );
        allocationRows = fefo.map((row) => ({
          lotId: row.lotId,
          quantityKg: row.quantityKg.toString(),
        }));
        writeCikis = true;
      }

      const shipment = await tx.shipment.create({
        data: {
          dealerId: input.dealerId,
          variantId: input.variantId,
          orderId: input.orderId,
          orderLineId: input.orderLineId,
          quantityKg: writeCikis
            ? input.quantityKg
            : sum(allocationRows.map((row) => kg(row.quantityKg))).toString(),
          note: input.note,
        },
      });

      for (const allocation of allocationRows) {
        await tx.shipmentLotAllocation.create({
          data: {
            shipmentId: shipment.id,
            lotId: allocation.lotId,
            quantityKg: allocation.quantityKg,
          },
        });
        if (writeCikis) {
          await tx.stockMovement.create({
            data: {
              lotId: allocation.lotId,
              type: "CIKIS",
              quantityKg: allocation.quantityKg,
              note: `Sevkiyat #${shipment.id.slice(-6)}`,
            },
          });
        }
      }

      return shipment;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

export async function updateShipmentStatus(shipmentId: string, status: ShipmentStatus) {
  const shipment = await prisma.shipment.findUniqueOrThrow({ where: { id: shipmentId } });
  if (!canTransitionShipment(shipment.status, status)) {
    throw new Error(`${shipment.status} durumundan ${status} durumuna geçilemez.`);
  }

  return prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      status,
      shippedAt: status === "YOLDA" ? new Date() : undefined,
      deliveredAt: status === "TESLIM_EDILDI" ? new Date() : undefined,
    },
  });
}
