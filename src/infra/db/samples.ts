import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/infra/db/client";
import { lockLotRows, availableKgFromMovements, type DbTx } from "@/infra/db/inventory";
import { allocateOrderLinesFefo } from "@/domain/inventory/reservation";
import type { LotSummary } from "@/domain/inventory/fefo";
import { fromCases } from "@/domain/weight";
import {
  assertSampleTransition,
  sampleStockEffectOnTransition,
  type SampleRequestStatus,
} from "@/domain/sample/state-machine";
import {
  evaluateSampleRequestAgainstLimits,
  type SampleLimitViolation,
} from "@/domain/sample/limits";
import { formatSampleRequestNumber, computeRequestTotalCost } from "@/domain/sample/totals";
import { matchSampleConversion } from "@/domain/sample/conversion";
import {
  notifySampleRequestCreated,
  notifySampleRequestStatusChanged,
} from "@/infra/db/notifications";

const SINGLETON_ID = "singleton";

// ---- Limit settings (singleton row, mirrors payment-settings.ts) ----

async function loadSampleLimitSettings() {
  const existing = await prisma.sampleLimitSettings.findUnique({ where: { id: SINGLETON_ID } });
  if (existing) return existing;
  return prisma.sampleLimitSettings.create({ data: { id: SINGLETON_ID } });
}

export const getSampleLimitSettings = unstable_cache(
  loadSampleLimitSettings,
  ["sample-limit-settings"],
  { revalidate: 300, tags: ["sample-limit-settings"] },
);

export async function updateSampleLimitSettings(data: {
  maxRequestsPerDealerPerMonth: number;
  maxValueKurusPerDealerPerMonth: number;
  maxQtyPerProduct: number;
  repeatBlockDays: number;
  conversionWindowDays: number;
  staleFollowupDays: number;
}) {
  const row = await prisma.sampleLimitSettings.upsert({
    where: { id: SINGLETON_ID },
    update: data,
    create: { id: SINGLETON_ID, ...data },
  });
  revalidateTag("sample-limit-settings", "max");
  return row;
}

// ---- Numbering ----

async function nextSampleRequestNumber(year: number): Promise<string> {
  const prefix = `NUM-${year}-`;
  const latest = await prisma.sampleRequest.findFirst({
    where: { requestNo: { startsWith: prefix } },
    orderBy: { requestNo: "desc" },
    select: { requestNo: true },
  });
  let seq = 1;
  if (latest?.requestNo) {
    const raw = latest.requestNo.slice(prefix.length);
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n)) seq = n + 1;
  }
  return formatSampleRequestNumber(year, seq);
}

// ---- Limit-rule data gathering ----

async function getMonthlySampleStats(
  dealerId: string,
  monthStart: Date,
): Promise<{ count: number; valueKurus: number }> {
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
  const requests = await prisma.sampleRequest.findMany({
    where: {
      dealerId,
      requestedAt: { gte: monthStart, lt: monthEnd },
      status: { notIn: ["IPTAL", "REDDEDILDI"] },
    },
    include: { items: { select: { unitCostKurus: true, quantity: true } } },
  });
  const valueKurus = requests.reduce(
    (sum, r) => sum + computeRequestTotalCost(r.items),
    0,
  );
  return { count: requests.length, valueKurus };
}

async function getRecentSampleRequestDates(
  dealerId: string,
  variantIds: readonly string[],
  since: Date,
): Promise<Map<string, Date>> {
  const items = await prisma.sampleRequestItem.findMany({
    where: {
      variantId: { in: [...variantIds] },
      sampleRequest: {
        dealerId,
        requestedAt: { gte: since },
        status: { notIn: ["IPTAL", "REDDEDILDI"] },
      },
    },
    select: { variantId: true, sampleRequest: { select: { requestedAt: true } } },
  });
  const out = new Map<string, Date>();
  for (const item of items) {
    const existing = out.get(item.variantId);
    if (!existing || item.sampleRequest.requestedAt > existing) {
      out.set(item.variantId, item.sampleRequest.requestedAt);
    }
  }
  return out;
}

