"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Undo2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { formatRelativeTime } from "@/lib/format/relative-time";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { formatDate } from "@/lib/format/date";
import { RETURN_REASONS, RETURN_REASON_LABEL, isPhotoRequired, type ReturnReason } from "@/domain/return/reasons";
import type { ReturnRequestStatus } from "@/domain/return/state-machine";
import {
  createReturnRequestAction,
  loadReturnableOrderLinesAction,
  uploadReturnPhotoAction,
} from "@/app/(dealer-portal)/bayi/iade/actions";
import { normalizeImageFile } from "@/lib/image/normalize-upload";

const STATUS_LABEL: Record<ReturnRequestStatus, string> = {
  OLUSTURULDU: "Oluşturuldu",
  INCELENIYOR: "İnceleniyor",
  ONAYLANDI: "Onaylandı",
  REDDEDILDI: "Reddedildi",
  URUN_TESLIM_ALINDI: "Ürün teslim alındı",
  KONTROL_EDILDI: "Kontrol edildi",
  FATURALANDI: "Faturalandı",
  KAPANDI: "Kapandı",
  IPTAL: "İptal edildi",
};

const STATUS_TONE: Record<ReturnRequestStatus, StatusTone> = {
  OLUSTURULDU: "neutral",
  INCELENIYOR: "info",
  ONAYLANDI: "success",
  REDDEDILDI: "danger",
  URUN_TESLIM_ALINDI: "info",
  KONTROL_EDILDI: "info",
  FATURALANDI: "success",
  KAPANDI: "neutral",
  IPTAL: "neutral",
};

export type DealerReturnRequestRow = {
  id: string;
  returnNo: string;
  status: ReturnRequestStatus;
  requestedAt: string;
  rejectReason: string | null;
  items: { id: string; productName: string; sku: string; requestedQty: number; approvedQty: number | null }[];
};

export type DeliveredOrder = {
  id: string;
  createdAt: string;
  totalKurus: number;
  lineCount: number;
};

