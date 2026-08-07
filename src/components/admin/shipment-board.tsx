"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "motion/react";
import { Truck, PackageCheck, Plus, CircleAlert, GripVertical, Ban, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { createShipmentAction, updateShipmentStatusAction } from "@/app/(panel)/panel/sevkiyat/actions";
import { canTransitionShipment, type ShipmentStatus } from "@/domain/shipment";
import { lotPartyLabel } from "@/lib/format/lot";
import { cn } from "@/lib/utils";

export type ShipmentRow = {
  id: string;
  dealerId: string;
  dealerName: string;
  dealerType: string;
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

const DEALER_TYPE_COLOR: Record<string, string> = {
  BAYI: "bg-[var(--primary-subtle)] text-[var(--primary-text)]",
  HORECA: "bg-[var(--warning-subtle)] text-[var(--warning-text)]",
  ZINCIR: "bg-[var(--info-subtle)] text-[var(--info-text)]",
  ARA_TOPTANCI: "bg-[var(--neutral-subtle)] text-[var(--neutral-text)]",
};

const kgFormatter = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 3 });

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "bugün";
  if (days === 1) return "dün";
  return `${days} gün önce`;
}

function ShipmentCardContent({
  shipment,
  onAdvance,
  onCancel,
  isPending,
  error,
  dragHandleProps,
}: {
  shipment: ShipmentRow;
  onAdvance?: () => void;
  onCancel?: () => void;
  isPending?: boolean;
  error?: string | null;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full text-caption font-semibold",
            DEALER_TYPE_COLOR[shipment.dealerType] ?? "bg-muted text-muted-foreground",
          )}
        >
          {initials(shipment.dealerName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-neutral-900">{shipment.dealerName}</p>
          <p className="text-caption text-muted-foreground">{timeAgo(shipment.createdAt)}</p>
        </div>
        {dragHandleProps ? (
          <div
            {...dragHandleProps}
            className="-mr-1 -mt-1 flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-muted hover:text-neutral-500 active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-muted/50 px-3 py-2">
        <Package className="size-3.5 shrink-0 text-muted-foreground" />
        <p className="min-w-0 flex-1 truncate text-body-sm text-neutral-700">
          {shipment.productName} <span className="text-muted-foreground">· {shipment.packLabel}</span>
        </p>
        <span className="shrink-0 tabular-nums text-body-sm font-semibold text-neutral-900">
          {kgFormatter.format(Number(shipment.quantityKg))} kg
        </span>
      </div>

      {shipment.lotNumbers.length > 0 ? (
        <p className="mt-2 truncate text-caption text-muted-foreground">
          {shipment.lotNumbers.map(lotPartyLabel).join(" · ")}
        </p>
      ) : null}
      {shipment.note ? <p className="mt-1 text-caption text-neutral-500">{shipment.note}</p> : null}

      {error ? (
        <p className="mt-2 flex items-center gap-1 text-caption text-danger-fg">
          <CircleAlert className="size-3.5" />
          {error}
        </p>
      ) : null}

      {onAdvance || onCancel ? (
        <div className="mt-3 flex items-center gap-1.5">
          {onAdvance ? (
            <Button
              size="sm"
              variant={shipment.status === "HAZIRLANIYOR" ? "outline" : "default"}
              disabled={isPending}
              onClick={onAdvance}
              className="flex-1 gap-1.5"
            >
              {shipment.status === "HAZIRLANIYOR" ? (
                <Truck className="size-3.5" />
              ) : (
                <PackageCheck className="size-3.5" />
              )}
              {shipment.status === "HAZIRLANIYOR" ? "Yola Çıkar" : "Teslim Edildi"}
            </Button>
          ) : null}
          {onCancel ? (
            <Button
              size="icon-sm"
              variant="ghost"
              disabled={isPending}
              onClick={onCancel}
              title="Sevkiyatı iptal et"
              className="shrink-0 text-neutral-400 hover:text-danger-fg"
            >
              <Ban className="size-3.5" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function DraggableShipmentCard({
  shipment,
  onStatusChange,
}: {
  shipment: ShipmentRow;
  onStatusChange: (id: string, status: ShipmentStatus) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: shipment.id,
  });

  function run(status: ShipmentStatus) {
    setError(null);
    startTransition(async () => {
      try {
        await onStatusChange(shipment.id, status);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Durum güncellenemedi.");
      }
    });
  }

  const nextStatus: ShipmentStatus | null =
    shipment.status === "HAZIRLANIYOR" ? "YOLDA" : shipment.status === "YOLDA" ? "TESLIM_EDILDI" : null;

  return (
    <motion.div
      ref={setNodeRef}
      layout
      layoutId={shipment.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.35 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{ transform: transform ? CSS.Translate.toString(transform) : undefined }}
    >
      <ShipmentCardContent
        shipment={shipment}
        onAdvance={nextStatus ? () => run(nextStatus) : undefined}
        onCancel={
          shipment.status === "HAZIRLANIYOR" || shipment.status === "YOLDA"
            ? () => run("IPTAL")
            : undefined
        }
        isPending={isPending}
        error={error}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </motion.div>
  );
}

function Column({
  status,
  label,
  hint,
  items,
  onStatusChange,
}: {
  status: ShipmentStatus;
  label: string;
  hint: string;
  items: ShipmentRow[];
  onStatusChange: (id: string, status: ShipmentStatus) => Promise<void>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-3xl p-4 transition-colors",
        isOver ? "bg-brand-50 ring-2 ring-brand-300" : "bg-muted/40",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-neutral-900">{label}</p>
          <p className="text-caption text-muted-foreground">{hint}</p>
        </div>
        <Badge variant="outline">{items.length}</Badge>
      </div>
      <div className="min-h-24 space-y-3">
        <AnimatePresence mode="popLayout">
          {items.map((s) => (
            <DraggableShipmentCard key={s.id} shipment={s} onStatusChange={onStatusChange} />
          ))}
        </AnimatePresence>
        {items.length === 0 ? (
          <div
            className={cn(
              "rounded-xl border border-dashed py-6 text-center text-caption",
              isOver ? "border-brand-400 text-brand-600" : "border-border text-muted-foreground",
            )}
          >
            {isOver ? "Bırak" : "Boş"}
          </div>
        ) : null}
      </div>
    </div>
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
  const [items, setItems] = useState(shipments);
  const [syncedShipments, setSyncedShipments] = useState(shipments);
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);

  if (shipments !== syncedShipments) {
    setSyncedShipments(shipments);
    setItems(shipments);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function submitStatusChange(id: string, status: ShipmentStatus) {
    const formData = new FormData();
    formData.set("shipmentId", id);
    formData.set("status", status);
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    try {
      await updateShipmentStatusAction(formData);
    } catch (e) {
      setItems(shipments);
      throw e;
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const shipment = items.find((s) => s.id === active.id);
    if (!shipment) return;
    const targetStatus = over.id as ShipmentStatus;
    if (shipment.status === targetStatus) return;
    if (!canTransitionShipment(shipment.status, targetStatus)) return;
    void submitStatusChange(shipment.id, targetStatus).catch(() => {});
  }

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

  const activeShipment = items.find((s) => s.id === activeId) ?? null;

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-caption text-muted-foreground">
          Kartları sürükleyip bırakarak durumu güncelleyebilirsiniz.
        </p>
        <Button onClick={() => setOpen(true)} className="gap-1.5">
          <Plus className="size-4" />
          Yeni Sevkiyat
        </Button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((col) => (
            <Column
              key={col.status}
              status={col.status}
              label={col.label}
              hint={col.hint}
              items={items.filter((s) => s.status === col.status)}
              onStatusChange={submitStatusChange}
            />
          ))}
        </div>

        <DragOverlay>
          {activeShipment ? (
            <div className="rotate-2 opacity-95">
              <ShipmentCardContent shipment={activeShipment} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Yeni Sevkiyat</SheetTitle>
            <SheetDescription>
              Lotlar en erken SKT sırasıyla ayrılır.
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
