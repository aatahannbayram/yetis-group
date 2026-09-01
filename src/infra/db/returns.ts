import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/infra/db/client";
import {
  assertReturnTransition,
  returnStockEffectOnTransition,
  type ReturnRequestStatus,
} from "@/domain/return/state-machine";
import {
  assertReturnQtyWithinInvoice,
  warehouseAcceptDiffersFromApproved,
} from "@/domain/return/quantities";
import { resolveShippingCostResponsibility } from "@/domain/return/shipping-cost";
import { resolveCreditableQty } from "@/domain/return/credit-eligibility";
import { formatReturnRequestNumber } from "@/domain/return/totals";
import { computeInvoiceTotals } from "@/domain/invoicing/totals";
import type { ReturnReason } from "@/domain/return/reasons";
import { isPhotoRequired } from "@/domain/return/reasons";
import {
  notifyReturnRequestCreated,
  notifyReturnRequestStatusChanged,
} from "@/infra/db/notifications";

const SINGLETON_ID = "singleton";

// ---- Settings (singleton row, mirrors payment-settings.ts / samples.ts) ----

async function loadReturnSettings() {
  const existing = await prisma.returnSettings.findUnique({ where: { id: SINGLETON_ID } });
  if (existing) return existing;
  return prisma.returnSettings.create({ data: { id: SINGLETON_ID } });
}

export const getReturnSettings = unstable_cache(loadReturnSettings, ["return-settings"], {
  revalidate: 300,
  tags: ["return-settings"],
});

export async function updateReturnSettings(data: {
  returnWindowDays: number;
  returnRatioAlertBps: number;
}) {
  const row = await prisma.returnSettings.upsert({
    where: { id: SINGLETON_ID },
    update: data,
    create: { id: SINGLETON_ID, ...data },
  });
  revalidateTag("return-settings", "max");
  return row;
}

// ---- Numbering ----

async function nextReturnRequestNumber(year: number): Promise<string> {
  const prefix = `IAD-${year}-`;
  const latest = await prisma.returnRequest.findFirst({
    where: { returnNo: { startsWith: prefix } },
    orderBy: { returnNo: "desc" },
    select: { returnNo: true },
  });
  let seq = 1;
  if (latest?.returnNo) {
    const raw = latest.returnNo.slice(prefix.length);
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n)) seq = n + 1;
  }
  return formatReturnRequestNumber(year, seq);
}

// ---- Helpers ----

/** Order lines eligible for return, with remaining returnable qty (faturadaki adet − daha önce iade edilmiş). */
export async function getReturnableOrderLines(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      lines: { include: { variant: { select: { id: true, sku: true, packSize: true, product: { select: { name: true } } } } } },
    },
  });

  const priorItems = await prisma.returnRequestItem.findMany({
    where: {
      orderLineId: { in: order.lines.map((l) => l.id) },
      returnRequest: { status: { notIn: ["REDDEDILDI", "IPTAL"] } },
    },
    select: { orderLineId: true, requestedQty: true },
  });
  const returnedByLine = new Map<string, number>();
  for (const item of priorItems) {
    returnedByLine.set(item.orderLineId, (returnedByLine.get(item.orderLineId) ?? 0) + item.requestedQty);
  }

  return order.lines.map((line) => ({
    orderLineId: line.id,
    variantId: line.variantId,
    productName: line.variant.product.name,
    sku: line.variant.sku,
    packSize: line.variant.packSize,
    orderedQty: line.quantity,
    previouslyReturnedQty: returnedByLine.get(line.id) ?? 0,
    remainingQty: line.quantity - (returnedByLine.get(line.id) ?? 0),
    unitPriceKurus: line.unitPriceKurus,
    vatRateBasisPoints: line.vatRateBasisPoints,
  }));
}

// ---- Create ----

export type CreateReturnRequestInput = {
  dealerId: string;
  orderId: string;
  createdByUserId: string;
  createdByRole: "BAYI" | "STAFF";
  items: {
    orderLineId: string;
    quantity: number;
    reason: ReturnReason;
    lotNumber?: string;
    expirationDate?: Date;
    photoUrls?: string[];
    note?: string;
  }[];
};

