import { prisma } from "@/infra/db/client";
import {
  assertOrderTransition,
  stockEffectOnTransition,
  type OrderStatus,
} from "@/domain/order/state-machine";
import { addLedgerEntry } from "@/infra/db/ledger";
import { notifyOrderCreated, notifyOrderStatusChanged } from "@/infra/db/notifications";
import { calculateBalance, canUseOnAccount, shouldPostDeliveryDebt } from "@/domain/ledger";
import { captureMockPayment } from "@/infra/payments/mock-provider";
import { getVariantStockSummary } from "@/infra/db/inventory";
import { releaseOrderStockTx, reserveOrderStockTx } from "@/infra/db/order-stock";
import { compare, fromCases } from "@/domain/weight";
import { createShipment } from "@/infra/db/shipments";
import { matchAndRecordSampleConversions } from "@/infra/db/samples";
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
        include: {
          variant: { include: { product: { select: { name: true, imageUrl: true } } } },
          lotAllocations: {
            where: { releasedAt: null },
            include: { lot: { select: { lotNumber: true } } },
          },
          shipments: {
            where: { status: { not: "IPTAL" } },
            select: { id: true, status: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
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
        include: {
          variant: { include: { product: { select: { name: true, imageUrl: true } } } },
          lotAllocations: {
            where: { releasedAt: null },
            include: { lot: { select: { lotNumber: true } } },
          },
          shipments: {
            where: { status: { not: "IPTAL" } },
            select: { id: true, status: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
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
      select: { pricePerUnitKurus: true, vatRateBasisPoints: true, unitFactor: true },
    }),
  ]);

  if (!dealer.priceListId) {
    return {
      unitPriceKurus: variant.pricePerUnitKurus,
      vatRateBasisPoints: variant.vatRateBasisPoints,
      unitFactor: variant.unitFactor,
    };
  }

  const override = await prisma.priceListItem.findUnique({
    where: { priceListId_variantId: { priceListId: dealer.priceListId, variantId } },
    select: { priceKurus: true },
  });

  return {
    unitPriceKurus: override?.priceKurus ?? variant.pricePerUnitKurus,
    vatRateBasisPoints: variant.vatRateBasisPoints,
    unitFactor: variant.unitFactor,
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
      const { unitPriceKurus, vatRateBasisPoints, unitFactor } = await resolveDealerVariantPrice(
        input.dealerId,
        line.variantId,
      );
      const { shippableKg } = await getVariantStockSummary(line.variantId);
      const requestedKg = fromCases(line.quantity, unitFactor.toString());
      if (compare(requestedKg, shippableKg) > 0) {
        throw new Error("Stok yetersiz");
      }
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

  if (input.paymentMethod === "CARI") {
    // İstemciye asla güvenme: yetki her seferinde sunucuda taze verilerle
    // doğrulanır. Bu kontrol createOrder çağıran HER yol için geçerli
    // (bayi sepeti + panelden manuel sipariş girişi).
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

  // CARI kredi limiti kontrolü createOrder() içinde yapılır (tek yer, her
  // yol için geçerli).
  const totalKurus = cart.lines.reduce((sum, l) => sum + l.unitPriceKurus * l.quantity, 0);

  const paymentLabel =
    input.paymentMethod === "HAVALE"
      ? "Ödeme: Banka havalesi / EFT"
      : input.paymentMethod === "CARI"
        ? "Ödeme: Cari hesap"
        : input.paymentMethod === "KAPIDA_NAKIT"
          ? "Ödeme: Kapıda nakit"
          : input.paymentMethod === "KAPIDA_POS"
            ? "Ödeme: Kapıda kart (POS)"
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
      try {
        await autoFulfillOnlinePaidOrder(order.id);
      } catch (err) {
        // Ödeme zaten alındı; otomatik onay/sevkiyat başarısız olsa da sipariş
        // kaybolmaz, personel elle tamamlar (order-board üzerinden).
        console.error("[auto-fulfill] failed for order", order.id, err);
      }
    }
  }

  return order;
}

/**
 * Online ödeme alınan bir siparişte manuel personel onayını atlar
 * (SUBMITTED → UNDER_REVIEW → CONFIRMED). Stok CONFIRMED'te FEFO ile
 * kilitlenir; sevkiyat aynı lotları kopyalar, ikinci kez düşmez.
 * Satır bazında best-effort: biri başarısız olursa sipariş CONFIRMED'te
 * kalır, kalan satırları personel order-board'dan tamamlar.
 */
async function autoFulfillOnlinePaidOrder(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { lines: { include: { variant: { select: { unitFactor: true } } } } },
  });

  await transitionOrder(orderId, "UNDER_REVIEW", {
    note: "Online ödeme alındı: otomatik inceleme",
  });
  await transitionOrder(orderId, "CONFIRMED", {
    note: "Online ödeme alındı: otomatik onay, personel onayı gerekmedi",
  });

  for (const line of order.lines) {
    try {
      await createShipment({
        dealerId: order.dealerId,
        variantId: line.variantId,
        quantityKg: Number(line.variant.unitFactor) * line.quantity,
        orderId: order.id,
        orderLineId: line.id,
        note: "Online ödeme: otomatik sevkiyat",
      });
    } catch (err) {
      console.error(
        `[auto-fulfill] shipment failed for order ${orderId} line ${line.id}`,
        err,
      );
    }
  }
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
      shipments: { select: { id: true } },
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
    include: {
      dealer: { select: { unvan: true, email: true, paymentMethod: true, creditLimitKurus: true } },
      lines: { include: { variant: { select: { unitFactor: true } } } },
    },
  });
  const result = assertOrderTransition({
    from: order.status,
    to,
    cancelReason: input?.cancelReason,
  });
  if (!result.ok) throw result.error;

  if (to === "CONFIRMED" && order.status !== "CONFIRMED" && order.paymentMethod === "CARI") {
    const exposureKurus = await getDealerCreditExposure(order.dealerId);
    // Bu sipariş zaten açık CARI maruziyetinde; tekrar ekleme.
    const exposureExcludingThis = exposureKurus - order.totalKurus;
    const eligibility = canUseOnAccount({
      dealerPaymentMethod: order.dealer.paymentMethod,
      creditLimitKurus: order.dealer.creditLimitKurus,
      exposureKurus: exposureExcludingThis,
      orderTotalKurus: order.totalKurus,
    });
    if (!eligibility.ok) throw new Error(eligibility.reason);
  }

  const stockEffect = stockEffectOnTransition(order.status, to);

  await prisma.$transaction(
    async (tx) => {
      if (stockEffect === "reserve") {
        await reserveOrderStockTx(tx, order);
      }
      if (stockEffect === "release") {
        await releaseOrderStockTx(tx, orderId);
      }
      await tx.order.update({ where: { id: orderId }, data: { status: to } });
      await tx.orderEvent.create({
        data: {
          orderId,
          status: to,
          note: to === "CANCELLED" ? result.cancelReason : input?.note,
        },
      });
    },
    // FEFO kilit + lot sorguları Neon'da bazen bağlantı gecikmesi yaşıyor;
    // varsayılan 2s/5s sınırı bu yüzden gereksiz yere transitionOrder'ı
    // başarısız kılabiliyor (özellikle art arda iki geçişte).
    { maxWait: 10_000, timeout: 15_000 },
  );

  if (
    to === "DELIVERED" &&
    order.status !== "DELIVERED" &&
    shouldPostDeliveryDebt({ paymentMethod: order.paymentMethod, paidAt: order.paidAt })
  ) {
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

  if (to === "CONFIRMED" && order.status !== "CONFIRMED") {
    await matchAndRecordSampleConversions({
      dealerId: order.dealerId,
      orderId: order.id,
      orderCreatedAt: order.createdAt,
      variantIds: order.lines.map((l) => l.variantId),
    });
  }

  return prisma.order.findUniqueOrThrow({ where: { id: orderId } });
}