function summarizeViolations(violations: readonly SampleLimitViolation[]): string {
  return violations
    .map((v) => {
      switch (v.rule) {
        case "monthly_count":
          return `Aylık talep limiti aşıldı (${v.current}/${v.limit})`;
        case "monthly_value":
          return `Aylık tutar limiti aşıldı`;
        case "product_qty":
          return `Ürün başına adet limiti aşıldı (${v.requested}/${v.limit})`;
        case "repeat_request":
          return `Bu ürün son ${v.blockDays} gün içinde tekrar istendi`;
      }
    })
    .join("; ");
}

// ---- Create ----

export type CreateSampleRequestInput = {
  dealerId: string;
  createdByUserId: string;
  createdByRole: "BAYI" | "STAFF";
  deliveryAddressLine: string;
  note?: string | null;
  items: { variantId: string; quantity: number }[];
};

export async function createSampleRequest(input: CreateSampleRequestInput) {
  if (input.items.length === 0) throw new Error("En az bir ürün ekleyin");
  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Geçerli bir adet girin");
    }
  }

  const settings = await getSampleLimitSettings();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const repeatSince = new Date(now.getTime() - settings.repeatBlockDays * 24 * 60 * 60 * 1000);

  const [stats, recent] = await Promise.all([
    getMonthlySampleStats(input.dealerId, monthStart),
    getRecentSampleRequestDates(
      input.dealerId,
      input.items.map((i) => i.variantId),
      repeatSince,
    ),
  ]);

  const evaluation = evaluateSampleRequestAgainstLimits({
    settings,
    monthlyRequestCount: stats.count,
    monthlyValueKurus: stats.valueKurus,
    requestedItems: input.items,
    recentRequestsByVariant: recent,
    now,
  });
  const flagged = evaluation.violations.length > 0;
  const status: SampleRequestStatus = flagged ? "INCELENIYOR" : "TALEP_EDILDI";

  const requestNo = await nextSampleRequestNumber(now.getFullYear());

  const request = await prisma.sampleRequest.create({
    data: {
      requestNo,
      dealerId: input.dealerId,
      createdByUserId: input.createdByUserId,
      createdByRole: input.createdByRole,
      deliveryAddressLine: input.deliveryAddressLine,
      note: input.note?.trim() || null,
      status,
      flaggedForReview: flagged,
      flagReason: flagged ? summarizeViolations(evaluation.violations) : null,
      items: { create: input.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })) },
      events: { create: [{ status }] },
    },
    include: { items: true, dealer: { select: { unvan: true, email: true } } },
  });

  await notifySampleRequestCreated({
    requestId: request.id,
    requestNo: request.requestNo,
    dealerId: request.dealerId,
    dealerName: request.dealer.unvan,
    dealerEmail: request.dealer.email,
    itemCount: request.items.length,
  });

  return request;
}

// ---- Read ----

export async function listSampleRequests(filters?: {
  dealerId?: string;
  status?: SampleRequestStatus;
  variantId?: string;
  fromDate?: Date;
  toDate?: Date;
}) {
  return prisma.sampleRequest.findMany({
    where: {
      dealerId: filters?.dealerId,
      status: filters?.status,
      requestedAt:
        filters?.fromDate || filters?.toDate
          ? { gte: filters?.fromDate, lte: filters?.toDate }
          : undefined,
      items: filters?.variantId ? { some: { variantId: filters.variantId } } : undefined,
    },
    include: {
      dealer: { select: { id: true, unvan: true, salesRepId: true } },
      items: { include: { variant: { select: { id: true, sku: true, packSize: true, product: { select: { name: true } } } } } },
    },
    orderBy: { requestedAt: "desc" },
  });
}

