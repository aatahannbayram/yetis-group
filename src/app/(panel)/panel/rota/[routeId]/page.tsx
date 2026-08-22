import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getRouteById } from "@/infra/db/routes";
import { CourierRouteRunner } from "@/components/admin/courier-route-runner";
import { formatDate } from "@/lib/format/date";

export default async function CourierRoutePage({
  params,
}: {
  params: Promise<{ routeId: string }>;
}) {
  const { routeId } = await params;
  const route = await getRouteById(routeId);
  if (!route) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-16">
      <Link
        href="/panel/rotalar"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Rotalara dön
      </Link>

      <header className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Kurye rotası
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{formatDate(route.date)}</h1>
        <p className="text-sm text-muted-foreground">
          {route.depotLabel || "Depo"} · {route.stops.length} durak
          {route.assignedUser ? ` · ${route.assignedUser.name}` : ""}
        </p>
      </header>

      <CourierRouteRunner
        route={{
          id: route.id,
          status: route.status,
          depotLat: Number(route.depotLat),
          depotLng: Number(route.depotLng),
          stops: route.stops.map((s) => ({
            id: s.id,
            sequence: s.sequence,
            status: s.status,
            distanceKm: s.distanceKm != null ? Number(s.distanceKm) : null,
            dealer: {
              id: s.dealer.id,
              unvan: s.dealer.unvan,
              phone: s.dealer.phone,
              address:
                s.dealer.deliveryAddressLine ||
                [s.dealer.addressLine, s.dealer.district, s.dealer.city]
                  .filter(Boolean)
                  .join(", "),
              lat: s.dealer.lat != null ? Number(s.dealer.lat) : null,
              lng: s.dealer.lng != null ? Number(s.dealer.lng) : null,
            },
            orders: s.orders.map((link) => ({
              id: link.order.id,
              totalKurus: link.order.totalKurus,
              paymentMethod: link.order.paymentMethod,
              paidAt: link.order.paidAt?.toISOString() ?? null,
              paymentSlipUrl: link.order.paymentSlipUrl,
            })),
            shipmentCount: s.shipments.length,
          })),
        }}
      />
    </div>
  );
}