/**
 * Havale/EFT (veya ödeme yöntemi belirtilmemiş) bir siparişi "ödendi" olarak
 * işaretler. Cari bir ön-ödeme (ODEME) kaydı açar; teslimatta oluşan BORC
 * kaydıyla netleşir. CARİ siparişlerde ön-ödeme kavramı yok (vade/teslimat
 * sonrası faturalanır).
 */
export async function confirmOrderPayment(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  if (order.paymentMethod === "CARI") {
    throw new Error("Cari hesap siparişleri için ödeme onayı gerekmez");
  }
  if (order.paymentMethod === "KAPIDA_NAKIT" || order.paymentMethod === "KAPIDA_POS") {
    throw new Error("Kapıda ödeme tahsilatı teslimatta yapılır");
  }
  if (order.paidAt) {
    throw new Error("Bu sipariş zaten ödendi olarak işaretli");
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { paidAt: new Date() } });
    await tx.ledgerEntry.create({
      data: {
        dealerId: order.dealerId,
        type: "ODEME",
        amountKurus: order.totalKurus,
        description: `Sipariş #${order.id.slice(-6)} ödemesi alındı`,
      },
    });
  });

  return prisma.order.findUniqueOrThrow({ where: { id: orderId } });
}

/**
 * Kapıda nakit / POS tahsilatı. POS için `paymentSlipUrl` zorunlu.
 * Teslimatta oluşan BORC ile netleşecek ODEME kaydı yazar.
 */
export async function confirmCodCollection(
  orderId: string,
  input?: { paymentSlipUrl?: string | null },
) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  if (order.paymentMethod !== "KAPIDA_NAKIT" && order.paymentMethod !== "KAPIDA_POS") {
    throw new Error("Bu sipariş kapıda ödeme değil");
  }
  if (order.paidAt) {
    throw new Error("Bu sipariş zaten tahsil edildi");
  }
  const slip = input?.paymentSlipUrl?.trim() || null;
  if (order.paymentMethod === "KAPIDA_POS" && !slip) {
    throw new Error("Kapıda kart (POS) için fiş görseli zorunlu");
  }

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        paidAt: now,
        codCollectedAt: now,
        ...(slip
          ? { paymentSlipUrl: slip, paymentSlipUploadedAt: now }
          : {}),
      },
    });
    await tx.ledgerEntry.create({
      data: {
        dealerId: order.dealerId,
        type: "ODEME",
        amountKurus: order.totalKurus,
        description:
          order.paymentMethod === "KAPIDA_POS"
            ? `Sipariş #${order.id.slice(-6)} kapıda POS tahsilatı`
            : `Sipariş #${order.id.slice(-6)} kapıda nakit tahsilatı`,
      },
    });
  });

  return prisma.order.findUniqueOrThrow({ where: { id: orderId } });
}

/** Attach / replace POS slip without collecting (staff upload before collect). */
export async function setOrderPaymentSlip(orderId: string, paymentSlipUrl: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  if (order.paymentMethod !== "KAPIDA_POS" && order.paymentMethod !== "KAPIDA_NAKIT") {
    throw new Error("Fiş yalnızca kapıda ödeme siparişlerine eklenebilir");
  }
  const url = paymentSlipUrl.trim();
  if (!url) throw new Error("Fiş URL gerekli");
  return prisma.order.update({
    where: { id: orderId },
    data: { paymentSlipUrl: url, paymentSlipUploadedAt: new Date() },
  });
}
