import { prisma } from "@/infra/db/client";
import { sortStopsNearestFirst } from "@/domain/logistics/distance";
import {
  confirmCodCollection,
  transitionOrder,
} from "@/infra/db/orders";
import { updateShipmentStatus } from "@/infra/db/shipments";

function toNum(v: { toString(): string } | number | null | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v.toString());
  return Number.isFinite(n) ? n : null;
}

export async function getDepotPoint(): Promise<{
  label: string;
  lat: number;
  lng: number;
} | null> {
  const settings = await prisma.paymentSettings.findUnique({ where: { id: "singleton" } });
  const lat = toNum(settings?.depotLat);
  const lng = toNum(settings?.depotLng);
  if (lat == null || lng == null) return null;
  return {
    label: settings?.depotLabel?.trim() || "Yetiş Grup Depo",
    lat,
    lng,
  };
}

export async function listRoutes(limit = 40) {
  return prisma.deliveryRoute.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      assignedUser: { select: { id: true, name: true, email: true } },
      stops: {
        orderBy: { sequence: "asc" },
        include: {
          dealer: {
            select: {
              id: true,
              unvan: true,
              city: true,
              district: true,
              addressLine: true,
              deliveryAddressLine: true,
              lat: true,
              lng: true,
            },
          },
          _count: { select: { orders: true, shipments: true } },
        },
      },
    },
  });
}

