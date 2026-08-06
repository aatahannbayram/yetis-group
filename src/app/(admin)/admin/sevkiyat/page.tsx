import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatCard } from "@/components/admin/stat-card";
import { ShippingBoard } from "@/components/admin/shipping-board";
import { getShippingOverview } from "@/infra/db/shipping";

export default async function AdminShipmentsPage() {
  const rows = await getShippingOverview();

  const expiredLotCount = rows.reduce(
    (sum, r) => sum + r.lots.filter((l) => l.expired).length,
    0,
  );
  const soonLotCount = rows.reduce(
    (sum, r) => sum + r.lots.filter((l) => l.expiringSoon).length,
    0,
  );
  const totalLotCount = rows.reduce((sum, r) => sum + r.lots.length, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Sevkiyat"
        description="FEFO sevkiyat önerisi: en erken SKT'li lot önce çıkar. Süresi geçmiş lot hiçbir zaman önerilmez."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Toplam Lot" value={totalLotCount} href="#sevkiyat-panosu" featured />
        <StatCard
          label="SKT Yaklaşan (14 gün)"
          value={soonLotCount}
          warn={soonLotCount > 0}
          href="#sevkiyat-panosu"
        />
        <StatCard
          label="SKT Geçmiş"
          value={expiredLotCount}
          warn={expiredLotCount > 0}
          href="#sevkiyat-panosu"
        />
      </div>

      <div id="sevkiyat-panosu" className="mt-6">
        <ShippingBoard rows={rows} />
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-caption text-muted-foreground">
          Henüz lot kaydı yok — ürün detayına girip lot ekleyin.
        </p>
      ) : null}
    </div>
  );
}
