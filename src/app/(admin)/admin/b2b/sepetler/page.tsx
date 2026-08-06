import Link from "next/link";
import { ShoppingCart, UserRound } from "lucide-react";
import { listActiveCartsForAdmin } from "@/infra/db/admin-analytics";
import { money } from "@/domain/money";
import { formatMoney } from "@/lib/format/money";
import { formatDateTime } from "@/lib/format/date";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { PillButton, StatCard } from "@/components/admin/stat-card";

export default async function AdminB2bCartsPage() {
  const carts = await listActiveCartsForAdmin();
  const totalValue = carts.reduce((s, c) => s + c.subtotalKurus, 0);
  const totalUnits = carts.reduce((s, c) => s + c.unitCount, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Açık Sepetler"
        description="Bayi ve misafir sepetleri canlı. Sipariş FSM (M4) gelince buradan onay / dönüşüm eklenecek."
        actions={
          <>
            <PillButton href="/admin/b2b/katalog" variant="secondary">
              B2B katalog
            </PillButton>
            <PillButton href="/admin/siparisler">Siparişler</PillButton>
          </>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Dolu sepet" value={carts.length} href="#sepetler" featured />
        <StatCard label="Toplam adet" value={totalUnits} href="#sepetler" />
        <StatCard
          label="Açık tutar"
          value={Math.round(totalValue / 100)}
          suffix=" ₺"
          href="#sepetler"
        />
      </div>

      <div id="sepetler" className="mt-6 space-y-3">
        {carts.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Açık sepet yok"
            description="Bayiler mağazadan ürün ekledikçe sepetler burada listelenir."
          />
        ) : (
          carts.map((cart) => (
            <article
              key={cart.id}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
            >
              <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <UserRound className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-body-sm font-semibold text-foreground">
                        {cart.dealer?.unvan ??
                          cart.user?.name ??
                          (cart.guestKey ? "Misafir sepet" : "Anonim")}
                      </p>
                      <p className="truncate text-caption text-muted-foreground">
                        {cart.user?.email ??
                          (cart.guestKey ? `Misafir · ${cart.guestKey.slice(0, 8)}…` : cart.id)}
                        {cart.dealer ? ` · ${cart.dealer.status}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-caption text-muted-foreground sm:justify-end">
                  <span>
                    {cart.lineCount} satır · {cart.unitCount} adet
                  </span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {formatMoney(money(cart.subtotalKurus))}
                  </span>
                  <time dateTime={cart.updatedAt.toISOString()}>
                    {formatDateTime(cart.updatedAt)}
                  </time>
                </div>
              </div>

              <ul className="divide-y divide-border">
                {cart.lines.map((line) => (
                  <li
                    key={line.id}
                    className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/urunler/${line.productSlug}`}
                        className="text-body-sm font-medium text-foreground hover:text-brand-700 hover:underline"
                      >
                        {line.productName}
                      </Link>
                      <p className="text-caption text-muted-foreground">
                        {line.sku} · {line.packSize}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-caption tabular-nums">
                      <span className="text-muted-foreground">×{line.quantity}</span>
                      <span className="font-semibold text-foreground">
                        {formatMoney(money(line.unitPriceKurus * line.quantity))}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