export async function getSampleRequest(id: string) {
  return prisma.sampleRequest.findUniqueOrThrow({
    where: { id },
    include: {
      dealer: { select: { id: true, unvan: true, email: true, phone: true } },
      createdByUser: { select: { id: true, name: true } },
      items: {
        include: {
          variant: {
            select: { id: true, sku: true, packSize: true, product: { select: { name: true } } },
          },
          lot: { select: { lotNumber: true } },
        },
      },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function listSampleRequestsForDealer(dealerId: string) {
  return prisma.sampleRequest.findMany({
    where: { dealerId },
    include: {
      items: {
        include: {
          variant: { select: { id: true, sku: true, packSize: true, product: { select: { name: true } } } },
        },
      },
    },
    orderBy: { requestedAt: "desc" },
  });
}

// ---- Transitions ----

export async function transitionSampleRequest(
  id: string,
  to: SampleRequestStatus,
  input?: {
    actorUserId?: string;
    rejectReason?: string;
    cargoCompany?: string;
    trackingNo?: string;
  },
) {
  const request = await prisma.sampleRequest.findUniqueOrThrow({
    where: { id },
    include: {
      items: { include: { variant: { select: { unitFactor: true } } } },
      dealer: { select: { unvan: true, email: true } },
    },
  });

  const result = assertSampleTransition({
    from: request.status,
    to,
    rejectReason: input?.rejectReason,
  });
  if (!result.ok) throw result.error;

  const stockEffect = sampleStockEffectOnTransition(request.status, to);
  const fromStatus = request.status;

  await prisma.$transaction(
    async (tx) => {
      if (stockEffect === "consume") {
        await consumeSampleStockTx(tx, request);
      }

      await tx.sampleRequest.update({
        where: { id },
        data: {
          status: to,
          ...(to === "ONAYLANDI" ? { approvedAt: new Date() } : {}),
          ...(to === "SEVK_EDILDI" ? { shippedAt: new Date() } : {}),
          ...(to === "TESLIM_EDILDI" ? { deliveredAt: new Date() } : {}),
          ...(to === "REDDEDILDI" ? { rejectReason: result.rejectReason } : {}),
          ...(input?.cargoCompany !== undefined ? { cargoCompany: input.cargoCompany } : {}),
          ...(input?.trackingNo !== undefined ? { trackingNo: input.trackingNo } : {}),
        },
      });
      await tx.sampleRequestEvent.create({
        data: {
          sampleRequestId: id,
          status: to,
          note: to === "REDDEDILDI" ? result.rejectReason : undefined,
          actorUserId: input?.actorUserId,
        },
      });
    },
    { maxWait: 10_000, timeout: 15_000 },
  );

  if (fromStatus !== to) {
    await notifySampleRequestStatusChanged({
      requestNo: request.requestNo,
      dealerId: request.dealerId,
      dealerName: request.dealer.unvan,
      dealerEmail: request.dealer.email,
      status: to,
    });
  }

  return prisma.sampleRequest.findUniqueOrThrow({ where: { id } });
}

/**
 * FEFO-allocates each item's quantity and writes FIRE stock movements — no
 * separate sample-stock pool, this draws from the same Lots regular sales use.
 * An item's FK slot (lotId/stockMovementId) records only the first pick when
 * FEFO must split across lots; every pick still gets its own StockMovement row
 * (with the request number in its note) so nothing is lost from the audit trail.
 */
type SampleStockItem = {
  id: string;
  variantId: string;
  quantity: number;
  variant: { unitFactor: { toString(): string } };
};

async function consumeSampleStockTx(
  tx: DbTx,
  request: { requestNo: string; items: SampleStockItem[] },
) {
  const variantIds = request.items.map((item) => item.variantId);
  await lockLotRows(tx, { variantIds });

  const lotsByVariant = new Map<string, LotSummary[]>();
  for (const variantId of new Set(variantIds)) {
    const lots = await tx.lot.findMany({ where: { variantId }, include: { movements: true } });
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
    request.items.map((item) => ({
      orderLineId: item.id,
      variantId: item.variantId,
      requiredKg: fromCases(item.quantity, item.variant.unitFactor.toString()),
    })),
  );

  const picksByItem = new Map<string, typeof allocations>();
  for (const allocation of allocations) {
    const arr = picksByItem.get(allocation.orderLineId) ?? [];
    arr.push(allocation);
    picksByItem.set(allocation.orderLineId, arr);
  }

  const note = `Numune: ${request.requestNo}`;
  for (const item of request.items) {
    const picks = picksByItem.get(item.id) ?? [];
    let primaryMovementId: string | null = null;
    let primaryLotId: string | null = null;
    for (const pick of picks) {
      const movement = await tx.stockMovement.create({
        data: { lotId: pick.lotId, type: "FIRE", quantityKg: pick.quantityKg.toString(), note },
      });
      if (!primaryMovementId) {
        primaryMovementId = movement.id;
        primaryLotId = pick.lotId;
      }
    }
    if (primaryMovementId) {
      await tx.sampleRequestItem.update({
        where: { id: item.id },
        data: { lotId: primaryLotId, stockMovementId: primaryMovementId },
      });
    }
  }
}

export type BulkTransitionResult = { succeeded: number; failed: number; errors: string[] };

export async function bulkApproveSampleRequests(
  ids: string[],
  actorUserId: string,
): Promise<BulkTransitionResult> {
  const results = await Promise.allSettled(
    ids.map((id) => transitionSampleRequest(id, "ONAYLANDI", { actorUserId })),
  );
  return summarizeBulkResults(results);
}

export async function bulkRejectSampleRequests(
  ids: string[],
  rejectReason: string,
  actorUserId: string,
): Promise<BulkTransitionResult> {
  const results = await Promise.allSettled(
    ids.map((id) => transitionSampleRequest(id, "REDDEDILDI", { actorUserId, rejectReason })),
  );
  return summarizeBulkResults(results);
}

function summarizeBulkResults(results: PromiseSettledResult<unknown>[]): BulkTransitionResult {
  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => (r.reason instanceof Error ? r.reason.message : "Bilinmeyen hata"));
  return {
    succeeded: results.filter((r) => r.status === "fulfilled").length,
    failed: errors.length,
    errors: errors.slice(0, 10),
  };
}

// ---- Conversion matching ----

/**
 * Called when an order is CONFIRMED: checks whether it converts any open
 * sample the same dealer received for the same variant, within the settings
 * window. Best-effort — never throws (mirrors notification functions).
 */
// ---- Reporting ----

export async function getDealerSampleReport() {
  const requests = await prisma.sampleRequest.findMany({
    where: { status: { notIn: ["IPTAL"] } },
    include: {
      dealer: { select: { id: true, unvan: true } },
      items: { select: { unitCostKurus: true, quantity: true, conversions: { select: { id: true } } } },
    },
  });

  const byDealer = new Map<
    string,
    { dealerId: string; dealerName: string; requestCount: number; totalCostKurus: number; convertedItemCount: number; itemCount: number }
  >();
  for (const r of requests) {
    const row = byDealer.get(r.dealerId) ?? {
      dealerId: r.dealerId,
      dealerName: r.dealer.unvan,
      requestCount: 0,
      totalCostKurus: 0,
      convertedItemCount: 0,
      itemCount: 0,
    };
    row.requestCount += 1;
    row.totalCostKurus += computeRequestTotalCost(r.items);
    row.itemCount += r.items.length;
    row.convertedItemCount += r.items.filter((i) => i.conversions.length > 0).length;
    byDealer.set(r.dealerId, row);
  }

  return [...byDealer.values()]
    .map((row) => ({
      ...row,
      conversionRatePercent: row.itemCount > 0 ? Math.round((row.convertedItemCount / row.itemCount) * 100) : 0,
    }))
    .sort((a, b) => b.requestCount - a.requestCount);
}

export async function getProductSampleReport() {
  const items = await prisma.sampleRequestItem.findMany({
    where: { sampleRequest: { status: { notIn: ["IPTAL"] } } },
    include: {
      variant: { select: { id: true, sku: true, product: { select: { name: true } } } },
      conversions: { select: { id: true } },
    },
  });

  const byVariant = new Map<
    string,
    { variantId: string; productName: string; sku: string; requestCount: number; convertedCount: number }
  >();
  for (const item of items) {
    const row = byVariant.get(item.variantId) ?? {
      variantId: item.variantId,
      productName: item.variant.product.name,
      sku: item.variant.sku,
      requestCount: 0,
      convertedCount: 0,
    };
    row.requestCount += 1;
    if (item.conversions.length > 0) row.convertedCount += 1;
    byVariant.set(item.variantId, row);
  }

  return [...byVariant.values()]
    .map((row) => ({
      ...row,
      conversionRatePercent: row.requestCount > 0 ? Math.round((row.convertedCount / row.requestCount) * 100) : 0,
    }))
    .sort((a, b) => b.requestCount - a.requestCount);
}

/** "Numune gitti ama N gündür sipariş yok" takip listesi. */
export async function getStaleSampleFollowups() {
  const settings = await getSampleLimitSettings();
  const cutoff = new Date(Date.now() - settings.staleFollowupDays * 24 * 60 * 60 * 1000);

  const items = await prisma.sampleRequestItem.findMany({
    where: {
      sampleRequest: { status: "TESLIM_EDILDI", deliveredAt: { lte: cutoff } },
      conversions: { none: {} },
    },
    include: {
      sampleRequest: { select: { requestNo: true, dealerId: true, deliveredAt: true, dealer: { select: { unvan: true } } } },
      variant: { select: { sku: true, product: { select: { name: true } } } },
    },
    orderBy: { sampleRequest: { deliveredAt: "asc" } },
  });

  return items.map((item) => ({
    itemId: item.id,
    requestNo: item.sampleRequest.requestNo,
    dealerId: item.sampleRequest.dealerId,
    dealerName: item.sampleRequest.dealer.unvan,
    productName: item.variant.product.name,
    sku: item.variant.sku,
    deliveredAt: item.sampleRequest.deliveredAt!,
    daysSinceDelivery: Math.floor(
      (Date.now() - item.sampleRequest.deliveredAt!.getTime()) / (24 * 60 * 60 * 1000),
    ),
  }));
}

export async function matchAndRecordSampleConversions(input: {
  dealerId: string;
  orderId: string;
  orderCreatedAt: Date;
  variantIds: readonly string[];
}) {
  try {
    const settings = await getSampleLimitSettings();
    const candidateItems = await prisma.sampleRequestItem.findMany({
      where: {
        variantId: { in: [...input.variantIds] },
        sampleRequest: { dealerId: input.dealerId, status: "TESLIM_EDILDI" },
      },
      select: { id: true, variantId: true, sampleRequest: { select: { deliveredAt: true } } },
    });

    for (const item of candidateItems) {
      if (!item.sampleRequest.deliveredAt) continue;
      const match = matchSampleConversion(
        { variantId: item.variantId, deliveredAt: item.sampleRequest.deliveredAt },
        [{ orderId: input.orderId, variantId: item.variantId, createdAt: input.orderCreatedAt }],
        settings.conversionWindowDays,
      );
      if (!match) continue;
      await prisma.sampleConversion.upsert({
        where: { sampleRequestItemId_orderId: { sampleRequestItemId: item.id, orderId: input.orderId } },
        update: {},
        create: {
          sampleRequestItemId: item.id,
          orderId: input.orderId,
          daysElapsed: match.daysElapsed,
        },
      });
    }
  } catch (err) {
    console.error("[samples] matchAndRecordSampleConversions failed:", err);
  }
}
