import { prisma } from "@/infra/db/client";
import {
  LEAD_CHANNEL_LABELS,
  LEAD_STAGE_LABELS,
  LEAD_STAGES,
} from "@/domain/leads";

/**
 * Staff-facing snapshot for /admin and /admin/analytics.
 * Uses live CRM, catalog, content, and cart tables - no order FSM yet.
 */
export async function getAdminAnalyticsSnapshot() {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setHours(0, 0, 0, 0);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

  const [
    totalLeads,
    openLeads,
    wonLeads,
    lostLeads,
    leadsLast14d,
    dealersTotal,
    dealersActive,
    dealersBasvuru,
    dealersInceleme,
    dealersRiskli,
    productsActive,
    variantsActive,
    publishedPosts,
    draftPosts,
    publishedRecipes,
    cartsWithLines,
    cartLinesAgg,
    recentLeadsByDay,
    allLeadsSlim,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { stage: { notIn: ["KAZANILDI", "KAYBEDILDI"] } } }),
    prisma.lead.count({ where: { stage: "KAZANILDI" } }),
    prisma.lead.count({ where: { stage: "KAYBEDILDI" } }),
    prisma.lead.count({ where: { createdAt: { gte: fourteenDaysAgo } } }),
    prisma.dealer.count(),
    prisma.dealer.count({ where: { status: { in: ["ONAYLI", "AKTIF"] } } }),
    prisma.dealer.count({ where: { status: "BASVURU" } }),
    prisma.dealer.count({ where: { status: "INCELEME" } }),
    prisma.dealer.count({ where: { status: { in: ["RISKLI", "BLOKE", "PASIF"] } } }),
    prisma.product.count({ where: { active: true } }),
    prisma.productVariant.count({ where: { isActive: true } }),
    prisma.contentPost.count({ where: { status: "PUBLISHED" } }),
    prisma.contentPost.count({ where: { status: "DRAFT" } }),
    prisma.recipe.count({ where: { status: "PUBLISHED" } }),
    prisma.cart.count({ where: { lines: { some: {} } } }),
    prisma.cartLine.aggregate({
      _sum: { quantity: true },
      _count: { id: true },
    }),
    prisma.lead.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true, channel: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.lead.findMany({
      select: { stage: true, channel: true },
    }),
  ]);

  const carts = await prisma.cart.findMany({
    where: { lines: { some: {} } },
    select: {
      lines: { select: { quantity: true, unitPriceKurus: true } },
    },
  });

  let openCartValueKurus = 0;
  for (const cart of carts) {
    for (const line of cart.lines) {
      openCartValueKurus += line.quantity * line.unitPriceKurus;
    }
  }

  const leadsByDayMap = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    leadsByDayMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const lead of recentLeadsByDay) {
    const key = new Date(lead.createdAt).toISOString().slice(0, 10);
    if (leadsByDayMap.has(key)) {
      leadsByDayMap.set(key, (leadsByDayMap.get(key) ?? 0) + 1);
    }
  }

  const weekdayShort = ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"] as const;

  const stageCounts = LEAD_STAGES.map((stage) => ({
    stage,
    label: LEAD_STAGE_LABELS[stage],
    count: allLeadsSlim.filter((l) => l.stage === stage).length,
  }));

  const channelCounts = Object.entries(LEAD_CHANNEL_LABELS).map(([channel, label]) => ({
    channel,
    label,
    count: allLeadsSlim.filter((l) => l.channel === channel).length,
  }));

  const closed = wonLeads + lostLeads;
  const prev7 = Array.from(leadsByDayMap.values()).slice(0, 7).reduce((a, b) => a + b, 0);
  const last7 = Array.from(leadsByDayMap.values()).slice(7).reduce((a, b) => a + b, 0);

  return {
    crm: {
      totalLeads,
      openLeads,
      wonLeads,
      lostLeads,
      leadsLast14d,
      winRate: closed > 0 ? Math.round((wonLeads / closed) * 100) : 0,
      leadsByDay: Array.from(leadsByDayMap.entries()).map(([date, count]) => {
        const d = new Date(`${date}T12:00:00`);
        return {
          date,
          count,
          dayLabel: weekdayShort[d.getDay()] ?? "",
          dayNum: date.slice(8),
        };
      }),
      stageCounts,
      channelCounts,
      weekOverWeek:
        prev7 === 0 ? (last7 > 0 ? 100 : 0) : Math.round(((last7 - prev7) / prev7) * 100),
      last7,
      prev7,
    },
    dealers: {
      total: dealersTotal,
      active: dealersActive,
      basvuru: dealersBasvuru,
      inceleme: dealersInceleme,
      other: dealersRiskli,
    },
    catalog: {
      productsActive,
      variantsActive,
    },
    content: {
      publishedPosts,
      draftPosts,
      publishedRecipes,
    },
    b2b: {
      cartsWithLines,
      lineCount: cartLinesAgg._count.id,
      unitCount: cartLinesAgg._sum.quantity ?? 0,
      openCartValueKurus,
    },
  };
}

export async function listActiveCartsForAdmin() {
  const carts = await prisma.cart.findMany({
    where: { lines: { some: {} } },
    orderBy: { updatedAt: "desc" },
    include: {
      dealer: { select: { id: true, unvan: true, status: true } },
      user: { select: { id: true, name: true, email: true } },
      lines: {
        include: {
          variant: {
            include: { product: { select: { id: true, name: true, slug: true } } },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return carts.map((cart) => {
    const subtotalKurus = cart.lines.reduce(
      (sum, line) => sum + line.quantity * line.unitPriceKurus,
      0,
    );
    return {
      id: cart.id,
      guestKey: cart.guestKey,
      updatedAt: cart.updatedAt,
      dealer: cart.dealer,
      user: cart.user,
      lineCount: cart.lines.length,
      unitCount: cart.lines.reduce((s, l) => s + l.quantity, 0),
      subtotalKurus,
      lines: cart.lines.map((line) => ({
        id: line.id,
        quantity: line.quantity,
        unitPriceKurus: line.unitPriceKurus,
        productName: line.variant.product.name,
        productSlug: line.variant.product.slug,
        sku: line.variant.sku,
        packSize: line.variant.packSize,
      })),
    };
  });
}
