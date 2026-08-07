import { prisma } from "@/infra/db/client";
import { assertOrderTransition, type OrderStatus } from "@/domain/order/state-machine";
import { addLedgerEntry } from "@/infra/db/ledger";
import { notifyOrderCreated, notifyOrderStatusChanged } from "@/infra/db/notifications";

export async function listOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      dealer: { select: { id: true, unvan: true, dealerType: true, email: true } },
      lines: {
        include: { variant: { include: { product: { select: { name: true, imageUrl: true } } } } },
      },
      events: { orderBy: { createdAt: "asc" } },
      shipments: { include: { allocations: { include: { lot: { select: { lotNumber: true } } } } } },
      proformas: {
        where: { status: "ISSUED" },
        orderBy: { version: "desc" },
        take: 1,
        select: {
          id: true,
          number: true,
          status: true,
          issuedAt: true,
          sentAt: true,
          version: true,
          buyerEmail: true,
          totalKurus: true,
        },
      },
    },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      dealer: { select: { id: true, unvan: true, dealerType: true } },
      lines: {
        include: { variant: { include: { product: { select: { name: true, imageUrl: true } } } } },
      },
      events: { orderBy: { createdAt: "asc" } },
      shipments: { include: { allocations: { include: { lot: { select: { lotNumber: true } } } } } },
    },
  });
}

async function resolveDealerVariantPrice(dealerId: string, variantId: string) {
  const [dealer, variant] = await Promise.all([
    prisma.dealer.findUniqueOrThrow({ where: { id: dealerId }, select: { priceListId: true } }),
    prisma.productVariant.findUniqueOrThrow({
      where: { id: variantId },
      select: { pricePerUnitKurus: true, vatRateBasisPoints: true },
    }),
  ]);

  if (!dealer.priceListId) {
    return { unitPriceKurus: variant.pricePerUnitKurus, vatRateBasisPoints: variant.vatRateBasisPoints };
  }

  const override = await prisma.priceListItem.findUnique({
    where: { priceListId_variantId: { priceListId: dealer.priceListId, variantId } },
    select: { priceKurus: true },
  });

  return {
    unitPriceKurus: override?.priceKurus ?? variant.pricePerUnitKurus,
    vatRateBasisPoints: variant.vatRateBasisPoints,
  };
}

export async function createOrder(input: {
  dealerId: string;
  lines: { variantId: string; quantity: number }[];
  note?: string;
}) {
  if (input.lines.length === 0) throw new Error("En az bir ürün satırı gerekli");
  if (input.lines.some((l) => !Number.isInteger(l.quantity) || l.quantity <= 0)) {
    throw new Error("Adet pozitif tam sayı olmalı");
  }

  const lineData = await Promise.all(
    input.lines.map(async (line) => {
      const { unitPriceKurus, vatRateBasisPoints } = await resolveDealerVariantPrice(
        input.dealerId,
        line.variantId,
      );
      const lineTotalKurus = unitPriceKurus * line.quantity;
      return {
        variantId: line.variantId,
        quantity: line.quantity,
        unitPriceKurus,
        vatRateBasisPoints,
        lineTotalKurus,
      };
    }),
  );

  const totalKurus = lineData.reduce((sum, l) => sum + l.lineTotalKurus, 0);

  const order = await prisma.order.create({
    data: {
      dealerId: input.dealerId,
      totalKurus,
      note: input.note,
      status: "SUBMITTED",
      lines: { create: lineData },
      events: { create: { status: "SUBMITTED", note: "Sipariş oluşturuldu" } },
    },
    include: { dealer: { select: { unvan: true, email: true } } },
  });

  try {
    const { issueProformaForOrder } = await import("@/infra/db/proforma");
    await issueProformaForOrder(order.id, { sendEmail: true });
  } catch (err) {
    console.error("[proforma] auto-issue failed for order", order.id, err);
  }

  await notifyOrderCreated({
    orderId: order.id,
    dealerId: order.dealerId,
    dealerName: order.dealer.unvan,
    dealerEmail: order.dealer.email,
    totalKurus: order.totalKurus,
  });

  return order;
}

/**
 * Statü geçişi + değişmez olay kaydı. Teslim edildiğinde cari borç kaydı
 * otomatik açılır (siparişten cariye gerçek entegrasyon).
 */
export async function transitionOrder(
  orderId: string,
  to: OrderStatus,
  input?: { note?: string; cancelReason?: string },
) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { dealer: { select: { unvan: true, email: true } } },
  });
  const result = assertOrderTransition({
    from: order.status,
    to,
    cancelReason: input?.cancelReason,
  });
  if (!result.ok) throw result.error;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: to } });
    await tx.orderEvent.create({
      data: {
        orderId,
        status: to,
        note: to === "CANCELLED" ? result.cancelReason : input?.note,
      },
    });
  });

  if (to === "DELIVERED") {
    await addLedgerEntry({
      dealerId: order.dealerId,
      type: "BORC",
      amountKurus: order.totalKurus,
      description: `Sipariş #${order.id.slice(-6)} teslim edildi`,
    });
  }

  if (order.status !== to) {
    await notifyOrderStatusChanged({
      orderId: order.id,
      dealerId: order.dealerId,
      dealerName: order.dealer.unvan,
      dealerEmail: order.dealer.email,
      status: to,
    });
  }

  return prisma.order.findUniqueOrThrow({ where: { id: orderId } });
}
