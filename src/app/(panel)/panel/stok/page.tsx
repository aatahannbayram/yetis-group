import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, PillButton } from "@/components/admin/stat-card";
import {
  getInventoryDashboardSummary,
  getStockBoard,
  listVariantsForStockPicker,
} from "@/infra/db/inventory";
import { StockBoard } from "@/components/admin/stock-board";

export default async function PanelStokPage() {
  const [summary, rows, variants] = await Promise.all([
    getInventoryDashboardSummary(),
    getStockBoard(),
    listVariantsForStockPicker(),
  ]);

  const emptyVariants = rows.filter((r) => r.shippableKg <= 0).length;
  const lowVariants = rows.filter((r) => r.shippableKg > 0 && r.shippableKg < 50).length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader
        title="Stok & lot"
        count={summary.lotCount}
        description="Varyant bazlı stok, lot/SKT ve giriş-çıkış. Sevkiyat FEFO ile bu lotlardan önerilir."
        primaryAction={
          <PillButton href="/panel/sevkiyat" variant="secondary">
            Sevkiyat
          </PillButton>
        }
      />

      <section aria-label="Özet" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam stok"
          value={Math.round(summary.totalKg.toNumber())}
          unit="kg"
        />
        <StatCard label="Lot sayısı" value={summary.lotCount} />
        <StatCard
          label="SKT eşiği (14 gün)"
          value={summary.expiringSoonCount}
          tone={summary.expiringSoonCount > 0 ? "warning" : "neutral"}
        />
        <StatCard
          label="SKT geçmiş / stoksuz varyant"
          value={summary.expiredCount}
          tone={summary.expiredCount > 0 || emptyVariants > 0 ? "danger" : "neutral"}
        />
      </section>

      {(lowVariants > 0 || emptyVariants > 0) && (
        <p className="text-sm text-stone-600 dark:text-zinc-400">
          {lowVariants > 0 ? `${lowVariants} varyantta stok 50 kg altında. ` : null}
          {emptyVariants > 0 ? (
            <>
              {emptyVariants} varyant sevk edilemez.{" "}
              <Link href="/panel/urunler" className="font-semibold text-[#1B5E3A] hover:underline">
                Ürünler
              </Link>
            </>
          ) : null}
        </p>
      )}

      <StockBoard rows={rows} variants={variants} />
    </div>
  );
}
