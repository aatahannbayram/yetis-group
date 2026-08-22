import Link from "next/link";
import { Route } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listRoutes, listRoutableDealers, getDepotPoint } from "@/infra/db/routes";
import { prisma } from "@/infra/db/client";
import { RoutePlanner } from "@/components/admin/route-planner";
import { formatDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Taslak",
  ACTIVE: "Aktif",
  DONE: "Tamamlandı",
  CANCELLED: "İptal",
};

export default async function AdminRoutesPage() {
  const [routes, routable, depot, staffUsers] = await Promise.all([
    listRoutes(),
    listRoutableDealers(),
    getDepotPoint(),
    prisma.user.findMany({
      where: { accountType: "STAFF" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <AdminPageHeader
        title="Rota planı"
        description="Depodan yakından uzağa sıralı teslimat. Adım adım oluşturun, kurye ekranından yürütün."
      />

      {!depot ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Depo konumu tanımlı değil.{" "}
          <Link href="/panel/ayarlar" className="font-semibold underline">
            Ayarlar
          </Link>
          {" "}sayfasından depo lat/lng girin.
        </div>
      ) : null}

      <RoutePlanner
        depot={depot}
        routableDealers={routable.map((d) => ({
          id: d.id,
          unvan: d.unvan,
          city: d.city,
          district: d.district,
          lat: d.lat,
          lng: d.lng,
          shipmentCount: d.shipmentIds.length,
          orderCount: d.orderIds.length,
          hasGeo: d.lat != null && d.lng != null,
        }))}
        staffUsers={staffUsers}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Kayıtlı rotalar
        </h2>
        {routes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Henüz rota yok. Yukarıdaki sihirbazdan oluşturun.
          </p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {routes.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Route className="size-4 text-brand-700" aria-hidden />
                    <p className="font-semibold">{formatDate(r.date)}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        r.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800"
                          : r.status === "DRAFT"
                            ? "bg-stone-100 text-stone-700"
                            : "bg-sky-50 text-sky-800",
                      )}
                    >
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.stops.length} durak
                    {r.assignedUser ? ` · ${r.assignedUser.name}` : ""}
                    {r.depotLabel ? ` · ${r.depotLabel}` : ""}
                  </p>
                </div>
                <Link
                  href={`/panel/rota/${r.id}`}
                  className="inline-flex h-9 items-center rounded-lg bg-[#1B5E3A] px-3 text-sm font-semibold text-white hover:bg-[#164e31]"
                >
                  {r.status === "DRAFT" ? "Düzenle / başlat" : "Kurye ekranı"}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
