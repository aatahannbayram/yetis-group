import { prisma } from "@/infra/db/client";
import { getLotsForVariant } from "@/infra/db/inventory";
import { suggestFefoShipment } from "@/domain/inventory/fefo";
import { canTransitionShipment, type ShipmentStatus } from "@/domain/shipment";
import { kg } from "@/domain/weight";

export async function listShippableVariants() {
  const variants = await prisma.productVariant.findMany({
    where: { isActive: true },
    orderBy: { product: { name: "asc" } },
    include: { product: { select: { name: true } } },
  });
  return variants.map((v) => ({
    id: v.id,
    label: `${v.product.name} · ${v.packSize ?? v.packagingType}`,
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

export async function createShipment(input: {
  dealerId: string;
  variantId: string;
  quantityKg: number;
  note?: string;
  orderId?: string;
}) {
  if (input.quantityKg <= 0) throw new Error("Miktar sıfırdan büyük olmalı");

  const lots = await getLotsForVariant(input.variantId);
  const allocations = suggestFefoShipment(
    lots.map((l) => ({ id: l.id, lotNumber: l.lotNumber, expirationDate: l.expirationDate, availableKg: l.availableKg })),
    kg(input.quantityKg),
  );

  return prisma.$transaction(async (tx) => {
    const shipment = await tx.shipment.create({
      data: {
        dealerId: input.dealerId,
        variantId: input.variantId,
        orderId: input.orderId,
        quantityKg: input.quantityKg,
        note: input.note,
      },
    });

    for (const a of allocations) {
      await tx.shipmentLotAllocation.create({
        data: { shipmentId: shipment.id, lotId: a.lotId, quantityKg: a.quantityKg.toString() },
      });
      await tx.stockMovement.create({
        data: {
          lotId: a.lotId,
          type: "CIKIS",
          quantityKg: a.quantityKg.toString(),
          note: `Sevkiyat #${shipment.id.slice(-6)}`,
        },
      });
    }

    return shipment;
  });
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
