import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatCard } from "@/components/admin/stat-card";
import { ShipmentBoard, type ShipmentRow } from "@/components/admin/shipment-board";
import { ShippingBoard } from "@/components/admin/shipping-board";
import { CollapsibleSection } from "@/components/admin/collapsible-section";
import { listShipments, listShippableVariants } from "@/infra/db/shipments";
import { listDealers } from "@/infra/db/dealers";
import { getShippingOverview } from "@/infra/db/shipping";

export default async function AdminShipmentsPage() {
  const [shipments, dealers, variants, lotRows] = await Promise.all([
    listShipments(),
    listDealers(),
    listShippableVariants(),
    getShippingOverview(),
  ]);

  const rows: ShipmentRow[] = shipments.map((s) => ({
    id: s.id,
    dealerId: s.dealerId,
    dealerName: s.dealer.unvan,
    dealerType: s.dealer.dealerType,
    productName: s.variant.product.name,
    packLabel: s.variant.packSize ?? s.variant.packagingType,
    sku: s.variant.sku,
    quantityKg: s.quantityKg.toString(),
    status: s.status,
    note: s.note,
    createdAt: s.createdAt.toISOString(),
    lotNumbers: s.allocations.map((a) => a.lot.lotNumber),
  }));

  const onTheWayCount = rows.filter((r) => r.status === "YOLDA").length;
  const deliveredCount = rows.filter((r) => r.status === "TESLIM_EDILDI").length;
  const expiredLotCount = lotRows.reduce(
    (sum, r) => sum + r.lots.filter((l) => l.expired).length,
    0,
  );

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Sevkiyat"
        description="Bayiye giden sevkiyatları oluşturun ve durumunu (hazırlanıyor / yolda / teslim edildi) takip edin."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Toplam Sevkiyat" value={rows.length} href="#sevkiyat-panosu" featured />
        <StatCard label="Yolda" value={onTheWayCount} href="#sevkiyat-panosu" />
        <StatCard label="Teslim Edildi" value={deliveredCount} href="#sevkiyat-panosu" />
      </div>

      <div id="sevkiyat-panosu" className="mt-6">
        <ShipmentBoard shipments={rows} dealers={dealers.map((d) => ({ id: d.id, unvan: d.unvan }))} variants={variants} />
      </div>

      <div className="mt-6">
        <CollapsibleSection
          title="Stok & FEFO Durumu"
          description={
            expiredLotCount > 0
              ? `${expiredLotCount} lotun SKT'si geçmiş — sevk edilemez.`
              : "Ürün bazında lot detayı ve manuel FEFO hesaplayıcı."
          }
        >
          <ShippingBoard rows={lotRows} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
