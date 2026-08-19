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

  const fireKg = summary.expiredOnHandKg.toNumber();
  const emptyVariants = rows.filter((r) => r.shippableKg <= 0).length;
  const lowVariants = rows.filter((r) => r.shippableKg > 0 && r.shippableKg < 50).length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader
        title="Stok & lot"
        count={summary.lotCount}
        description="Varyant bazlı stok, lot/SKT ve giriş-çıkış-fire. Sevkiyat FEFO ile yalnızca sevk edilebilir lotlardan önerilir."
        primaryAction={
          <PillButton href="/panel/sevkiyat" variant="secondary">
            Sevkiyat
          </PillButton>
        }
      />

      <section aria-label="Özet" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Sevk edilebilir"
          value={Math.round(summary.shippableKg.toNumber())}
          unit="kg"
        />
        <StatCard
          label="Fire adayı"
          value={Math.round(summary.expiredOnHandKg.toNumber())}
          unit="kg"
          tone={summary.expiredOnHandKg.toNumber() > 0 ? "danger" : "neutral"}
        />
        <StatCard
          label="SKT eşiği (14 gün)"
          value={summary.expiringSoonCount}
          tone={summary.expiringSoonCount > 0 ? "warning" : "neutral"}
        />
        <StatCard label="Lot sayısı" value={summary.lotCount} />
      </section>

      {(lowVariants > 0 || emptyVariants > 0 || fireKg > 0) && (
        <p className="text-sm text-stone-600 dark:text-zinc-400">
          {lowVariants > 0 ? `${lowVariants} varyantta sevk edilebilir stok 50 kg altında. ` : null}
          {fireKg > 0
            ? `${Math.round(fireKg)} kg SKT geçmiş stok fire bekliyor. `
            : null}
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
