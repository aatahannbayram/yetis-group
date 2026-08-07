"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
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
  Package,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import type { Density } from "@/components/ui/density-toggle";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { formatDate, formatDateTime } from "@/lib/format/date";
import { cn } from "@/lib/utils";
import {
  createOrderAction,
  transitionOrderAction,
  createShipmentFromOrderAction,
} from "@/app/(panel)/panel/siparisler/actions";
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

const STATUS_TONE: Record<OrderStatus, StatusTone> = {
  DRAFT: "neutral",
  SUBMITTED: "info",
  UNDER_REVIEW: "warning",
  CONFIRMED: "info",
  PREPARING: "info",
  SHIPPED: "success",
  DELIVERED: "success",
  REJECTED: "danger",
  CANCELLED: "danger",
};

const STATUS_ICON: Record<OrderStatus, LucideIcon> = {
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

const ACTIVE_STATUSES: ReadonlySet<OrderStatus> = new Set([
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "CONFIRMED",
  "PREPARING",
  "SHIPPED",
]);

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
  const [failed, setFailed] = useState(false);

  if (!imageUrl || failed) {
    return (
      <div
        style={{ width: size, height: size }}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-muted)]",
          className,
        )}
        title={alt}
      >
        <Package className="size-4" />
      </div>
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className={cn("relative shrink-0 overflow-hidden rounded-full bg-[var(--surface-3)]", className)}
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${size}px`}
        onError={() => setFailed(true)}
      />
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
          <StatusBadge
            label={STATUS_LABEL[order.status]}
            tone={STATUS_TONE[order.status]}
            icon={STATUS_ICON[order.status]}
          />
        </div>
        <SheetDescription>
          Sipariş #{order.id.slice(-6)} · {formatDateTime(new Date(order.createdAt))}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
        <div>
          <p className="mb-2 text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
            Kalemler
          </p>
          <div className="space-y-2">
            {order.lines.map((line) => (
              <div
                key={line.id}
                className="rounded-[var(--radius-md)] border border-[var(--border)] p-3"
              >
                <div className="flex items-center gap-3">
                  <ProductThumb imageUrl={line.imageUrl} alt={line.productName} size={44} className="rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-medium text-[var(--text-primary)]">
                      {line.productName}
                    </p>
                    <p className="text-[length:var(--text-caption)] text-[var(--text-muted)]">
                      {line.packLabel} · {line.quantity} adet ·{" "}
                      {formatMoney(money(line.unitPriceKurus))}/adet
                    </p>
                  </div>
                  <p className="shrink-0 tabular-nums font-semibold text-[var(--text-primary)]">
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
          <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
            <p className="font-semibold text-[var(--text-primary)]">Toplam</p>
            <p className="tabular-nums text-h4 leading-h4 font-bold text-[var(--primary-text)]">
              {formatMoney(money(order.totalKurus))}
            </p>
          </div>
        </div>

        {order.shipments.length > 0 ? (
          <div>
            <p className="mb-2 text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
              Bağlı sevkiyatlar
            </p>
            <div className="space-y-1.5">
              {order.shipments.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-[var(--radius-sm)] bg-[var(--surface-2)] px-3 py-2 text-[length:var(--text-caption)]"
                >
                  <span>{kgFormatter.format(Number(s.quantityKg))} kg</span>
                  <StatusBadge label={s.status} tone="neutral" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--danger-subtle)] px-3 py-2 text-[length:var(--text-caption)] text-[var(--danger-text)]">
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
                  className="gap-1.5 text-[var(--danger-text)] hover:text-[var(--danger-text)]"
                >
                  <Ban className="size-3.5" />
                  İptal Et
                </Button>
              )
            ) : null}
          </div>
        ) : null}

        <div>
          <p className="mb-3 text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
            Geçmiş (adım adım)
          </p>
          <ol className="flex flex-col">
            {order.events.map((event, index) => {
              const Icon = STATUS_ICON[event.status];
              const isLast = index === order.events.length - 1;
              return (
                <li key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--surface-card)]">
                      <Icon className="size-3" aria-hidden />
                    </div>
                    {!isLast ? (
                      <div className="w-px flex-1 bg-[var(--border)]" aria-hidden />
                    ) : null}
                  </div>
                  <div className={isLast ? "pb-1" : "pb-5"}>
                    <p className="text-[length:var(--text-caption)] text-[var(--text-muted)]">
                      {formatDateTime(new Date(event.createdAt))}
                    </p>
                    <p className="text-body-sm font-semibold text-[var(--text-primary)]">
                      {STATUS_LABEL[event.status]}
                    </p>
                    {event.note ? (
                      <p className="text-body-sm text-[var(--text-secondary)]">{event.note}</p>
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
        <label className="text-[length:var(--text-caption)] text-[var(--text-muted)]">
          Bayi / Müşteri
        </label>
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
        <label className="text-[length:var(--text-caption)] text-[var(--text-muted)]">Kalemler</label>
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
              className="shrink-0 text-[var(--text-muted)] hover:text-[var(--danger-text)]"
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
        <label className="text-[length:var(--text-caption)] text-[var(--text-muted)]">
          Not (opsiyonel)
        </label>
        <Input name="note" placeholder="Sipariş notu" />
      </div>

      {error ? (
        <p className="flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--danger-subtle)] px-3 py-2 text-[length:var(--text-caption)] text-[var(--danger-text)]">
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
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState<Density>("compact");
  const [viewFilter, setViewFilter] = useState("all");

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  function openCreate() {
    setSelectedId(null);
    setMode("create");
  }

  function openDetail(id: string) {
    setSelectedId(id);
    setMode("detail");
  }

  function close() {
    setMode("closed");
    setSelectedId(null);
  }

  const filtered = useMemo(() => {
    if (viewFilter === "active") {
      return orders.filter((o) => ACTIVE_STATUSES.has(o.status));
    }
    if (viewFilter === "review") {
      return orders.filter((o) => o.status === "UNDER_REVIEW");
    }
    if (viewFilter === "delivered") {
      return orders.filter((o) => o.status === "DELIVERED");
    }
    return orders;
  }, [orders, viewFilter]);

  const getRowId = useCallback((r: OrderRow) => r.id, []);

  const globalFilterFn = useCallback((row: OrderRow, q: string) => {
    const statusLabel = STATUS_LABEL[row.status].toLocaleLowerCase("tr-TR");
    const products = row.lines.map((l) => l.productName).join(" ").toLocaleLowerCase("tr-TR");
    return (
      row.dealerName.toLocaleLowerCase("tr-TR").includes(q) ||
      row.id.toLocaleLowerCase("tr-TR").includes(q) ||
      statusLabel.includes(q) ||
      products.includes(q)
    );
  }, []);

  const columns = useMemo<ColumnDef<OrderRow, unknown>[]>(
    () => [
      {
        id: "thumbs",
        header: "",
        size: 88,
        enableSorting: false,
        cell: ({ row }) => {
          const visibleThumbs = row.original.lines.slice(0, 3);
          const extraCount = row.original.lines.length - visibleThumbs.length;
          return (
            <div className="flex shrink-0 -space-x-3">
              {visibleThumbs.map((line) => (
                <ProductThumb
                  key={line.id}
                  imageUrl={line.imageUrl}
                  alt={line.productName}
                  size={36}
                  className="border-2 border-[var(--surface-card)]"
                />
              ))}
              {extraCount > 0 ? (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--surface-card)] bg-[var(--surface-3)] text-[length:var(--text-caption)] font-semibold text-[var(--text-muted)]">
                  +{extraCount}
                </div>
              ) : null}
              {visibleThumbs.length === 0 ? (
                <ProductThumb imageUrl={null} alt="Sipariş" size={36} />
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: "dealerName",
        header: "Bayi",
        minSize: 200,
        cell: ({ row }) => (
          <div className="min-w-0 max-w-[280px]">
            <p
              className="truncate font-medium text-[var(--text-primary)]"
              title={row.original.dealerName}
            >
              {row.original.dealerName}
            </p>
            <p className="truncate text-[length:var(--text-caption)] text-[var(--text-muted)]">
              #{row.original.id.slice(-6)} · {timeAgo(row.original.createdAt)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Durum",
        cell: ({ row }) => (
          <StatusBadge
            label={STATUS_LABEL[row.original.status]}
            tone={STATUS_TONE[row.original.status]}
            icon={STATUS_ICON[row.original.status]}
          />
        ),
      },
      {
        id: "lines",
        header: "Kalem",
        accessorFn: (r) => r.lines.length,
        cell: ({ row }) => (
          <span className="tabular-nums text-[var(--text-secondary)]">
            {row.original.lines.length}
          </span>
        ),
      },
      {
        id: "total",
        header: "Toplam",
        accessorFn: (r) => r.totalKurus,
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums text-[var(--text-primary)]">
            {formatMoney(money(row.original.totalKurus))}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Tarih",
        cell: ({ row }) => (
          <span className="tabular-nums text-[var(--text-secondary)]">
            {formatDate(new Date(row.original.createdAt))}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-3" data-density={density}>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Bayi, ürün, sipariş no veya durum ara…"
        views={[
          { id: "all", label: "Tümü" },
          { id: "active", label: "Aktif" },
          { id: "review", label: "İnceleme" },
          { id: "delivered", label: "Teslim" },
        ]}
        activeViewId={viewFilter}
        onViewSelect={setViewFilter}
        density={density}
        onDensityChange={setDensity}
        trailing={
          <Button type="button" onClick={openCreate} className="h-8 gap-1.5">
            <Plus className="size-4" aria-hidden />
            Yeni sipariş
          </Button>
        }
      />

      <DataTable
        data={filtered}
        columns={columns}
        getRowId={getRowId}
        storageKey="panel-orders"
        search={search}
        globalFilterFn={globalFilterFn}
        onRowOpen={(row) => openDetail(row.id)}
        emptyTitle="Sipariş yok"
        emptyDescription="Yeni sipariş oluşturarak listeyi doldurun."
        filterEmptyTitle="Filtre sonucu boş"
        filterEmptyDescription="Görünümü veya aramayı temizleyip tekrar deneyin."
        emptyAction={
          <Button type="button" onClick={openCreate} className="gap-1.5">
            <Plus className="size-4" aria-hidden />
            Yeni sipariş
          </Button>
        }
      />

      <Sheet open={mode !== "closed"} onOpenChange={(open) => !open && close()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {mode === "create" ? (
            <>
              <SheetHeader>
                <SheetTitle>Yeni Sipariş</SheetTitle>
                <SheetDescription>
                  Fiyatlar bayinin atanmış fiyat listesinden anlık olarak snapshot alınır.
                </SheetDescription>
              </SheetHeader>
              <CreateOrderForm dealers={dealers} variants={variants} onDone={close} />
            </>
          ) : null}
          {mode === "detail" && selected ? <OrderDetailSheet order={selected} /> : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
