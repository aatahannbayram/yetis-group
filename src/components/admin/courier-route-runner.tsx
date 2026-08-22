"use client";

import { useMemo, useState, useTransition } from "react";
import {
  CheckCircle2,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { cn } from "@/lib/utils";
import {
  startRouteAction,
  markStopEnRouteAction,
  completeStopAction,
} from "@/app/(panel)/panel/rotalar/actions";
import { toast } from "sonner";

type StopOrder = {
  id: string;
  totalKurus: number;
  paymentMethod: string | null;
  paidAt: string | null;
  paymentSlipUrl: string | null;
};

type Stop = {
  id: string;
  sequence: number;
  status: string;
  distanceKm: number | null;
  dealer: {
    id: string;
    unvan: string;
    phone: string | null;
    address: string;
    lat: number | null;
    lng: number | null;
  };
  orders: StopOrder[];
  shipmentCount: number;
};

const PAY_LABEL: Record<string, string> = {
  HAVALE: "Havale",
  CARI: "Cari",
  ONLINE: "Online",
  KAPIDA_NAKIT: "Kapıda nakit",
  KAPIDA_POS: "Kapıda POS",
};

export function CourierRouteRunner({
  route,
}: {
  route: {
    id: string;
    status: string;
    depotLat: number;
    depotLng: number;
    stops: Stop[];
  };
}) {
  const [isPending, startTransition] = useTransition();
  const ordered = useMemo(
    () => [...route.stops].sort((a, b) => a.sequence - b.sequence),
    [route.stops],
  );
  const current =
    ordered.find((s) => s.status === "EN_ROUTE") ??
    ordered.find((s) => s.status === "PENDING") ??
    null;
  const doneCount = ordered.filter((s) => s.status === "DONE" || s.status === "SKIPPED").length;

  function run(action: () => Promise<void>, okMsg: string) {
    startTransition(async () => {
      try {
        await action();
        toast.success(okMsg);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "İşlem başarısız");
      }
    });
  }

  if (route.status === "DRAFT") {
    return (
      <div className="space-y-4 rounded-3xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Rota henüz taslak. Başlattığınızda kurye adımları açılır; duraklar yakından uzağa
          sıralıdır.
        </p>
        <ol className="space-y-2">
          {ordered.map((s) => (
            <li key={s.id} className="flex gap-3 rounded-xl bg-stone-50 px-3 py-2 text-sm">
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {s.sequence + 1}.
              </span>
              <div>
                <p className="font-medium">{s.dealer.unvan}</p>
                <p className="text-xs text-muted-foreground">
                  {s.distanceKm != null ? `${s.distanceKm.toFixed(1)} km` : "mesafe yok"}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <Button
          disabled={isPending}
          className="w-full gap-2"
          onClick={() =>
            run(async () => {
              const fd = new FormData();
              fd.set("routeId", route.id);
              await startRouteAction(fd);
            }, "Rota başladı")
          }
        >
          <Play className="size-4" />
          Rotayı başlat
        </Button>
      </div>
    );
  }

  if (route.status === "DONE" || !current) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-10 text-center">
        <CheckCircle2 className="mx-auto size-10 text-emerald-700" />
        <p className="mt-3 text-lg font-semibold text-emerald-950">Rota tamamlandı</p>
        <p className="mt-1 text-sm text-emerald-800">
          {doneCount}/{ordered.length} durak
        </p>
      </div>
    );
  }

  const mapsHref =
    current.dealer.lat != null && current.dealer.lng != null
      ? `https://www.google.com/maps/dir/?api=1&origin=${route.depotLat},${route.depotLng}&destination=${current.dealer.lat},${current.dealer.lng}`
      : current.dealer.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(current.dealer.address)}`
        : null;

  const unpaidCod = current.orders.filter(
    (o) =>
      (o.paymentMethod === "KAPIDA_NAKIT" || o.paymentMethod === "KAPIDA_POS") && !o.paidAt,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Durak {current.sequence + 1} / {ordered.length}
        </span>
        <span>
          {doneCount} tamamlandı
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-[#1B5E3A] transition-all"
          style={{ width: `${(doneCount / Math.max(ordered.length, 1)) * 100}%` }}
        />
      </div>

      <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="bg-[#1B5E3A] px-5 py-6 text-white">
          <p className="text-xs font-medium tracking-wide text-white/70 uppercase">
            {current.status === "EN_ROUTE" ? "Yoldasınız" : "Sıradaki durak"}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">{current.dealer.unvan}</h2>
          <p className="mt-2 flex items-start gap-2 text-sm text-white/85">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            {current.dealer.address || "Adres yok"}
          </p>
          {current.distanceKm != null ? (
            <p className="mt-2 text-sm text-white/70 tabular-nums">
              Depodan ~{current.distanceKm.toFixed(1)} km
            </p>
          ) : null}
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            {mapsHref ? (
              <a
                href={mapsHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-stone-900 px-3 text-sm font-semibold text-white"
              >
                <Navigation className="size-4" />
                Yol tarifi
                <ExternalLink className="size-3.5 opacity-70" />
              </a>
            ) : null}
            {current.dealer.phone ? (
              <a
                href={`tel:${current.dealer.phone}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold"
              >
                <Phone className="size-4" />
                Ara
              </a>
            ) : null}
          </div>

          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Siparişler · {current.shipmentCount} sevkiyat
            </p>
            <ul className="mt-2 space-y-2">
              {current.orders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2 text-sm"
                >
                  <span>
                    #{o.id.slice(-6)}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {o.paymentMethod ? PAY_LABEL[o.paymentMethod] ?? o.paymentMethod : "-"}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatMoney(money(o.totalKurus))}
                  </span>
                </li>
              ))}
              {current.orders.length === 0 ? (
                <li className="text-sm text-muted-foreground">Bağlı sipariş yok (yalnızca sevkiyat)</li>
              ) : null}
            </ul>
          </div>

          {current.status === "PENDING" ? (
            <Button
              className="w-full"
              disabled={isPending}
              onClick={() =>
                run(async () => {
                  const fd = new FormData();
                  fd.set("stopId", current.id);
                  fd.set("routeId", route.id);
                  await markStopEnRouteAction(fd);
                }, "Yola çıkıldı")
              }
            >
              Bu durağa yola çık
            </Button>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                run(async () => {
                  const fd = new FormData(form);
                  fd.set("stopId", current.id);
                  fd.set("routeId", route.id);
                  await completeStopAction(fd);
                }, "Durak tamamlandı");
              }}
            >
              {unpaidCod.map((o) => (
                <div
                  key={o.id}
                  className="space-y-2 rounded-xl border border-border bg-stone-50 p-3"
                >
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      name="collectOrderId"
                      value={o.id}
                      defaultChecked
                      className="size-4 rounded border-input"
                    />
                    #{o.id.slice(-6)} tahsil et (
                    {o.paymentMethod === "KAPIDA_POS" ? "POS" : "nakit"})
                  </label>
                  {o.paymentMethod === "KAPIDA_POS" ? (
                    <Input
                      type="file"
                      name={`slip-${o.id}`}
                      accept="image/jpeg,image/png,image/webp"
                      required
                    />
                  ) : null}
                </div>
              ))}
              <Button type="submit" className="w-full gap-2" disabled={isPending}>
                <CheckCircle2 className="size-4" />
                Teslim edildi
              </Button>
            </form>
          )}
        </div>
      </article>

      <ul className="space-y-1.5 px-1">
        {ordered.map((s) => (
          <li
            key={s.id}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs",
              s.id === current.id
                ? "bg-emerald-50 font-semibold text-emerald-900"
                : s.status === "DONE"
                  ? "text-muted-foreground line-through"
                  : "text-muted-foreground",
            )}
          >
            <span className="w-5 tabular-nums">{s.sequence + 1}</span>
            <span className="truncate">{s.dealer.unvan}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
