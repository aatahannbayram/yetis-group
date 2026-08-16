import { prisma } from "@/infra/db/client";
import { assertOrderTransition, type OrderStatus } from "@/domain/order/state-machine";
import { addLedgerEntry } from "@/infra/db/ledger";
import { notifyOrderCreated, notifyOrderStatusChanged } from "@/infra/db/notifications";
import { calculateBalance, canUseOnAccount } from "@/domain/ledger";
import { captureMockPayment } from "@/infra/payments/mock-provider";
import type { OrderPaymentMethod } from "@/generated/prisma";

const OPEN_ORDER_STATUSES: OrderStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "CONFIRMED",
  "PREPARING",
  "SHIPPED",
];

/**
 * Bayinin cari hesap için toplam açık borç maruziyeti: teslim edilmiş
 * siparişlerin ledger bakiyesi + henüz teslim edilmemiş CARI siparişlerin
 * toplamı (teslim edilenler zaten ledger'da olduğu için tekrar sayılmaz).
 */
export async function getDealerCreditExposure(dealerId: string): Promise<number> {
  const [entries, openCariOrders] = await Promise.all([
    prisma.ledgerEntry.findMany({ where: { dealerId }, select: { type: true, amountKurus: true } }),
    prisma.order.findMany({
      where: { dealerId, paymentMethod: "CARI", status: { in: OPEN_ORDER_STATUSES } },
      select: { totalKurus: true },
    }),
  ]);
  const openCariTotal = openCariOrders.reduce((sum, o) => sum + o.totalKurus, 0);
  return calculateBalance(entries) + openCariTotal;
}

export async function listOrders(filter?: { statusIn?: OrderStatus[] }) {
  return prisma.order.findMany({
    where: filter?.statusIn ? { status: { in: filter.statusIn } } : undefined,
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
  paymentMethod?: OrderPaymentMethod;
  paidAt?: Date;
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
      paymentMethod: input.paymentMethod,
      paidAt: input.paidAt,
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

/** Converts a server cart into a SUBMITTED order and clears cart lines. */
export async function createOrderFromCart(input: {
  cartId: string;
  dealerId: string;
  note?: string;
  paymentMethod: OrderPaymentMethod;
}) {
  const cart = await prisma.cart.findUnique({
    where: { id: input.cartId },
    include: { lines: true },
  });
  if (!cart) throw new Error("Sepet bulunamadı");
  if (cart.dealerId && cart.dealerId !== input.dealerId) {
    throw new Error("Sepet bu bayiye ait değil");
  }
  if (cart.lines.length === 0) throw new Error("Sepet boş");

  const totalKurus = cart.lines.reduce((sum, l) => sum + l.unitPriceKurus * l.quantity, 0);

  if (input.paymentMethod === "CARI") {
    // İstemciye asla güvenme: yetki her seferinde sunucuda taze verilerle doğrulanır.
    const dealer = await prisma.dealer.findUniqueOrThrow({
      where: { id: input.dealerId },
      select: { paymentMethod: true, creditLimitKurus: true },
    });
    const exposureKurus = await getDealerCreditExposure(input.dealerId);
    const eligibility = canUseOnAccount({
      dealerPaymentMethod: dealer.paymentMethod,
      creditLimitKurus: dealer.creditLimitKurus,
      exposureKurus,
      orderTotalKurus: totalKurus,
    });
    if (!eligibility.ok) throw new Error(eligibility.reason);
  }

  const paymentLabel =
    input.paymentMethod === "HAVALE"
      ? "Ödeme: Banka havalesi / EFT"
      : input.paymentMethod === "CARI"
        ? "Ödeme: Cari hesap"
        : "Ödeme: Online (kart)";
  const note = [paymentLabel, input.note?.trim()].filter(Boolean).join("\n") || undefined;

  const order = await createOrder({
    dealerId: input.dealerId,
    paymentMethod: input.paymentMethod,
    lines: cart.lines.map((line) => ({
      variantId: line.variantId,
      quantity: line.quantity,
    })),
    note,
  });

  await prisma.cartLine.deleteMany({ where: { cartId: cart.id } });

  if (input.paymentMethod === "ONLINE") {
    const capture = await captureMockPayment({ orderId: order.id, amountKurus: totalKurus });
    if (capture.ok) {
      await prisma.order.update({ where: { id: order.id }, data: { paidAt: new Date() } });
    }
  }

  return order;
}

export async function listOrdersForDealer(dealerId: string) {
  return prisma.order.findMany({
    where: { dealerId },
    orderBy: { createdAt: "desc" },
    include: {
      lines: {
        include: {
          variant: {
            include: { product: { select: { name: true, imageUrl: true } } },
          },
        },
      },
      events: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
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
