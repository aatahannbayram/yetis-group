"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Plus,
  CircleAlert,
  Trash2,
  FileText,
  Send,
  Search,
  CheckCircle2,
  PackageCheck,
  Truck,
  Ban,
  XCircle,
  ClipboardCheck,
  ChevronRight,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { formatDateTime } from "@/lib/format/date";
import { cn } from "@/lib/utils";
import {
  createOrderAction,
  transitionOrderAction,
  createShipmentFromOrderAction,
} from "@/app/(admin)/admin/siparisler/actions";
import { nextOrderStatuses, type OrderStatus } from "@/domain/order/state-machine";

export type OrderLineRow = {
  id: string;
  variantId: string;
  productName: string;
  imageUrl: string | null;
  packLabel: string;
  quantity: number;
  unitPriceKurus: number;
  lineTotalKurus: number;
};

export type OrderEventRow = {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
};

export type ShipmentSummaryRow = {
  id: string;
  status: string;
  quantityKg: string;
  lotNumbers: string[];
};

export type OrderRow = {
  id: string;
  dealerId: string;
  dealerName: string;
  dealerType: string;
  status: OrderStatus;
  totalKurus: number;
  note: string | null;
  createdAt: string;
  lines: OrderLineRow[];
  events: OrderEventRow[];
  shipments: ShipmentSummaryRow[];
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  DRAFT: "Taslak",
  SUBMITTED: "Gönderildi",
  UNDER_REVIEW: "İncelemede",
  CONFIRMED: "Onaylandı",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Yolda",
  DELIVERED: "Teslim Edildi",
  REJECTED: "Reddedildi",
  CANCELLED: "İptal Edildi",
};

const STATUS_VARIANT: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "outline",
  SUBMITTED: "outline",
  UNDER_REVIEW: "secondary",
  CONFIRMED: "secondary",
  PREPARING: "secondary",
  SHIPPED: "default",
  DELIVERED: "default",
  REJECTED: "destructive",
  CANCELLED: "destructive",
};

const STATUS_ICON: Record<OrderStatus, React.ComponentType<{ className?: string }>> = {
  DRAFT: FileText,
  SUBMITTED: Send,
  UNDER_REVIEW: Search,
  CONFIRMED: CheckCircle2,
  PREPARING: PackageCheck,
  SHIPPED: Truck,
  DELIVERED: ClipboardCheck,
  REJECTED: XCircle,
  CANCELLED: Ban,
};

const kgFormatter = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 3 });

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "bugün";
  if (days === 1) return "dün";
  return `${days} gün önce`;
}

function ProductThumb({
  imageUrl,
  alt,
  size = 40,
  className,
}: {
  imageUrl: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  if (!imageUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
          className,
        )}
      >
        <Package className="size-4" />
      </div>
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className={cn("relative shrink-0 overflow-hidden rounded-full bg-muted", className)}
    >
      <Image src={imageUrl} alt={alt} fill className="object-cover" sizes={`${size}px`} />
    </div>
  );
}