export async function getRouteById(routeId: string) {
  return prisma.deliveryRoute.findUnique({
    where: { id: routeId },
    include: {
      assignedUser: { select: { id: true, name: true, email: true } },
      stops: {
        orderBy: { sequence: "asc" },
        include: {
          dealer: {
            select: {
              id: true,
              unvan: true,
              city: true,
              district: true,
              addressLine: true,
              deliveryAddressLine: true,
              phone: true,
              lat: true,
              lng: true,
            },
          },
          orders: {
            include: {
              order: {
                select: {
                  id: true,
                  status: true,
                  totalKurus: true,
                  paymentMethod: true,
                  paidAt: true,
                  paymentSlipUrl: true,
                  codCollectedAt: true,
                },
              },
            },
          },
          shipments: {
            include: {
              variant: {
                include: { product: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  });
}

/** Dealers with pending shipments (and optional open orders) for route planning. */
export async function listRoutableDealers() {
  const shipments = await prisma.shipment.findMany({
    where: {
      status: { in: ["HAZIRLANIYOR", "YOLDA"] },
      deliveryStopId: null,
    },
    select: {
      id: true,
      dealerId: true,
      orderId: true,
      status: true,
      quantityKg: true,
    },
  });

  const byDealer = new Map<
    string,
    { shipmentIds: string[]; orderIds: Set<string> }
  >();
  for (const s of shipments) {
    const bucket = byDealer.get(s.dealerId) ?? { shipmentIds: [], orderIds: new Set() };
    bucket.shipmentIds.push(s.id);
    if (s.orderId) bucket.orderIds.add(s.orderId);
    byDealer.set(s.dealerId, bucket);
  }

  const dealerIds = [...byDealer.keys()];
  if (dealerIds.length === 0) return [];

  const dealers = await prisma.dealer.findMany({
    where: { id: { in: dealerIds } },
    select: {
      id: true,
      unvan: true,
      city: true,
      district: true,
      addressLine: true,
      deliveryAddressLine: true,
      lat: true,
      lng: true,
    },
  });

  return dealers.map((d) => {
    const bag = byDealer.get(d.id)!;
    return {
      ...d,
      lat: toNum(d.lat),
      lng: toNum(d.lng),
      shipmentIds: bag.shipmentIds,
      orderIds: [...bag.orderIds],
    };
  });
}

export async function createDeliveryRoute(input: {
  date: Date;
  assignedUserId?: string | null;
  note?: string;
  dealerIds: string[];
}) {
  if (input.dealerIds.length === 0) throw new Error("En az bir bayi seçin");
  const depot = await getDepotPoint();
  if (!depot) {
    throw new Error("Depo konumu tanımlı değil. Panel ayarlarından depo lat/lng girin");
  }

  const dealers = await prisma.dealer.findMany({
    where: { id: { in: input.dealerIds } },
    select: { id: true, lat: true, lng: true },
  });
  if (dealers.length !== input.dealerIds.length) {
    throw new Error("Bazı bayiler bulunamadı");
  }

  const missingGeo = dealers.filter((d) => toNum(d.lat) == null || toNum(d.lng) == null);
  if (missingGeo.length > 0) {
    throw new Error(
      `${missingGeo.length} bayinin konumu yok. Önce bayi kartına lat/lng ekleyin`,
    );
  }

  const sorted = sortStopsNearestFirst(
    depot,
    dealers.map((d) => ({
      id: d.id,
      lat: toNum(d.lat),
      lng: toNum(d.lng),
    })),
  );

  const routable = await listRoutableDealers();
  const byId = new Map(routable.map((r) => [r.id, r]));

  const route = await prisma.$transaction(async (tx) => {
    const created = await tx.deliveryRoute.create({
      data: {
        date: input.date,
        status: "DRAFT",
        depotLabel: depot.label,
        depotLat: depot.lat,
        depotLng: depot.lng,
        assignedUserId: input.assignedUserId ?? null,
        note: input.note?.trim() || null,
      },
    });

    for (let i = 0; i < sorted.length; i++) {
      const stop = sorted[i]!;
      const bag = byId.get(stop.id);
      const createdStop = await tx.deliveryStop.create({
        data: {
          routeId: created.id,
          dealerId: stop.id,
          sequence: i,
          distanceKm: stop.distanceKm != null ? Number(stop.distanceKm.toFixed(3)) : null,
        },
      });
      if (bag?.orderIds.length) {
        await tx.deliveryStopOrder.createMany({
          data: bag.orderIds.map((orderId) => ({
            stopId: createdStop.id,
            orderId,
          })),
          skipDuplicates: true,
        });
      }
      if (bag?.shipmentIds.length) {
        await tx.shipment.updateMany({
          where: { id: { in: bag.shipmentIds } },
          data: { deliveryStopId: createdStop.id },
        });
      }
    }

    return created;
  });

  return getRouteById(route.id);
}

export async function reorderRouteStops(routeId: string, orderedDealerIds: string[]) {
  const route = await prisma.deliveryRoute.findUniqueOrThrow({
    where: { id: routeId },
    include: { stops: true },
  });
  if (route.status !== "DRAFT") throw new Error("Yalnızca taslak rota sıralanabilir");
  if (orderedDealerIds.length !== route.stops.length) {
    throw new Error("Durak listesi eksik veya fazla");
  }

  const byDealer = new Map(route.stops.map((s) => [s.dealerId, s]));
  for (const id of orderedDealerIds) {
    if (!byDealer.has(id)) throw new Error("Geçersiz bayi durak");
  }

  await prisma.$transaction(
    orderedDealerIds.map((dealerId, sequence) =>
      prisma.deliveryStop.update({
        where: { id: byDealer.get(dealerId)!.id },
        data: { sequence },
      }),
    ),
  );

  return getRouteById(routeId);
}

export async function startDeliveryRoute(routeId: string) {
  const route = await prisma.deliveryRoute.findUniqueOrThrow({
    where: { id: routeId },
    include: { stops: true },
  });
  if (route.status !== "DRAFT") throw new Error("Rota zaten başlatılmış veya kapalı");
  if (route.stops.length === 0) throw new Error("Rotada durak yok");

  return prisma.deliveryRoute.update({
    where: { id: routeId },
    data: { status: "ACTIVE", startedAt: new Date() },
  });
}

export async function markStopEnRoute(stopId: string) {
  const stop = await prisma.deliveryStop.findUniqueOrThrow({
    where: { id: stopId },
    include: { route: true, shipments: true },
  });
  if (stop.route.status !== "ACTIVE") throw new Error("Rota aktif değil");
  if (stop.status === "DONE") throw new Error("Durak tamamlandı");

  await prisma.$transaction(async (tx) => {
    await tx.deliveryStop.update({
      where: { id: stopId },
      data: { status: "EN_ROUTE", arrivedAt: stop.arrivedAt ?? new Date() },
    });
    for (const s of stop.shipments) {
      if (s.status === "HAZIRLANIYOR") {
        await tx.shipment.update({
          where: { id: s.id },
          data: { status: "YOLDA", shippedAt: s.shippedAt ?? new Date() },
        });
      }
    }
  });

  return getRouteById(stop.routeId);
}

export async function completeDeliveryStop(
  stopId: string,
  input?: { collectCodOrderIds?: string[]; paymentSlipUrls?: Record<string, string> },
) {
  const stop = await prisma.deliveryStop.findUniqueOrThrow({
    where: { id: stopId },
    include: {
      route: true,
      shipments: true,
      orders: { include: { order: true } },
    },
  });
  if (stop.route.status !== "ACTIVE") throw new Error("Rota aktif değil");
  if (stop.status === "DONE") throw new Error("Durak zaten tamamlandı");

  for (const link of stop.orders) {
    const order = link.order;
    if (order.paymentMethod === "KAPIDA_POS" || order.paymentMethod === "KAPIDA_NAKIT") {
      if (!order.paidAt && input?.collectCodOrderIds?.includes(order.id)) {
        const slip = input.paymentSlipUrls?.[order.id] ?? order.paymentSlipUrl;
        await confirmCodCollection(order.id, { paymentSlipUrl: slip });
      } else if (!order.paidAt && order.paymentMethod === "KAPIDA_POS") {
        throw new Error(`POS fiş tahsilatı gerekli: sipariş #${order.id.slice(-6)}`);
      }
    }
  }

  for (const s of stop.shipments) {
    if (s.status !== "TESLIM_EDILDI" && s.status !== "IPTAL") {
      await updateShipmentStatus(s.id, "TESLIM_EDILDI");
    }
  }

  for (const link of stop.orders) {
    try {
      let status = link.order.status;
      if (status === "CONFIRMED") {
        await transitionOrder(link.order.id, "PREPARING", { note: "Rota teslimatı" });
        status = "PREPARING";
      }
      if (status === "PREPARING") {
        await transitionOrder(link.order.id, "SHIPPED", { note: "Rota teslimatı" });
        status = "SHIPPED";
      }
      if (status === "SHIPPED") {
        await transitionOrder(link.order.id, "DELIVERED", { note: "Rota durak tamamlandı" });
      }
    } catch (err) {
      console.error("[route] order sync failed", link.order.id, err);
    }
  }

  await prisma.deliveryStop.update({
    where: { id: stopId },
    data: { status: "DONE", completedAt: new Date() },
  });

  const remaining = await prisma.deliveryStop.count({
    where: { routeId: stop.routeId, status: { notIn: ["DONE", "SKIPPED"] } },
  });
  if (remaining === 0) {
    await prisma.deliveryRoute.update({
      where: { id: stop.routeId },
      data: { status: "DONE", completedAt: new Date() },
    });
  }

  return getRouteById(stop.routeId);
}
