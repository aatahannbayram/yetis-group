"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createRouteAction } from "@/app/(panel)/panel/rotalar/actions";
import { toast } from "sonner";

type RoutableDealer = {
  id: string;
  unvan: string;
  city: string | null;
  district: string | null;
  lat: number | null;
  lng: number | null;
  shipmentCount: number;
  orderCount: number;
  hasGeo: boolean;
};

const STEPS = ["Tarih & atama", "Bayi seç", "Önizle & oluştur"] as const;

export function RoutePlanner({
  depot,
  routableDealers,
  staffUsers,
}: {
  depot: { label: string; lat: number; lng: number } | null;
  routableDealers: RoutableDealer[];
  staffUsers: { id: string; name: string; email: string }[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [assignedUserId, setAssignedUserId] = useState("");
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const selectedDealers = useMemo(
    () => routableDealers.filter((d) => selected.has(d.id)),
    [routableDealers, selected],
  );

  function toggle(id: string, hasGeo: boolean) {
    if (!hasGeo) {
      toast.error("Bu bayinin konumu yok; önce lat/lng girin");
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function create() {
    if (!depot) {
      toast.error("Depo konumu gerekli");
      return;
    }
    if (selected.size === 0) {
      toast.error("En az bir bayi seçin");
      return;
    }
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("date", date);
        if (assignedUserId) fd.set("assignedUserId", assignedUserId);
        if (note.trim()) fd.set("note", note.trim());
        for (const id of selected) fd.append("dealerId", id);
        const id = await createRouteAction(fd);
        toast.success("Rota oluşturuldu");
        if (id) router.push(`/panel/rota/${id}`);
        else router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Rota oluşturulamadı");
      }
    });
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_1px_2px_rgb(33_28_22/0.04)]">
      <div className="border-b border-border bg-stone-50/80 px-4 py-3 dark:bg-zinc-950/40">
        <ol className="flex flex-wrap gap-2">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  i === step
                    ? "bg-[#1B5E3A] text-white"
                    : i < step
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-white text-stone-500 ring-1 ring-stone-200",
                )}
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-black/10 text-[10px]">
                  {i < step ? <Check className="size-3" /> : i + 1}
                </span>
                {label}
              </button>
              {i < STEPS.length - 1 ? (
                <ChevronRight className="size-3.5 text-stone-300" aria-hidden />
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-4 p-5">
        {step === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Teslimat tarihi</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Atanan personel</label>
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="">Seçilmedi</option>
                {staffUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Not</label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Örn. Sabah Avrupa yakası"
              />
            </div>
            {depot ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
                <MapPin className="size-4 text-brand-700" aria-hidden />
                Depo: {depot.label} ({depot.lat.toFixed(4)}, {depot.lng.toFixed(4)})
              </p>
            ) : null}
            <div className="sm:col-span-2">
              <Button type="button" onClick={() => setStep(1)} disabled={!depot}>
                Devam
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sevkiyat bekleyen bayiler. Konumu olanlar seçilebilir; sıra depodan yakına göre
              otomatik hesaplanır.
            </p>
            {routableDealers.length === 0 ? (
              <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                Bekleyen sevkiyat yok.
              </p>
            ) : (
              <ul className="max-h-80 space-y-2 overflow-y-auto">
                {routableDealers.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => toggle(d.id, d.hasGeo)}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                        selected.has(d.id)
                          ? "border-[#1B5E3A] bg-emerald-50/60"
                          : "border-border hover:bg-muted/40",
                        !d.hasGeo && "opacity-60",
                      )}
                    >
                      <div>
                        <p className="font-medium">{d.unvan}</p>
                        <p className="text-xs text-muted-foreground">
                          {[d.district, d.city].filter(Boolean).join(", ") || "Adres yok"}
                          {" · "}
                          {d.shipmentCount} sevkiyat
                          {d.orderCount ? ` · ${d.orderCount} sipariş` : ""}
                        </p>
                        {!d.hasGeo ? (
                          <p className="mt-1 text-[11px] text-amber-700">Konum eksik</p>
                        ) : null}
                      </div>
                      <span
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                          selected.has(d.id)
                            ? "border-[#1B5E3A] bg-[#1B5E3A] text-white"
                            : "border-stone-300",
                        )}
                      >
                        {selected.has(d.id) ? <Check className="size-3" /> : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(0)}>
                Geri
              </Button>
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={selected.size === 0}
              >
                Önizle ({selected.size})
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Oluşturulunca duraklar depodan yakından uzağa sıralanır. Kurye ekranında ince ayar ve
              yürütme yapılır.
            </p>
            <ul className="space-y-2">
              {selectedDealers.map((d, i) => (
                <li
                  key={d.id}
                  className="flex items-center gap-3 rounded-xl border border-border px-3 py-2"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-stone-100 text-xs font-bold tabular-nums">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{d.unvan}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.hasGeo
                        ? `${d.lat!.toFixed(4)}, ${d.lng!.toFixed(4)}`
                        : "Konum yok"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Geri
              </Button>
              <Button type="button" disabled={isPending || !depot} onClick={create} className="gap-1.5">
                <Truck className="size-4" />
                Rotayı oluştur
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
