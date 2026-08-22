import Link from "next/link";
import { ShoppingCart, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/admin/stat-card";
import { OrderBoard, type OrderRow } from "@/components/admin/order-board";
import { listOrders } from "@/infra/db/orders";
import { listDealers, listPriceListOptions } from "@/infra/db/dealers";
import { listShippableVariants } from "@/infra/db/shipments";
import { listActiveCartsForAdmin } from "@/infra/db/admin-analytics";
import { formatMoney } from "@/lib/format/money";
import { formatDateTime } from "@/lib/format/date";
import { money } from "@/domain/money";
import { packLabel } from "@/lib/format/packaging";

const QUEUE_STATUSES = ["SUBMITTED", "UNDER_REVIEW"] as const;

export default async function OnayKuyruguPage() {
  const [queueOrders, dealers, variants, priceLists, carts] = await Promise.all([
    listOrders({ statusIn: [...QUEUE_STATUSES] }),
    listDealers(),
    listShippableVariants(),
    listPriceListOptions(),
    listActiveCartsForAdmin(),
  ]);

  const rows: OrderRow[] = queueOrders.map((o) => ({
    id: o.id,
    dealerId: o.dealerId,
    dealerName: o.dealer.unvan,
    dealerType: o.dealer.dealerType,
    status: o.status,
    totalKurus: o.totalKurus,
    note: o.note,
    paymentMethod: o.paymentMethod,
    paidAt: o.paidAt?.toISOString() ?? null,
    paymentSlipUrl: o.paymentSlipUrl ?? null,
    codCollectedAt: o.codCollectedAt?.toISOString() ?? null,
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

  const submittedCount = rows.filter((r) => r.status === "SUBMITTED").length;
  const reviewCount = rows.filter((r) => r.status === "UNDER_REVIEW").length;
  const queueTotalKurus = rows.reduce((sum, r) => sum + r.totalKurus, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        title="Onay kuyruğu"
        description="Onay bekleyen siparişler ve dolu sepetler tek yerde."
        count={rows.length + carts.length}
      />

      <section aria-label="Özet" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Yeni gelen"
          value={submittedCount}
          tone={submittedCount > 0 ? "info" : "neutral"}
          href="#siparis-kuyrugu"
        />
        <StatCard
          label="İncelemede"
          value={reviewCount}
          tone={reviewCount > 0 ? "warning" : "neutral"}
          href="#siparis-kuyrugu"
        />
        <StatCard
          label="Kuyruk tutarı"
          value={formatMoney(money(queueTotalKurus))}
          href="#siparis-kuyrugu"
        />
        <StatCard
          label="Dolu sepet"
          value={carts.length}
          href="#sepet-kuyrugu"
          tone={carts.length > 0 ? "info" : "neutral"}
        />
      </section>

      <div id="siparis-kuyrugu" className="space-y-3">
        <h2 className="text-body-lg font-semibold text-[var(--text-primary)]">
          Onay bekleyen siparişler
        </h2>
        {rows.length > 0 ? (
          <OrderBoard
            orders={rows}
            dealers={dealers.map((d) => ({
              id: d.id,
              unvan: d.unvan,
              paymentMethod: d.paymentMethod,
              creditLimitKurus: d.creditLimitKurus,
            }))}
            variants={variants}
            priceLists={priceLists}
          />
        ) : (
          <EmptyState
            icon={ShoppingCart}
            title="Onay bekleyen sipariş yok"
            description="Gönderilen veya incelemeye alınan sipariş olduğunda burada listelenir."
          />
        )}
      </div>

      <div id="sepet-kuyrugu" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-body-lg font-semibold text-[var(--text-primary)]">Dolu sepetler</h2>
          <Link
            href="/panel/b2b/sepetler"
            className="inline-flex items-center gap-1 text-[length:var(--text-caption)] font-medium text-[var(--primary-text)] hover:underline"
          >
            Tümünü gör
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        {carts.length > 0 ? (
          <div className="divide-y divide-[var(--border)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
            {carts.slice(0, 8).map((cart) => {
              const ownerLabel = cart.dealer?.unvan ?? cart.user?.name ?? "Misafir sepet";
              return (
                <div
                  key={cart.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--text-primary)]" title={ownerLabel}>
                      {ownerLabel}
                    </p>
                    <p className="text-[length:var(--text-caption)] text-[var(--text-muted)]">
                      {cart.lines.length} satır · {formatDateTime(cart.updatedAt)}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums text-[var(--text-primary)]">
                    {formatMoney(money(cart.subtotalKurus))}
                  </p>
                </div>
              );
            })}
            {carts.length > 8 ? (
              <div className="px-4 py-2.5 text-center text-[length:var(--text-caption)] text-[var(--text-muted)]">
                +{carts.length - 8} sepet daha - tümünü görmek için{" "}
                <Link href="/panel/b2b/sepetler" className="font-medium text-[var(--primary-text)] hover:underline">
                  açık sepetlere git
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
          <EmptyState
            icon={ShoppingCart}
            title="Dolu sepet yok"
            description="Bayiler sepete ürün ekledikçe burada listelenir."
          />
        )}
      </div>
    </div>
  );
}
