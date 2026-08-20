import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { OrderBoard, type OrderRow } from "@/components/admin/order-board";
import { listOrders } from "@/infra/db/orders";
import { listDealers, listPriceListOptions } from "@/infra/db/dealers";
import { listShippableVariants } from "@/infra/db/shipments";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { packLabel } from "@/lib/format/packaging";

export default async function AdminOrdersPage() {
  const [orders, dealers, variants, priceLists] = await Promise.all([
    listOrders(),
    listDealers(),
    listShippableVariants(),
    listPriceListOptions(),
  ]);

  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    dealerId: o.dealerId,
    dealerName: o.dealer.unvan,
    dealerType: o.dealer.dealerType,
    status: o.status,
    totalKurus: o.totalKurus,
    note: o.note,
    paymentMethod: o.paymentMethod,
    paidAt: o.paidAt?.toISOString() ?? null,
    createdAt: o.createdAt.toISOString(),
    lines: o.lines.map((l) => ({
      id: l.id,
      variantId: l.variantId,
      productName: l.variant.product.name,
      imageUrl: l.variant.product.imageUrl,
      packLabel: packLabel(l.variant.packSize, l.variant.packagingType),
      packagingType: l.variant.packagingType,
      quantity: l.quantity,
      unitPriceKurus: l.unitPriceKurus,
      lineTotalKurus: l.lineTotalKurus,
      reservedLots: l.lotAllocations.map((a) => ({
        lotNumber: a.lot.lotNumber,
        quantityKg: a.quantityKg.toString(),
      })),
      activeShipment: l.shipments[0]
        ? { id: l.shipments[0].id, status: l.shipments[0].status }
        : null,
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
    proforma: o.proformas[0]
      ? {
          id: o.proformas[0].id,
          number: o.proformas[0].number,
          status: o.proformas[0].status,
          issuedAt: o.proformas[0].issuedAt.toISOString(),
          sentAt: o.proformas[0].sentAt?.toISOString() ?? null,
          version: o.proformas[0].version,
          buyerEmail: o.proformas[0].buyerEmail,
          totalKurus: o.proformas[0].totalKurus,
        }
      : null,
  }));

  const activeCount = rows.filter(
    (r) => !["DELIVERED", "REJECTED", "CANCELLED"].includes(r.status),
  ).length;
  const deliveredCount = rows.filter((r) => r.status === "DELIVERED").length;
  const totalKurus = rows
    .filter((r) => r.status !== "REJECTED" && r.status !== "CANCELLED")
    .reduce((sum, r) => sum + r.totalKurus, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Siparişler"
        description="Bayi siparişleri, onay ve teslimat durumu."
        count={rows.length}
      />

      <section aria-label="Özet" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam sipariş"
          value={rows.length}
          href="/panel/siparisler?gorunum=all#siparis-panosu"
        />
        <StatCard
          label="Aktif"
          value={activeCount}
          href="/panel/siparisler?gorunum=active#siparis-panosu"
          tone={activeCount > 0 ? "info" : "neutral"}
        />
        <StatCard
          label="Teslim edilen"
          value={deliveredCount}
          href="/panel/siparisler?gorunum=delivered#siparis-panosu"
        />
        <StatCard
          label="Toplam ciro"
          value={formatMoney(money(totalKurus))}
          href="/panel/siparisler?gorunum=all#siparis-panosu"
        />
      </section>

      <div id="siparis-panosu">
        <OrderBoard
          orders={rows}
          dealers={dealers.map((d) => ({ id: d.id, unvan: d.unvan }))}
          variants={variants}
          priceLists={priceLists}
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