function OrderDetailSheet({ order }: { order: OrderRow }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelInput, setShowCancelInput] = useState(false);

  const nextStatuses = nextOrderStatuses(order.status);
  const advanceStatuses = nextStatuses.filter((s) => s !== "CANCELLED");
  const canCancel = nextStatuses.includes("CANCELLED");

  function advance(status: OrderStatus, cancelReasonValue?: string) {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("orderId", order.id);
      formData.set("status", status);
      if (cancelReasonValue) formData.set("cancelReason", cancelReasonValue);
      try {
        await transitionOrderAction(formData);
        setShowCancelInput(false);
        setCancelReason("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Durum güncellenemedi.");
      }
    });
  }

  function shipLine(line: OrderLineRow) {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("orderId", order.id);
      formData.set("orderLineId", line.id);
      try {
        await createShipmentFromOrderAction(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sevkiyat oluşturulamadı.");
      }
    });
  }

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-2">
          <SheetTitle>{order.dealerName}</SheetTitle>
          <Badge variant={STATUS_VARIANT[order.status]}>{STATUS_LABEL[order.status]}</Badge>
        </div>
        <SheetDescription>
          Sipariş #{order.id.slice(-6)} · {formatDateTime(new Date(order.createdAt))}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
        <div>
          <p className="mb-2 text-caption font-medium text-muted-foreground">Kalemler</p>
          <div className="space-y-2">
            {order.lines.map((line) => (
              <div key={line.id} className="rounded-xl border border-border/70 p-3">
                <div className="flex items-center gap-3">
                  <ProductThumb imageUrl={line.imageUrl} alt={line.productName} size={44} className="rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-medium text-neutral-900">
                      {line.productName}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {line.packLabel} · {line.quantity} adet ·{" "}
                      {formatMoney(money(line.unitPriceKurus))}/adet
                    </p>
                  </div>
                  <p className="shrink-0 tabular-nums font-semibold text-neutral-900">
                    {formatMoney(money(line.lineTotalKurus))}
                  </p>
                </div>
                {order.status === "CONFIRMED" || order.status === "PREPARING" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => shipLine(line)}
                    className="mt-2 gap-1.5"
                  >
                    <Truck className="size-3.5" />
                    Bu kalem için sevkiyat oluştur
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
            <p className="font-semibold text-neutral-900">Toplam</p>
            <p className="tabular-nums text-h4 leading-h4 font-bold text-brand-700">
              {formatMoney(money(order.totalKurus))}
            </p>
          </div>
        </div>

        {order.shipments.length > 0 ? (
          <div>
            <p className="mb-2 text-caption font-medium text-muted-foreground">Bağlı sevkiyatlar</p>
            <div className="space-y-1.5">
              {order.shipments.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-caption"
                >
                  <span>{kgFormatter.format(Number(s.quantityKg))} kg</span>
                  <Badge variant="outline">{s.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="flex items-center gap-1.5 rounded-lg bg-danger-bg px-3 py-2 text-caption text-danger-fg">
            <CircleAlert className="size-3.5 shrink-0" />
            {error}
          </p>
        ) : null}

        {advanceStatuses.length > 0 || canCancel ? (
          <div className="flex flex-wrap gap-2">
            {advanceStatuses.map((s) => {
              const Icon = STATUS_ICON[s];
              return (
                <Button key={s} size="sm" disabled={isPending} onClick={() => advance(s)} className="gap-1.5">
                  <Icon className="size-3.5" />
                  {STATUS_LABEL[s]}
                </Button>
              );
            })}
            {canCancel ? (
              showCancelInput ? (
                <div className="flex w-full items-center gap-2">
                  <Input
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="İptal nedeni"
                    className="h-9"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isPending || !cancelReason.trim()}
                    onClick={() => advance("CANCELLED", cancelReason)}
                  >
                    Onayla
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => setShowCancelInput(true)}
                  className="gap-1.5 text-danger-fg hover:text-danger-fg"
                >
                  <Ban className="size-3.5" />
                  İptal Et
                </Button>
              )
            ) : null}
          </div>
        ) : null}

        <div>
          <p className="mb-3 text-caption font-medium text-muted-foreground">
            Geçmiş (adım adım)
          </p>
          <ol className="flex flex-col">
            {order.events.map((event, index) => {
              const Icon = STATUS_ICON[event.status];
              const isLast = index === order.events.length - 1;
              return (
                <li key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white">
                      <Icon className="size-3" aria-hidden />
                    </div>
                    {!isLast ? <div className="w-px flex-1 bg-neutral-200" aria-hidden /> : null}
                  </div>
                  <div className={isLast ? "pb-1" : "pb-5"}>
                    <p className="text-caption text-neutral-400">
                      {formatDateTime(new Date(event.createdAt))}
                    </p>
                    <p className="text-body-sm font-semibold text-neutral-900">
                      {STATUS_LABEL[event.status]}
                    </p>
                    {event.note ? (
                      <p className="text-body-sm text-neutral-600">{event.note}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </>
  );
}

function CreateOrderForm({
  dealers,
  variants,
  onDone,
}: {
  dealers: { id: string; unvan: string }[];
  variants: { id: string; label: string }[];
  onDone: () => void;
}) {
  const [lines, setLines] = useState<{ variantId: string; quantity: string }[]>([
    { variantId: "", quantity: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateLine(index: number, patch: Partial<{ variantId: string; quantity: string }>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const validLines = lines
      .filter((l) => l.variantId && Number(l.quantity) > 0)
      .map((l) => ({ variantId: l.variantId, quantity: Math.round(Number(l.quantity)) }));
    formData.set("lines", JSON.stringify(validLines));

    startTransition(async () => {
      try {
        await createOrderAction(formData);
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sipariş oluşturulamadı.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
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

      <div className="space-y-2">
        <label className="text-caption text-muted-foreground">Kalemler</label>
        {lines.map((line, index) => (
          <div key={index} className="flex items-center gap-2">
            <select
              value={line.variantId}
              onChange={(e) => updateLine(index, { variantId: e.target.value })}
              className="min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            >
              <option value="">Ürün seçin…</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
            <Input
              value={line.quantity}
              onChange={(e) => updateLine(index, { quantity: e.target.value })}
              type="number"
              step="1"
              min="1"
              placeholder="adet"
              className="w-24 shrink-0"
            />
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              disabled={lines.length === 1}
              onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
              className="shrink-0 text-neutral-400 hover:text-danger-fg"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setLines((prev) => [...prev, { variantId: "", quantity: "" }])}
          className="gap-1.5"
        >
          <Plus className="size-3.5" />
          Satır Ekle
        </Button>
      </div>

      <div className="space-y-1">
        <label className="text-caption text-muted-foreground">Not (opsiyonel)</label>
        <Input name="note" placeholder="Sipariş notu" />
      </div>

      {error ? (
        <p className="flex items-center gap-1.5 rounded-lg bg-danger-bg px-3 py-2 text-caption text-danger-fg">
          <CircleAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Oluşturuluyor…" : "Sipariş Oluştur"}
      </Button>
    </form>
  );
}

export function OrderBoard({
  orders,
  dealers,
  variants,
}: {
  orders: OrderRow[];
  dealers: { id: string; unvan: string }[];
  variants: { id: string; label: string }[];
}) {
  const [mode, setMode] = useState<"closed" | "create" | "detail">("closed");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setMode("create")} className="gap-1.5">
          <Plus className="size-4" />
          Yeni Sipariş
        </Button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {orders.map((order, index) => {
          const Icon = STATUS_ICON[order.status];
          const visibleThumbs = order.lines.slice(0, 3);
          const extraCount = order.lines.length - visibleThumbs.length;
          return (
            <motion.button
              key={order.id}
              type="button"
              onClick={() => {
                setSelectedId(order.id);
                setMode("detail");
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4), ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "flex w-full items-center gap-4 border-border/70 px-5 py-4 text-left transition-colors hover:bg-muted/40",
                index !== orders.length - 1 && "border-b",
              )}
            >
              <div className="flex shrink-0 -space-x-3">
                {visibleThumbs.map((line) => (
                  <ProductThumb
                    key={line.id}
                    imageUrl={line.imageUrl}
                    alt={line.productName}
                    size={40}
                    className="border-2 border-card"
                  />
                ))}
                {extraCount > 0 ? (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-card bg-muted text-caption font-semibold text-muted-foreground">
                    +{extraCount}
                  </div>
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-neutral-900">{order.dealerName}</p>
                <p className="truncate text-caption text-muted-foreground">
                  #{order.id.slice(-6)} · {timeAgo(order.createdAt)} ·{" "}
                  {order.lines.map((l) => l.productName).join(", ")}
                </p>
              </div>

              <div className="hidden shrink-0 text-right sm:block">
                <p className="tabular-nums font-semibold text-neutral-900">
                  {formatMoney(money(order.totalKurus))}
                </p>
                <p className="text-caption text-muted-foreground">{order.lines.length} kalem</p>
              </div>

              <Badge variant={STATUS_VARIANT[order.status]} className="hidden shrink-0 gap-1 md:flex">
                <Icon className="size-3" />
                {STATUS_LABEL[order.status]}
              </Badge>

              <ChevronRight className="size-4 shrink-0 text-neutral-300" />
            </motion.button>
          );
        })}
        {orders.length === 0 ? (
          <p className="py-10 text-center text-caption text-muted-foreground">
            Henüz sipariş yok — &ldquo;Yeni Sipariş&rdquo; ile oluşturun.
          </p>
        ) : null}
      </div>

      <Sheet
        open={mode !== "closed"}
        onOpenChange={(open) => {
          if (!open) {
            setMode("closed");
            setSelectedId(null);
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {mode === "create" ? (
            <>
              <SheetHeader>
                <SheetTitle>Yeni Sipariş</SheetTitle>
                <SheetDescription>
                  Fiyatlar bayinin atanmış fiyat listesinden anlık olarak snapshot alınır.
                </SheetDescription>
              </SheetHeader>
              <CreateOrderForm dealers={dealers} variants={variants} onDone={() => setMode("closed")} />
            </>
          ) : null}
          {mode === "detail" && selected ? <OrderDetailSheet order={selected} /> : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
