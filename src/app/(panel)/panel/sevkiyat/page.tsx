import { ShippingListPage } from "@/features/staff/shipping/shipping-list-page";
import type { ShipmentRow } from "@/components/admin/shipment-board";
import { listShipments, listShippableVariants } from "@/infra/db/shipments";
import { listDealers } from "@/infra/db/dealers";
import { getShippingOverview } from "@/infra/db/shipping";

export default async function PanelShipmentsPage() {
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

  return (
    <ShippingListPage
      lotRows={lotRows}
      shipments={rows}
      dealers={dealers.map((d) => ({ id: d.id, unvan: d.unvan }))}
      variants={variants}
    />
  );
}
