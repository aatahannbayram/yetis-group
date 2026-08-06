"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Truck, PackageCheck, Plus, CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { createShipmentAction, updateShipmentStatusAction } from "@/app/(admin)/admin/sevkiyat/actions";
import type { ShipmentStatus } from "@/domain/shipment";

export type ShipmentRow = {
  id: string;
  dealerId: string;
  dealerName: string;
  productName: string;
  packLabel: string;
  sku: string;
  quantityKg: string;
  status: ShipmentStatus;
  note: string | null;
  createdAt: string;
  lotNumbers: string[];
};

const COLUMNS: { status: ShipmentStatus; label: string; hint: string }[] = [
  { status: "HAZIRLANIYOR", label: "Hazırlanıyor", hint: "Stoktan ayrıldı, sevkiyata hazır" },
  { status: "YOLDA", label: "Yolda", hint: "Bayiye doğru yola çıktı" },
  { status: "TESLIM_EDILDI", label: "Teslim Edildi", hint: "Bayi teslim aldı" },
];

const kgFormatter = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 3 });

function ShipmentCard({ shipment }: { shipment: ShipmentRow }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function advance(status: ShipmentStatus) {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("shipmentId", shipment.id);
      formData.set("status", status);
      try {
        await updateShipmentStatusAction(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Durum güncellenemedi.");
      }
    });
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <p className="font-semibold text-neutral-900">{shipment.dealerName}</p>
      <p className="mt-0.5 text-body-sm text-neutral-600">
        {shipment.productName} · {shipment.packLabel}
      </p>
      <p className="mt-1 tabular-nums text-caption text-muted-foreground">
        {kgFormatter.format(Number(shipment.quantityKg))} kg
        {shipment.lotNumbers.length > 0 ? ` · ${shipment.lotNumbers.join(", ")}` : ""}
      </p>
      {shipment.note ? <p className="mt-1 text-caption text-neutral-500">{shipment.note}</p> : null}

      {error ? (
        <p className="mt-2 flex items-center gap-1 text-caption text-danger-fg">
          <CircleAlert className="size-3.5" />
          {error}
        </p>
      ) : null}

      {shipment.status === "HAZIRLANIYOR" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => advance("YOLDA")}
          className="mt-3 w-full gap-1.5"
        >
          <Truck className="size-3.5" />
          Yola Çıkar
        </Button>
      ) : null}
      {shipment.status === "YOLDA" ? (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => advance("TESLIM_EDILDI")}
          className="mt-3 w-full gap-1.5"
        >
          <PackageCheck className="size-3.5" />
          Teslim Edildi Olarak İşaretle
        </Button>
      ) : null}
    </motion.div>
  );
}

export function ShipmentBoard({
  shipments,
  dealers,
  variants,
}: {
  shipments: ShipmentRow[];
  dealers: { id: string; unvan: string }[];
  variants: { id: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        await createShipmentAction(formData);
        setOpen(false);
      } catch (e) {
        setFormError(e instanceof Error ? e.message : "Sevkiyat oluşturulamadı.");
      }
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setOpen(true)} className="gap-1.5">
          <Plus className="size-4" />
          Yeni Sevkiyat
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = shipments.filter((s) => s.status === col.status);
          return (
            <div key={col.status} className="rounded-3xl bg-muted/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-900">{col.label}</p>
                  <p className="text-caption text-muted-foreground">{col.hint}</p>
                </div>
                <Badge variant="outline">{items.length}</Badge>
              </div>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {items.map((s) => (
                    <ShipmentCard key={s.id} shipment={s} />
                  ))}
                </AnimatePresence>
                {items.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border py-6 text-center text-caption text-muted-foreground">
                    Boş
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Yeni Sevkiyat</SheetTitle>
            <SheetDescription>
              Miktar girildiğinde lotlar otomatik olarak FEFO sırasıyla (en erken SKT önce) ayrılır.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreate} className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
            <div className="space-y-1">
              <label className="text-caption text-muted-foreground">Bayi / Müşteri</label>
              <select
                name="dealerId"
                required
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              >
                <option value="">Seçin…</option>
                {dealers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.unvan}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-caption text-muted-foreground">Ürün</label>
              <select
                name="variantId"
                required
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              >
                <option value="">Seçin…</option>
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-caption text-muted-foreground">Miktar (kg)</label>
              <Input name="quantityKg" type="number" step="0.001" min="0.001" required />
            </div>

            <div className="space-y-1">
              <label className="text-caption text-muted-foreground">Not (opsiyonel)</label>
              <Input name="note" placeholder="Sipariş referansı, irsaliye no vb." />
            </div>

            {formError ? (
              <p className="flex items-center gap-1.5 rounded-lg bg-danger-bg px-3 py-2 text-caption text-danger-fg">
                <CircleAlert className="size-3.5 shrink-0" />
                {formError}
              </p>
            ) : null}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Oluşturuluyor…" : "Sevkiyat Oluştur"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
