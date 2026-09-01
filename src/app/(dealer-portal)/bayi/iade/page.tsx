import { requireDealerPortal } from "@/features/dealer/portal-context";
import { listOrdersForDealer } from "@/infra/db/orders";
import { listReturnRequestsForDealer } from "@/infra/db/returns";
import { DealerReturnRequests } from "@/components/dealer/dealer-return-requests";

export default async function BayiIadePage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { dealerId } = await requireDealerPortal();
  const { orderId } = await searchParams;

  const [ordersRaw, requestsRaw] = await Promise.all([
    listOrdersForDealer(dealerId),
    listReturnRequestsForDealer(dealerId),
  ]);

  const deliveredOrders = ordersRaw
    .filter((o) => o.status === "DELIVERED")
    .map((o) => ({
      id: o.id,
      createdAt: o.createdAt.toISOString(),
      totalKurus: o.totalKurus,
      lineCount: o.lines.length,
    }));

  const requests = requestsRaw.map((r) => ({
    id: r.id,
    returnNo: r.returnNo,
    status: r.status,
    requestedAt: r.requestedAt.toISOString(),
    rejectReason: r.rejectReason,
    items: r.items.map((i) => ({
      id: i.id,
      productName: i.variant.product.name,
      sku: i.variant.sku,
      requestedQty: i.requestedQty,
      approvedQty: i.approvedQty,
    })),
  }));

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      <header className="border-b border-[var(--panel-border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--panel-ink)]">İadelerim</h1>
        <p className="mt-1 text-sm text-[var(--panel-ink-muted)]">
          Teslim edilmiş siparişlerinizden resmi iade talebi açın, durumu buradan takip edin.
        </p>
      </header>

      <DealerReturnRequests
        requests={requests}
        deliveredOrders={deliveredOrders}
        initialOrderId={orderId}
      />
    </div>
  );
}