export async function createReturnRequest(input: CreateReturnRequestInput) {
  if (input.items.length === 0) throw new Error("En az bir kalem ekleyin");

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: input.orderId },
    include: { lines: true },
  });
  if (order.dealerId !== input.dealerId) throw new Error("Sipariş bu bayiye ait değil");
  if (order.status !== "DELIVERED") {
    throw new Error("Yalnızca teslim edilmiş siparişlerden iade açılabilir");
  }

  const linesById = new Map(order.lines.map((l) => [l.id, l]));
  const returnable = await getReturnableOrderLines(input.orderId);
  const returnableById = new Map(returnable.map((r) => [r.orderLineId, r]));

  for (const item of input.items) {
    const orderLine = linesById.get(item.orderLineId);
    if (!orderLine) throw new Error("Sipariş kalemi bulunamadı");
    const remaining = returnableById.get(item.orderLineId)?.remainingQty ?? 0;
    assertReturnQtyWithinInvoice({
      orderLineQty: orderLine.quantity,
      previouslyReturnedQty: orderLine.quantity - remaining,
      requestedQty: item.quantity,
    });
    if (isPhotoRequired(item.reason) && (!item.photoUrls || item.photoUrls.length === 0)) {
      throw new Error(`"${item.reason}" nedeni için en az bir fotoğraf gerekli`);
    }
  }

  const now = new Date();
  const returnNo = await nextReturnRequestNumber(now.getFullYear());
  const defaultShippingResponsibility = resolveShippingCostResponsibility(input.items[0]!.reason);

  const request = await prisma.returnRequest.create({
    data: {
      returnNo,
      dealerId: input.dealerId,
      orderId: input.orderId,
      createdByUserId: input.createdByUserId,
      createdByRole: input.createdByRole,
      shippingCostResponsibility: defaultShippingResponsibility,
      items: {
        create: input.items.map((item) => {
          const orderLine = linesById.get(item.orderLineId)!;
          return {
            orderLineId: item.orderLineId,
            variantId: orderLine.variantId,
            requestedQty: item.quantity,
            reason: item.reason,
            lotNumber: item.lotNumber ?? null,
            expirationDate: item.expirationDate ?? null,
            photoUrls: item.photoUrls ?? [],
            note: item.note?.trim() || null,
            unitPriceKurus: orderLine.unitPriceKurus,
            vatRateBasisPoints: orderLine.vatRateBasisPoints,
          };
        }),
      },
      events: { create: [{ status: "OLUSTURULDU" }] },
    },
    include: { items: true, dealer: { select: { unvan: true, email: true } } },
  });

  await notifyReturnRequestCreated({
    returnNo: request.returnNo,
    dealerId: request.dealerId,
    dealerName: request.dealer.unvan,
    dealerEmail: request.dealer.email,
    itemCount: request.items.length,
  });

  return request;
}

// ---- Read ----

export async function listReturnRequests(filters?: {
  dealerId?: string;
  status?: ReturnRequestStatus;
}) {
  return prisma.returnRequest.findMany({
    where: { dealerId: filters?.dealerId, status: filters?.status },
    include: {
      dealer: { select: { id: true, unvan: true } },
      items: { include: { variant: { select: { sku: true, product: { select: { name: true } } } } } },
    },
    orderBy: { requestedAt: "desc" },
  });
}

export async function getReturnRequest(id: string) {
  return prisma.returnRequest.findUniqueOrThrow({
    where: { id },
    include: {
      dealer: { select: { id: true, unvan: true, vergiNo: true, vergiDairesi: true, addressLine: true, email: true, eFaturaMukellefi: true } },
      order: { select: { id: true, createdAt: true } },
      createdByUser: { select: { id: true, name: true } },
      items: {
        include: {
          variant: { select: { sku: true, packSize: true, product: { select: { name: true } } } },
          orderLine: { select: { quantity: true } },
        },
      },
      events: { orderBy: { createdAt: "asc" } },
      invoice: { include: { lines: true } },
    },
  });
}

export async function listReturnRequestsForDealer(dealerId: string) {
  return prisma.returnRequest.findMany({
    where: { dealerId },
    include: {
      items: { include: { variant: { select: { sku: true, product: { select: { name: true } } } } } },
    },
    orderBy: { requestedAt: "desc" },
  });
}

// ---- Transitions ----

export type TransitionReturnRequestInput = {
  actorUserId?: string;
  rejectReason?: string;
  /** →ONAYLANDI: per-item approved qty (supports partial approval). */
  approvedQtyByItem?: Record<string, number>;
  /** →URUN_TESLIM_ALINDI: per-item warehouse-accepted split. */
  acceptedByItem?: Record<string, { goodQty: number; damagedQty: number }>;
  shippingCostResponsibility?: "YETIS" | "BAYI";
  shippingCostKurus?: number;
  cashRefundNeeded?: boolean;
  cashRefundNote?: string;
};

