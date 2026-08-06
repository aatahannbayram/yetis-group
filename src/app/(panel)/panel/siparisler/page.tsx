import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { OrderBoard, type OrderRow } from "@/components/admin/order-board";
import { listOrders } from "@/infra/db/orders";
import { listDealers } from "@/infra/db/dealers";
import { listShippableVariants } from "@/infra/db/shipments";

export default async function AdminOrdersPage() {
  const [orders, dealers, variants] = await Promise.all([
    listOrders(),
    listDealers(),
    listShippableVariants(),
  ]);

  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    dealerId: o.dealerId,
    dealerName: o.dealer.unvan,
    dealerType: o.dealer.dealerType,
    status: o.status,
    totalKurus: o.totalKurus,
    note: o.note,
    createdAt: o.createdAt.toISOString(),
    lines: o.lines.map((l) => ({
      id: l.id,
      variantId: l.variantId,
      productName: l.variant.product.name,
      imageUrl: l.variant.product.imageUrl,
      packLabel: l.variant.packSize ?? l.variant.packagingType,
      quantity: l.quantity,
      unitPriceKurus: l.unitPriceKurus,
      lineTotalKurus: l.lineTotalKurus,
    })),
    events: o.events.map((e) => ({
      id: e.id,
      status: e.status,
      note: e.note,
      createdAt: e.createdAt.toISOString(),
    })),
    shipments: o.shipments.map((s) => ({
      id: s.id,
      status: s.status,
      quantityKg: s.quantityKg.toString(),
      lotNumbers: s.allocations.map((a) => a.lot.lotNumber),
    })),
  }));

  const activeCount = rows.filter(
    (r) => !["DELIVERED", "REJECTED", "CANCELLED"].includes(r.status),
  ).length;
  const deliveredCount = rows.filter((r) => r.status === "DELIVERED").length;
  const totalKurus = rows.reduce((sum, r) => sum + r.totalKurus, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Siparişler"
        description="Bayi siparişleri, onay ve teslimat durumu."
        count={rows.length}
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam sipariş" value={rows.length} href="#siparis-panosu" />
        <StatCard
          label="Aktif"
          value={activeCount}
          href="#siparis-panosu"
          tone={activeCount > 0 ? "info" : "neutral"}
        />
        <StatCard label="Teslim edilen" value={deliveredCount} href="#siparis-panosu" />
        <StatCard
          label="Toplam ciro"
          value={Math.round(totalKurus / 100)}
          unit="₺"
          href="#siparis-panosu"
        />
      </div>

      <div id="siparis-panosu">
        <OrderBoard
          orders={rows}
          dealers={dealers.map((d) => ({ id: d.id, unvan: d.unvan }))}
          variants={variants}
        />
      </div>

      {deliveredCount > 0 ? (
        <p className="text-caption text-[var(--text-muted)]">
          Teslim edilen siparişler otomatik olarak cariye borç kaydı olarak işlenir.
        </p>
      ) : null}
    </div>
  );
}