export function DealerReturnRequests({
  requests,
  deliveredOrders,
  initialOrderId,
}: {
  requests: DealerReturnRequestRow[];
  deliveredOrders: DeliveredOrder[];
  initialOrderId?: string;
}) {
  const [sheetOpen, setSheetOpen] = useState(Boolean(initialOrderId));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => setSheetOpen(true)}
          disabled={deliveredOrders.length === 0}
          className="h-11 w-full gap-1.5 sm:h-9 sm:w-auto"
        >
          <Plus className="size-4" aria-hidden />
          Yeni iade talebi
        </Button>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={Undo2}
          title="Henüz iade talebiniz yok"
          description={
            deliveredOrders.length === 0
              ? "İade açabilmek için önce teslim edilmiş bir siparişiniz olmalı."
              : "Teslim edilmiş bir siparişten iade talebi açabilirsiniz."
          }
        />
      ) : (
        <ul className="space-y-2">
          {requests.map((r) => (
            <li key={r.id} className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-[var(--panel-ink-muted)]">{r.returnNo}</p>
                  <p className="text-caption text-[var(--panel-ink-muted)]">
                    {formatRelativeTime(new Date(r.requestedAt))}
                  </p>
                </div>
                <StatusBadge label={STATUS_LABEL[r.status]} tone={STATUS_TONE[r.status]} />
              </div>
              <ul className="mt-2 space-y-1 text-body-sm text-[var(--panel-ink)]">
                {r.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-2">
                    <span className="truncate">{item.productName}</span>
                    <span className="shrink-0 tabular-nums text-[var(--panel-ink-muted)]">
                      {item.approvedQty ?? item.requestedQty} adet
                    </span>
                  </li>
                ))}
              </ul>
              {r.status === "REDDEDILDI" && r.rejectReason ? (
                <p className="mt-2 rounded-lg bg-[var(--danger-subtle)] px-2.5 py-1.5 text-caption text-[var(--danger-text)]">
                  {r.rejectReason}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <NewReturnRequestSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        deliveredOrders={deliveredOrders}
        initialOrderId={initialOrderId}
      />
    </div>
  );
}

type ReturnableLine = {
  orderLineId: string;
  variantId: string;
  productName: string;
  sku: string;
  packSize: string | null;
  orderedQty: number;
  previouslyReturnedQty: number;
  remainingQty: number;
  unitPriceKurus: number;
  vatRateBasisPoints: number;
};

type DraftItem = {
  orderLineId: string;
  quantity: number;
  reason: ReturnReason;
  lotNumber: string;
  note: string;
  photoUrls: string[];
};

function NewReturnRequestSheet({
  open,
  onOpenChange,
  deliveredOrders,
  initialOrderId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveredOrders: DeliveredOrder[];
  initialOrderId?: string;
}) {
  const [orderId, setOrderId] = useState(initialOrderId ?? "");
  const [lines, setLines] = useState<ReturnableLine[] | null>(null);
  const [loadingLines, setLoadingLines] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, DraftItem>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadLines() {
      if (!orderId) {
        setLines(null);
        return;
      }
      setLoadingLines(true);
      try {
        const result = await loadReturnableOrderLinesAction(orderId);
        if (!cancelled) setLines(result.filter((l) => l.remainingQty > 0));
      } catch {
        if (!cancelled) toast.error("Sipariş kalemleri yüklenemedi");
      } finally {
        if (!cancelled) setLoadingLines(false);
      }
    }
    void loadLines();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  function selectOrder(id: string) {
    setOrderId(id);
    setDrafts({});
  }

  function toggleLine(line: ReturnableLine) {
    setDrafts((prev) => {
      const next = { ...prev };
      if (next[line.orderLineId]) {
        delete next[line.orderLineId];
      } else {
        next[line.orderLineId] = {
          orderLineId: line.orderLineId,
          quantity: 1,
          reason: "HATALI_URUN",
          lotNumber: "",
          note: "",
          photoUrls: [],
        };
      }
      return next;
    });
  }

  function updateDraft(orderLineId: string, patch: Partial<DraftItem>) {
    setDrafts((prev) => ({ ...prev, [orderLineId]: { ...prev[orderLineId]!, ...patch } }));
  }

  async function handlePhotoUpload(orderLineId: string, file: File) {
    setUploadingFor(orderLineId);
    try {
      const jpeg = await normalizeImageFile(file);
      const formData = new FormData();
      formData.set("file", jpeg);
      const result = await uploadReturnPhotoAction(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      updateDraft(orderLineId, {
        photoUrls: [...(drafts[orderLineId]?.photoUrls ?? []), result.url],
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fotoğraf yüklenemedi");
    } finally {
      setUploadingFor(null);
    }
  }

  function reset() {
    setOrderId("");
    setLines(null);
    setDrafts({});
    setError(null);
  }

  function handleSubmit() {
    setError(null);
    const items = Object.values(drafts);
    if (items.length === 0) {
      setError("En az bir ürün seçin");
      return;
    }
    for (const item of items) {
      if (isPhotoRequired(item.reason) && item.photoUrls.length === 0) {
        setError(`"${RETURN_REASON_LABEL[item.reason]}" nedeni için fotoğraf yükleyin`);
        return;
      }
    }
    startTransition(async () => {
      const result = await createReturnRequestAction({
        orderId,
        items: items.map((i) => ({
          orderLineId: i.orderLineId,
          quantity: i.quantity,
          reason: i.reason,
          lotNumber: i.lotNumber || undefined,
          photoUrls: i.photoUrls,
          note: i.note || undefined,
        })),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(`${result.returnNo} numaralı iade talebiniz alındı.`);
      reset();
      onOpenChange(false);
    });
  }

  const orderOptions = useMemo(
    () =>
      deliveredOrders.map((o) => ({
        value: o.id,
        label: `#${o.id.slice(-6)} · ${formatDate(new Date(o.createdAt))} · ${formatMoney(money(o.totalKurus))}`,
      })),
    [deliveredOrders],
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        overlayClassName="z-[80]"
        className="z-[80] flex h-[min(92dvh,100%)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl data-[side=bottom]:h-[min(92dvh,100%)] data-[side=bottom]:max-h-[92dvh]"
      >
        <SheetHeader className="shrink-0 pr-14">
          <SheetTitle>Yeni iade talebi</SheetTitle>
          <SheetDescription>Teslim edilmiş bir sipariş seçin, iade edilecek ürünleri işaretleyin.</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)]">Sipariş</label>
            <select
              value={orderId}
              onChange={(e) => selectOrder(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">Sipariş seçin…</option>
              {orderOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {loadingLines ? <p className="text-caption text-muted-foreground">Yükleniyor…</p> : null}

          {lines && lines.length === 0 ? (
            <p className="text-caption text-muted-foreground">Bu siparişte iade edilebilir kalem kalmamış.</p>
          ) : null}

          {lines ? (
            <ul className="space-y-2">
              {lines.map((line) => {
                const draft = drafts[line.orderLineId];
                const checked = Boolean(draft);
                return (
                  <li key={line.orderLineId} className="rounded-xl border border-[var(--panel-border)] p-3">
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLine(line)}
                        className="mt-1"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body-sm font-medium">
                          {line.productName}
                          {line.packSize ? ` · ${line.packSize}` : ""}
                        </span>
                        <span className="block text-caption text-muted-foreground">
                          En fazla {line.remainingQty} adet iade edilebilir
                        </span>
                      </span>
                    </label>

                    {checked && draft ? (
                      <div className="mt-3 space-y-2 border-t border-[var(--panel-border)] pt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-caption text-muted-foreground">Adet:</span>
                          <Input
                            type="number"
                            min={1}
                            max={line.remainingQty}
                            value={draft.quantity}
                            onChange={(e) =>
                              updateDraft(line.orderLineId, {
                                quantity: Math.min(
                                  line.remainingQty,
                                  Math.max(1, Number(e.target.value) || 1),
                                ),
                              })
                            }
                            className="h-8 w-20"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-caption font-medium text-muted-foreground">İade nedeni</label>
                          <select
                            value={draft.reason}
                            onChange={(e) =>
                              updateDraft(line.orderLineId, { reason: e.target.value as ReturnReason })
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                          >
                            {RETURN_REASONS.map((r) => (
                              <option key={r} value={r}>
                                {RETURN_REASON_LABEL[r]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Input
                          placeholder="Lot/parti no (biliniyorsa)"
                          value={draft.lotNumber}
                          onChange={(e) => updateDraft(line.orderLineId, { lotNumber: e.target.value })}
                          className="h-8"
                        />
                        {isPhotoRequired(draft.reason) ? (
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap gap-2">
                              <label className="flex min-h-11 w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-[var(--panel-border)] px-3 py-2 text-caption text-muted-foreground hover:bg-muted">
                                <Upload className="size-3.5" />
                                {uploadingFor === line.orderLineId ? "Yükleniyor…" : "Galeriden fotoğraf"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadingFor === line.orderLineId}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) void handlePhotoUpload(line.orderLineId, file);
                                    e.target.value = "";
                                  }}
                                />
                              </label>
                              <label className="flex min-h-11 w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-[var(--panel-border)] px-3 py-2 text-caption text-muted-foreground hover:bg-muted sm:hidden">
                                <Upload className="size-3.5" />
                                Kamera
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  disabled={uploadingFor === line.orderLineId}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) void handlePhotoUpload(line.orderLineId, file);
                                    e.target.value = "";
                                  }}
                                />
                              </label>
                            </div>
                            {draft.photoUrls.length > 0 ? (
                              <div className="flex gap-1.5">
                                {draft.photoUrls.map((url) => (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img key={url} src={url} alt="" className="size-12 rounded-md object-cover ring-1 ring-black/5" />
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}

        </div>

        <div className="shrink-0 space-y-2 border-t border-[var(--panel-border)] bg-[var(--panel-surface)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {error ? (
            <p className="rounded-lg bg-[var(--danger-subtle)] px-3 py-2 text-xs text-[var(--danger-text)]">
              {error}
            </p>
          ) : null}
          <Button type="button" onClick={handleSubmit} disabled={isPending} className="h-11 w-full rounded-xl">
            {isPending ? "Gönderiliyor…" : "İade talebini gönder"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
