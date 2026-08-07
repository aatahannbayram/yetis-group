import Link from "next/link";
import { ArrowRight, Package, Truck } from "lucide-react";
import { requireDealerPortal } from "@/features/dealer/portal-context";
import { listShipmentsForDealer } from "@/infra/db/shipments";
import { formatDate, formatDateTime } from "@/lib/format/date";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  HAZIRLANIYOR: "Hazırlanıyor",
  YOLDA: "Yolda",
  TESLIM_EDILDI: "Teslim edildi",
  IPTAL: "İptal",
};

const STATUS_TONE: Record<string, string> = {
  HAZIRLANIYOR: "bg-amber-50 text-amber-900 border-amber-200",
  YOLDA: "bg-sky-50 text-sky-900 border-sky-200",
  TESLIM_EDILDI: "bg-[var(--primary-subtle)] text-[var(--primary-text)] border-[var(--primary-solid)]/20",
  IPTAL: "bg-stone-100 text-stone-600 border-stone-200",
};

export default async function BayiTeslimatPage() {
  const { dealerId } = await requireDealerPortal();
  const shipments = await listShipmentsForDealer(dealerId);

  const active = shipments.filter((s) => s.status === "HAZIRLANIYOR" || s.status === "YOLDA");
  const kgFmt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 3 });

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--panel-border)] pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--panel-ink)]">Teslimatım</h1>
          <p className="mt-1 text-sm text-[var(--panel-ink-muted)]">
            Sevkiyat durumu ve lot bilgisi
          </p>
        </div>
        <p className="text-sm tabular-nums text-[var(--panel-ink-muted)]">
          {active.length} aktif · {shipments.length} toplam
        </p>
      </header>

      {shipments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--panel-border)] bg-white px-6 py-14 text-center">
          <Truck className="mx-auto size-8 text-[var(--panel-ink-muted)]" aria-hidden />
          <p className="mt-3 font-medium text-[var(--panel-ink)]">Henüz sevkiyat yok</p>
          <p className="mt-1 text-sm text-[var(--panel-ink-muted)]">
            Siparişiniz onaylanıp hazırlandığında burada görünür.
          </p>
          <Link
            href="/bayi/siparis"
            className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-lg bg-[var(--panel-ink)] px-4 text-sm font-semibold text-white"
          >
            Sipariş ver <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--panel-border)] overflow-hidden rounded-xl border border-[var(--panel-border)] bg-white">
          {shipments.map((s) => (
            <li key={s.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Package className="size-4 text-[var(--panel-ink-muted)]" aria-hidden />
                  <p className="font-semibold text-[var(--panel-ink)]">
                    {s.variant.product.name}
                  </p>
                  <span
                    className={cn(
                      "rounded border px-2 py-0.5 text-[11px] font-medium",
                      STATUS_TONE[s.status] ?? STATUS_TONE.IPTAL,
                    )}
                  >
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                </div>
                <p className="text-xs text-[var(--panel-ink-muted)]">
                  {s.variant.packSize ?? s.variant.packagingType} · {s.variant.sku} ·{" "}
                  {kgFmt.format(Number(s.quantityKg))} kg
                  {s.order ? ` · Sipariş #${s.order.id.slice(-6)}` : ""}
                </p>
                {s.allocations.length > 0 ? (
                  <p className="text-xs text-[var(--panel-ink-muted)]">
                    Lot:{" "}
                    {s.allocations
                      .map((a) => `${a.lot.lotNumber} (${kgFmt.format(Number(a.quantityKg))} kg)`)
                      .join(", ")}
                  </p>
                ) : null}
                <p className="text-[11px] text-[var(--panel-ink-muted)]">
                  Oluşturma: {formatDate(s.createdAt)}
                  {s.shippedAt ? ` · Çıkış: ${formatDateTime(s.shippedAt)}` : ""}
                  {s.deliveredAt ? ` · Teslim: ${formatDateTime(s.deliveredAt)}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
