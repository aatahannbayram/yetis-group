import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Siparişler"
        description="Sipariş akışı: gönderildi → incelemede → onaylandı → hazırlanıyor → yolda → teslim edildi."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Toplam Sipariş" value={rows.length} href="#siparis-panosu" featured />
        <StatCard label="Aktif" value={activeCount} href="#siparis-panosu" />
        <StatCard
          label="Toplam Ciro"
          value={Math.round(totalKurus / 100)}
          suffix=" ₺"
          href="#siparis-panosu"
        />
      </div>

      <div id="siparis-panosu" className="mt-6">
        <OrderBoard
          orders={rows}
          dealers={dealers.map((d) => ({ id: d.id, unvan: d.unvan }))}
          variants={variants}
        />
      </div>

      {deliveredCount > 0 ? (
        <p className="mt-4 text-caption text-muted-foreground">
          Teslim edilen siparişler otomatik olarak Cari&apos;ye borç kaydı olarak işlenir.
        </p>
      ) : null}
    </div>
  );
}