export type TransitionReturnRequestResult = {
  request: Awaited<ReturnType<typeof getReturnRequest>>;
  warnings: string[];
};

export async function transitionReturnRequest(
  id: string,
  to: ReturnRequestStatus,
  input?: TransitionReturnRequestInput,
): Promise<TransitionReturnRequestResult> {
  const request = await prisma.returnRequest.findUniqueOrThrow({
    where: { id },
    include: { items: true, dealer: { select: { unvan: true, email: true } } },
  });

  const result = assertReturnTransition({ from: request.status, to, rejectReason: input?.rejectReason });
  if (!result.ok) throw result.error;

  const fromStatus = request.status;
  const stockEffect = returnStockEffectOnTransition(fromStatus, to);
  const warnings: string[] = [];

  await prisma.$transaction(
    async (tx) => {
      if (to === "ONAYLANDI" && input?.approvedQtyByItem) {
        for (const item of request.items) {
          const approvedQty = input.approvedQtyByItem[item.id];
          if (approvedQty == null) continue;
          if (approvedQty > item.requestedQty) {
            throw new Error(`Onaylanan adet talep edilenden fazla olamaz (kalem ${item.id})`);
          }
          await tx.returnRequestItem.update({ where: { id: item.id }, data: { approvedQty } });
        }
      }

      if (to === "URUN_TESLIM_ALINDI" && input?.acceptedByItem) {
        for (const item of request.items) {
          const accepted = input.acceptedByItem[item.id];
          if (!accepted) continue;
          await tx.returnRequestItem.update({
            where: { id: item.id },
            data: { acceptedGoodQty: accepted.goodQty, acceptedDamagedQty: accepted.damagedQty },
          });
          if (
            item.approvedQty != null &&
            warehouseAcceptDiffersFromApproved({
              approvedQty: item.approvedQty,
              acceptedGoodQty: accepted.goodQty,
              acceptedDamagedQty: accepted.damagedQty,
            })
          ) {
            warnings.push(
              `Kalem ${item.id}: depo kabul (${accepted.goodQty + accepted.damagedQty}) onaylanan adetten (${item.approvedQty}) farklı.`,
            );
          }
        }
      }

      if (stockEffect === "split") {
        await splitReturnStockTx(tx, id);
      }

      await tx.returnRequest.update({
        where: { id },
        data: {
          status: to,
          ...(to === "ONAYLANDI" ? { approvedAt: new Date() } : {}),
          ...(to === "URUN_TESLIM_ALINDI" ? { acceptedAt: new Date() } : {}),
          ...(to === "KAPANDI" ? { closedAt: new Date() } : {}),
          ...(to === "REDDEDILDI" ? { rejectReason: result.rejectReason } : {}),
          ...(input?.shippingCostResponsibility !== undefined
            ? { shippingCostResponsibility: input.shippingCostResponsibility }
            : {}),
          ...(input?.shippingCostKurus !== undefined ? { shippingCostKurus: input.shippingCostKurus } : {}),
          ...(input?.cashRefundNeeded !== undefined ? { cashRefundNeeded: input.cashRefundNeeded } : {}),
          ...(input?.cashRefundNote !== undefined ? { cashRefundNote: input.cashRefundNote } : {}),
        },
      });
      await tx.returnRequestEvent.create({
        data: {
          returnRequestId: id,
          status: to,
          note: to === "REDDEDILDI" ? result.rejectReason : warnings.join(" ") || undefined,
          actorUserId: input?.actorUserId,
        },
      });

      if (to === "FATURALANDI") {
        await issueReturnInvoiceTx(tx, id);
      }
    },
    { maxWait: 10_000, timeout: 15_000 },
  );

  if (fromStatus !== to) {
    await notifyReturnRequestStatusChanged({
      returnNo: request.returnNo,
      dealerId: request.dealerId,
      dealerName: request.dealer.unvan,
      dealerEmail: request.dealer.email,
      status: to,
    });
  }

  return { request: await getReturnRequest(id), warnings };
}

type DbTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Sağlam adet → GIRIS (satılabilir stoğa geri girer), hasarlı/imha adet →
 * FIRE (asla satılabilir stoğa girmez). Lot resolution: matches the item's
 * declared lotNumber if given, otherwise creates a placeholder "İade" lot —
 * dealers/staff don't always know the exact original lot at request time.
 */
