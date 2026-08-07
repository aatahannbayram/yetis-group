/** Pure aggregates for dealer order history / dashboard cards. */
export function summarizeDealerOrders(
  orders: Array<{ status: string; totalKurus: number; createdAt: Date }>,
) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const openStatuses = new Set(["SUBMITTED", "UNDER_REVIEW", "CONFIRMED", "PREPARING", "SHIPPED"]);
  const closedOk = new Set(["DELIVERED"]);

  let openCount = 0;
  let openKurus = 0;
  let monthCount = 0;
  let monthKurus = 0;
  let deliveredCount = 0;
  let deliveredKurus = 0;

  for (const o of orders) {
    if (openStatuses.has(o.status)) {
      openCount += 1;
      openKurus += o.totalKurus;
    }
    if (closedOk.has(o.status)) {
      deliveredCount += 1;
      deliveredKurus += o.totalKurus;
    }
    if (o.createdAt >= monthStart) {
      monthCount += 1;
      monthKurus += o.totalKurus;
    }
  }

  return {
    totalOrders: orders.length,
    openCount,
    openKurus,
    monthCount,
    monthKurus,
    deliveredCount,
    deliveredKurus,
  };
}
