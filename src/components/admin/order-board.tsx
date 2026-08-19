"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  UserPlus,
  Landmark,
  Wallet,
  CreditCard,
  CircleDollarSign,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import type { Density } from "@/components/ui/density-toggle";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { formatDate, formatDateTime } from "@/lib/format/date";
import { salesUnitLabel } from "@/lib/format/packaging";
import { cn } from "@/lib/utils";
import {
  createOrderAction,
  transitionOrderAction,
  confirmOrderPaymentAction,
  createShipmentFromOrderAction,
  reissueProformaAction,
  sendProformaEmailAction,
} from "@/app/(panel)/panel/siparisler/actions";
import { toast } from "sonner";
import { createDealerQuickAction } from "@/app/(panel)/panel/bayiler/actions";
import { nextOrderStatuses, type OrderStatus } from "@/domain/order/state-machine";

export type OrderLineRow = {
  id: string;
  variantId: string;
  productName: string;
  imageUrl: string | null;
  packLabel: string;
  packagingType: string;
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

export type ProformaSummaryRow = {
  id: string;
  number: string;
  status: string;
  issuedAt: string;
  sentAt: string | null;
  version: number;
  buyerEmail: string | null;
  totalKurus: number;
};

export type OrderPaymentMethodRow = "HAVALE" | "CARI" | "ONLINE" | null;

export type OrderRow = {
  id: string;
  dealerId: string;
  dealerName: string;
  dealerType: string;
  status: OrderStatus;
  totalKurus: number;
  note: string | null;
  paymentMethod: OrderPaymentMethodRow;
  paidAt: string | null;
  createdAt: string;
  lines: OrderLineRow[];
  events: OrderEventRow[];
  shipments: ShipmentSummaryRow[];
  proforma: ProformaSummaryRow | null;
};

const PAYMENT_LABEL: Record<NonNullable<OrderPaymentMethodRow>, string> = {
  HAVALE: "Havale / EFT",
  CARI: "Cari hesap",
  ONLINE: "Online ödeme",
};

const PAYMENT_TONE: Record<NonNullable<OrderPaymentMethodRow>, StatusTone> = {
  HAVALE: "info",
  CARI: "warning",
  ONLINE: "success",
};

const PAYMENT_ICON: Record<NonNullable<OrderPaymentMethodRow>, LucideIcon> = {
  HAVALE: Landmark,
  CARI: Wallet,
  ONLINE: CreditCard,
};

/** CARİ'de ön ödeme kavramı yok; diğer yöntemlerde ödendi/bekliyor noktası. */
function PaymentPendingDot({
  paidAt,
  paymentMethod,
}: {
  paidAt: string | null;
  paymentMethod: OrderPaymentMethodRow;
}) {
  if (paymentMethod === "CARI") return null;
  return (
    <span
      className={cn(
        "inline-block size-1.5 rounded-full",
        paidAt ? "bg-[var(--success-solid)]" : "bg-[var(--warning-solid)]",
      )}
      title={paidAt ? "Ödendi" : "Ödeme bekleniyor"}
      aria-label={paidAt ? "Ödendi" : "Ödeme bekleniyor"}
    />
  );
}

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
  const awaitingPayment = order.paymentMethod !== "CARI" && !order.paidAt;

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

  function confirmPayment() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("orderId", order.id);
      try {
        await confirmOrderPaymentAction(formData);
        toast.success("Ödeme alındı olarak işaretlendi");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Ödeme işaretlenemedi");
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
          <SheetTitle>
            <Link
              href={`/panel/bayiler?open=${order.dealerId}`}
              className="transition-colors hover:text-[var(--primary-solid)] hover:underline"
            >
              {order.dealerName}
            </Link>
          </SheetTitle>
          <StatusBadge
            label={STATUS_LABEL[order.status]}
            tone={STATUS_TONE[order.status]}
            icon={STATUS_ICON[order.status]}
          />
          {order.paymentMethod ? (
            <StatusBadge
              label={PAYMENT_LABEL[order.paymentMethod]}
              tone={PAYMENT_TONE[order.paymentMethod]}
              icon={PAYMENT_ICON[order.paymentMethod]}
            />
          ) : null}
          {order.paymentMethod !== "CARI" ? (
            order.paidAt ? (
              <StatusBadge label={`Ödendi · ${formatDate(new Date(order.paidAt))}`} tone="success" icon={CircleDollarSign} />
            ) : (
              <StatusBadge label="Ödeme bekleniyor" tone="warning" icon={TriangleAlert} />
            )
          ) : null}
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
                      {line.packLabel} · {line.quantity} {salesUnitLabel(line.packagingType)} ·{" "}
                      {formatMoney(money(line.unitPriceKurus))}/{salesUnitLabel(line.packagingType)}
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

        <div>
          <p className="mb-2 text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
            Proforma fatura
          </p>
          {order.proforma ? (
            <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{order.proforma.number}</p>
                  <p className="text-[length:var(--text-caption)] text-[var(--text-muted)]">
                    Sürüm {order.proforma.version} · {formatDate(new Date(order.proforma.issuedAt))}
                    {order.proforma.sentAt
                      ? ` · Gönderildi ${formatDateTime(new Date(order.proforma.sentAt))}`
                      : " · Henüz gönderilmedi"}
                  </p>
                </div>
                <StatusBadge
                  label={order.proforma.sentAt ? "İletildi" : "Hazır"}
                  tone={order.proforma.sentAt ? "success" : "info"}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-1.5" asChild>
                  <a href={`/api/proforma/${order.proforma.id}/pdf`} target="_blank" rel="noreferrer">
                    <FileText className="size-3.5" />
                    PDF indir
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  disabled={isPending || !order.proforma.buyerEmail}
                  title={
                    order.proforma.buyerEmail
                      ? `Gönder: ${order.proforma.buyerEmail}`
                      : "Bayi e-postası yok"
                  }
                  onClick={() => {
                    setError(null);
                    startTransition(async () => {
                      try {
                        await sendProformaEmailAction(order.proforma!.id);
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "E-posta gönderilemedi.");
                      }
                    });
                  }}
                >
                  <Send className="size-3.5" />
                  E-posta ile gönder
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => {
                    setError(null);
                    startTransition(async () => {
                      try {
                        await reissueProformaAction(order.id);
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "Proforma yenilenemedi.");
                      }
                    });
                  }}
                >
                  Yeniden oluştur
                </Button>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Proforma e-Fatura değildir. Müşteri unvanı ve sipariş kalemleriyle sözleşme/teyit
                belgesidir.
              </p>
            </div>
          ) : (
            <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] p-3">
              <p className="text-[length:var(--text-caption)] text-[var(--text-muted)]">
                Bu sipariş için henüz proforma yok.
              </p>
              <Button
                size="sm"
                className="mt-2 gap-1.5"
                disabled={isPending}
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    try {
                      await reissueProformaAction(order.id);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Proforma oluşturulamadı.");
                    }
                  });
                }}
              >
                <FileText className="size-3.5" />
                Proforma oluştur
              </Button>
            </div>
          )}
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

        {awaitingPayment && advanceStatuses.includes("CONFIRMED") ? (
          <p className="flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--warning-subtle)] px-3 py-2 text-[length:var(--text-caption)] text-[var(--warning-text)]">
            <TriangleAlert className="size-3.5 shrink-0" />
            Bu sipariş henüz ödendi olarak işaretlenmedi.
          </p>
        ) : null}

        {awaitingPayment ? (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={confirmPayment}
            className="gap-1.5 border-[var(--success-border)] text-[var(--success-text)] hover:bg-[var(--success-subtle)]"
          >
            <CircleDollarSign className="size-3.5" />
            Ödeme alındı olarak işaretle
          </Button>
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
  dealers: initialDealers,
  variants,
  priceLists,
  onDone,
}: {
  dealers: { id: string; unvan: string }[];
  variants: { id: string; label: string }[];
  priceLists: { id: string; name: string }[];
  onDone: () => void;
}) {
  const [dealers, setDealers] = useState(initialDealers);
  const [dealerId, setDealerId] = useState("");
  const [dealerQuery, setDealerQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [lines, setLines] = useState<{ variantId: string; quantity: string }[]>([
    { variantId: "", quantity: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredDealers = useMemo(() => {
    const q = dealerQuery.trim().toLocaleLowerCase("tr-TR");
    if (!q) return dealers;
    return dealers.filter((d) => d.unvan.toLocaleLowerCase("tr-TR").includes(q));
  }, [dealers, dealerQuery]);

  function updateLine(index: number, patch: Partial<{ variantId: string; quantity: string }>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!dealerId) {
      setError("Bayi / müşteri seçin.");
      return;
    }
    const formData = new FormData(event.currentTarget);
    formData.set("dealerId", dealerId);
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

  const fieldClass =
    "h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none transition-shadow focus-visible:border-[#1B5E3A] focus-visible:ring-4 focus-visible:ring-[#1B5E3A]/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

  return (
    <>
      <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-stone-500 dark:text-zinc-400">
              Bayi / Müşteri
            </label>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#1B5E3A] transition-colors hover:text-[#164e31] dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              <UserPlus className="size-3.5" aria-hidden />
              Bayi/Müşteri ekle
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50/80 dark:border-zinc-800 dark:bg-zinc-950/50">
            <div className="relative border-b border-stone-200/80 dark:border-zinc-800">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-stone-400"
                aria-hidden
              />
              <input
                type="search"
                value={dealerQuery}
                onChange={(e) => setDealerQuery(e.target.value)}
                placeholder="Ünvan ile ara…"
                className="h-10 w-full bg-transparent pr-3 pl-9 text-sm outline-none placeholder:text-stone-400 dark:text-zinc-100"
                aria-label="Bayi ara"
              />
            </div>

            <div
              className="max-h-44 overflow-y-auto p-1.5"
              role="listbox"
              aria-label="Bayi listesi"
            >
              {filteredDealers.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-3 py-6 text-center">
                  <p className="text-sm text-stone-500 dark:text-zinc-400">
                    {dealerQuery.trim()
                      ? `"${dealerQuery.trim()}" ile eşleşen kayıt yok`
                      : "Henüz bayi/müşteri yok"}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setAddOpen(true)}
                    className="h-8 gap-1.5 bg-[#1B5E3A] text-white hover:bg-[#164e31]"
                  >
                    <UserPlus className="size-3.5" />
                    Yeni ekle
                  </Button>
                </div>
              ) : (
                filteredDealers.map((d) => {
                  const selected = dealerId === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => setDealerId(d.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                        selected
                          ? "bg-[#1B5E3A]/10 font-medium text-[#14532d] dark:bg-emerald-950/50 dark:text-emerald-300"
                          : "text-stone-700 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-900",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                          selected
                            ? "bg-[#1B5E3A] text-white"
                            : "bg-stone-200 text-stone-600 dark:bg-zinc-800 dark:text-zinc-300",
                        )}
                      >
                        {d.unvan.slice(0, 1).toLocaleUpperCase("tr-TR")}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{d.unvan}</span>
                      {selected ? <CheckCircle2 className="size-4 shrink-0 text-[#1B5E3A] dark:text-emerald-400" /> : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>
          <input type="hidden" name="dealerId" value={dealerId} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-stone-500 dark:text-zinc-400">Kalemler</label>
          {lines.map((line, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                value={line.variantId}
                onChange={(e) => updateLine(index, { variantId: e.target.value })}
                className={cn(fieldClass, "min-w-0 flex-1")}
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
                placeholder="miktar"
                className="h-10 w-24 shrink-0 rounded-xl"
              />
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                disabled={lines.length === 1}
                onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
                className="shrink-0 text-stone-400 hover:text-red-600"
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
            className="h-9 gap-1.5 rounded-xl border-stone-200"
          >
            <Plus className="size-3.5" />
            Satır ekle
          </Button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-stone-500 dark:text-zinc-400">
            Not (opsiyonel)
          </label>
          <Input name="note" placeholder="Sipariş notu" className="h-10 rounded-xl" />
        </div>

        {error ? (
          <p className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
            <CircleAlert className="size-3.5 shrink-0" />
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-full bg-[#1B5E3A] text-white hover:bg-[#164e31]"
        >
          {isPending ? "Oluşturuluyor…" : "Sipariş oluştur"}
        </Button>
      </form>

      <QuickAddDealerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        priceLists={priceLists}
        initialUnvan={dealerQuery.trim()}
        onCreated={(dealer) => {
          setDealers((prev) =>
            prev.some((d) => d.id === dealer.id)
              ? prev
              : [...prev, dealer].sort((a, b) => a.unvan.localeCompare(b.unvan, "tr")),
          );
          setDealerId(dealer.id);
          setDealerQuery("");
          setAddOpen(false);
        }}
      />
    </>
  );
}

const QUICK_DEALER_TYPES = [
  { value: "BAYI", label: "Bayi" },
  { value: "HORECA", label: "HORECA" },
  { value: "ZINCIR", label: "Zincir" },
  { value: "ARA_TOPTANCI", label: "Ara toptancı" },
] as const;

function QuickAddDealerDialog({
  open,
  onOpenChange,
  priceLists,
  initialUnvan,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priceLists: { id: string; name: string }[];
  initialUnvan: string;
  onCreated: (dealer: { id: string; unvan: string }) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const fieldClass =
    "h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus-visible:border-[#1B5E3A] focus-visible:ring-4 focus-visible:ring-[#1B5E3A]/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="z-[80] gap-0 overflow-hidden p-0 sm:max-w-md"
        overlayClassName="z-[80] bg-black/40 supports-backdrop-filter:backdrop-blur-sm"
      >
        <DialogHeader className="border-b border-stone-100 px-5 py-4 text-left dark:border-zinc-800">
          <DialogTitle className="text-base font-semibold text-stone-900 dark:text-zinc-50">
            Bayi / Müşteri ekle
          </DialogTitle>
          <DialogDescription className="text-sm text-stone-500 dark:text-zinc-400">
            Hızlı kayıt — siparişe otomatik seçilir. Detayları sonra düzenleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <form
          ref={formRef}
          className="space-y-3.5 px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setError(null);
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              try {
                const dealer = await createDealerQuickAction(fd);
                formRef.current?.reset();
                onCreated(dealer);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Kayıt oluşturulamadı.");
              }
            });
          }}
        >
          <input type="hidden" name="status" value="AKTIF" />

          <label className="block space-y-1">
            <span className="text-xs font-medium text-stone-500">Ünvan</span>
            <Input
              name="unvan"
              required
              defaultValue={initialUnvan}
              key={initialUnvan || "blank"}
              placeholder="Örn. Flexlore Gıda Ltd."
              className={fieldClass}
              autoFocus
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-stone-500">Tip</span>
              <select name="dealerType" defaultValue="BAYI" className={fieldClass}>
                {QUICK_DEALER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-stone-500">Şehir</span>
              <Input name="city" placeholder="İstanbul" className={fieldClass} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-stone-500">Telefon</span>
              <Input name="phone" placeholder="05xx…" className={fieldClass} />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-stone-500">E-posta</span>
              <Input name="email" type="email" placeholder="siparis@…" className={fieldClass} />
            </label>
          </div>

          {priceLists.length > 0 ? (
            <label className="block space-y-1">
              <span className="text-xs font-medium text-stone-500">Fiyat listesi</span>
              <select name="priceListId" defaultValue="" className={fieldClass}>
                <option value="">Baz fiyat (liste yok)</option>
                {priceLists.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {error ? (
            <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
              <CircleAlert className="size-3.5 shrink-0" />
              {error}
            </p>
          ) : null}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              className="h-10 flex-1 rounded-xl"
            >
              Vazgeç
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-10 flex-1 rounded-xl bg-[#1B5E3A] text-white hover:bg-[#164e31]"
            >
              {isPending ? "Kaydediliyor…" : "Kaydet ve seç"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const ORDER_VIEWS = new Set(["all", "active", "review", "delivered"]);

function parseOrderGorunum(raw: string | null): string {
  if (raw && ORDER_VIEWS.has(raw)) return raw;
  return "all";
}

export function OrderBoard({
  orders,
  dealers,
  variants,
  priceLists = [],
}: {
  orders: OrderRow[];
  dealers: { id: string; unvan: string }[];
  variants: { id: string; label: string }[];
  priceLists?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"closed" | "create" | "detail">("closed");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState<Density>("compact");
  const [viewFilter, setViewFilter] = useState(() => parseOrderGorunum(searchParams.get("gorunum")));

  useEffect(() => {
    setViewFilter(parseOrderGorunum(searchParams.get("gorunum")));
  }, [searchParams]);

  function selectView(id: string) {
    setViewFilter(id);
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") params.delete("gorunum");
    else params.set("gorunum", id);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

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
        accessorKey: "paymentMethod",
        header: "Ödeme",
        cell: ({ row }) => {
          const pm = row.original.paymentMethod;
          if (!pm) {
            return (
              <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                Belirtilmemiş
                <PaymentPendingDot paidAt={row.original.paidAt} paymentMethod={pm} />
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1.5">
              <StatusBadge label={PAYMENT_LABEL[pm]} tone={PAYMENT_TONE[pm]} icon={PAYMENT_ICON[pm]} />
              <PaymentPendingDot paidAt={row.original.paidAt} paymentMethod={pm} />
            </span>
          );
        },
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
        onViewSelect={selectView}
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
              <CreateOrderForm
                dealers={dealers}
                variants={variants}
                priceLists={priceLists}
                onDone={close}
              />
            </>
          ) : null}
          {mode === "detail" && selected ? <OrderDetailSheet order={selected} /> : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