async function splitReturnStockTx(tx: DbTx, returnRequestId: string) {
  const items = await tx.returnRequestItem.findMany({
    where: { returnRequestId },
    include: { variant: { select: { unitFactor: true } } },
  });

  const request = await tx.returnRequest.findUniqueOrThrow({
    where: { id: returnRequestId },
    select: { returnNo: true },
  });

  for (const item of items) {
    const goodQty = item.acceptedGoodQty ?? 0;
    const damagedQty = item.acceptedDamagedQty ?? 0;
    if (goodQty <= 0 && damagedQty <= 0) continue;

    let lot = item.lotNumber
      ? await tx.lot.findUnique({ where: { variantId_lotNumber: { variantId: item.variantId, lotNumber: item.lotNumber } } })
      : null;
    if (!lot) {
      const lotNumber = item.lotNumber || `IADE-${request.returnNo}`;
      lot = await tx.lot.upsert({
        where: { variantId_lotNumber: { variantId: item.variantId, lotNumber } },
        update: {},
        create: {
          variantId: item.variantId,
          lotNumber,
          expirationDate: item.expirationDate ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const unitFactor = item.variant.unitFactor.toString();
    if (goodQty > 0) {
      const qtyKg = (Number(unitFactor) * goodQty).toString();
      const movement = await tx.stockMovement.create({
        data: { lotId: lot.id, type: "GIRIS", quantityKg: qtyKg, note: `İade: ${request.returnNo} (sağlam)` },
      });
      await tx.returnRequestItem.update({ where: { id: item.id }, data: { goodStockMovementId: movement.id } });
    }
    if (damagedQty > 0) {
      const qtyKg = (Number(unitFactor) * damagedQty).toString();
      const movement = await tx.stockMovement.create({
        data: { lotId: lot.id, type: "FIRE", quantityKg: qtyKg, note: `İade: ${request.returnNo} (hasarlı/imha)` },
      });
      await tx.returnRequestItem.update({ where: { id: item.id }, data: { damagedStockMovementId: movement.id } });
    }
  }
}

/**
 * Internal record only — mirrors ProformaInvoice's shape, NOT a real
 * e-Fatura/GİB submission. Uses ORIGINAL OrderLine price/VAT (snapshotted
 * onto ReturnRequestItem at request time), and only the creditable quantity
 * per domain/return/credit-eligibility.ts (depends on return reason).
 */
async function issueReturnInvoiceTx(tx: DbTx, returnRequestId: string) {
  const request = await tx.returnRequest.findUniqueOrThrow({
    where: { id: returnRequestId },
    include: {
      dealer: { select: { unvan: true, vergiNo: true, vergiDairesi: true, eFaturaMukellefi: true } },
      items: { include: { variant: { select: { sku: true, product: { select: { name: true } } } } } },
    },
  });

  const creditableLines = request.items
    .map((item) => {
      const qty = resolveCreditableQty({
        reason: item.reason,
        acceptedGoodQty: item.acceptedGoodQty ?? 0,
        acceptedDamagedQty: item.acceptedDamagedQty ?? 0,
      });
      if (qty <= 0) return null;
      const lineTotalKurus = item.unitPriceKurus * qty;
      return {
        description: `${item.variant.product.name} (${item.variant.sku})`,
        quantity: qty,
        unitPriceKurus: item.unitPriceKurus,
        vatRateBasisPoints: item.vatRateBasisPoints,
        lineTotalKurus,
      };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  if (creditableLines.length === 0) {
    throw new Error("Kredilendirilebilir kalem yok; fatura kesilemez");
  }

  const totals = computeInvoiceTotals(creditableLines);

  await tx.returnInvoice.create({
    data: {
      returnRequestId,
      number: request.returnNo,
      buyerUnvan: request.dealer.unvan,
      buyerVergiNo: request.dealer.vergiNo,
      buyerVergiDairesi: request.dealer.vergiDairesi,
      buyerEFaturaMukellefi: request.dealer.eFaturaMukellefi,
      sellerName: "Yetiş Grup",
      subtotalKurus: totals.subtotalKurus,
      vatKurus: totals.vatKurus,
      totalKurus: totals.totalKurus,
      lines: {
        create: creditableLines.map((l, i) => ({
          description: l.description,
          quantity: l.quantity,
          unitPriceKurus: l.unitPriceKurus,
          vatRateBasisPoints: l.vatRateBasisPoints,
          lineTotalKurus: l.lineTotalKurus,
          sortOrder: i,
        })),
      },
    },
  });

  await tx.ledgerEntry.create({
    data: {
      dealerId: request.dealerId,
      type: "ODEME",
      amountKurus: totals.totalKurus,
      description: `İade: ${request.returnNo}`,
      returnRequestId,
    },
  });

  if (request.shippingCostResponsibility === "BAYI" && request.shippingCostKurus) {
    await tx.ledgerEntry.create({
      data: {
        dealerId: request.dealerId,
        type: "BORC",
        amountKurus: request.shippingCostKurus,
        description: `İade nakliye masrafı: ${request.returnNo}`,
        returnRequestId,
      },
    });
  }

  await tx.returnRequest.update({ where: { id: returnRequestId }, data: { invoicedAt: new Date() } });
}

// ---- Reporting ----

export async function getReturnReasonReport() {
  const rows = await prisma.returnRequestItem.groupBy({
    by: ["reason"],
    _sum: { requestedQty: true },
    _count: { id: true },
  });
  return rows.map((r) => ({ reason: r.reason, count: r._count.id, totalQty: r._sum.requestedQty ?? 0 }));
}

/** İade tutarı / satış tutarı % per dealer — eşik aşanlar flag'lenir. */
export async function getDealerReturnRatioReport() {
  const settings = await getReturnSettings();

  const [sales, returned] = await Promise.all([
    prisma.order.groupBy({ by: ["dealerId"], where: { status: "DELIVERED" }, _sum: { totalKurus: true } }),
    prisma.returnInvoice.findMany({
      select: { totalKurus: true, returnRequest: { select: { dealerId: true } } },
    }),
  ]);

  const salesByDealer = new Map(sales.map((s) => [s.dealerId, s._sum.totalKurus ?? 0]));
  const returnedByDealer = new Map<string, number>();
  for (const inv of returned) {
    const dealerId = inv.returnRequest.dealerId;
    returnedByDealer.set(dealerId, (returnedByDealer.get(dealerId) ?? 0) + inv.totalKurus);
  }

  const dealerIds = new Set([...salesByDealer.keys(), ...returnedByDealer.keys()]);
  const dealers = await prisma.dealer.findMany({
    where: { id: { in: [...dealerIds] } },
    select: { id: true, unvan: true },
  });
  const nameById = new Map(dealers.map((d) => [d.id, d.unvan]));

  return [...dealerIds]
    .map((dealerId) => {
      const salesKurus = salesByDealer.get(dealerId) ?? 0;
      const returnedKurus = returnedByDealer.get(dealerId) ?? 0;
      const ratioBps = salesKurus > 0 ? Math.round((returnedKurus / salesKurus) * 10000) : 0;
      return {
        dealerId,
        dealerName: nameById.get(dealerId) ?? dealerId,
        salesKurus,
        returnedKurus,
        ratioBps,
        flagged: ratioBps >= settings.returnRatioAlertBps,
      };
    })
    .sort((a, b) => b.ratioBps - a.ratioBps);
}

export async function getProductReturnRatioReport() {
  const rows = await prisma.returnRequestItem.groupBy({
    by: ["variantId"],
    where: { returnRequest: { status: { notIn: ["REDDEDILDI", "IPTAL"] } } },
    _sum: { requestedQty: true },
    _count: { id: true },
  });
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: rows.map((r) => r.variantId) } },
    select: { id: true, sku: true, product: { select: { name: true } } },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));
  return rows
    .map((r) => ({
      variantId: r.variantId,
      productName: byId.get(r.variantId)?.product.name ?? r.variantId,
      sku: byId.get(r.variantId)?.sku ?? "",
      returnCount: r._count.id,
      totalQty: r._sum.requestedQty ?? 0,
    }))
    .sort((a, b) => b.totalQty - a.totalQty);
}

/** Lot/parti bazlı iade takibi — bir partide toplu problem varsa görülür. */
export async function getLotReturnReport() {
  const rows = await prisma.returnRequestItem.groupBy({
    by: ["lotNumber"],
    where: { lotNumber: { not: null } },
    _sum: { requestedQty: true },
    _count: { id: true },
  });
  return rows
    .map((r) => ({ lotNumber: r.lotNumber!, returnCount: r._count.id, totalQty: r._sum.requestedQty ?? 0 }))
    .sort((a, b) => b.totalQty - a.totalQty);
}
