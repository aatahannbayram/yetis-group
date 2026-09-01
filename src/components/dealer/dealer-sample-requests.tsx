"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { formatRelativeTime } from "@/lib/format/relative-time";
import { createSampleRequestAction, cancelSampleRequestAction } from "@/app/(dealer-portal)/bayi/numune/actions";

type SampleRequestStatus =
  | "TALEP_EDILDI"
  | "INCELENIYOR"
  | "ONAYLANDI"
  | "REDDEDILDI"
  | "HAZIRLANIYOR"
  | "SEVK_EDILDI"
  | "TESLIM_EDILDI"
  | "IPTAL";

const STATUS_LABEL: Record<SampleRequestStatus, string> = {
  TALEP_EDILDI: "Talep edildi",
  INCELENIYOR: "İnceleniyor",
  ONAYLANDI: "Onaylandı",
  REDDEDILDI: "Reddedildi",
  HAZIRLANIYOR: "Hazırlanıyor",
  SEVK_EDILDI: "Sevk edildi",
  TESLIM_EDILDI: "Teslim edildi",
  IPTAL: "İptal edildi",
};

const STATUS_TONE: Record<SampleRequestStatus, StatusTone> = {
  TALEP_EDILDI: "neutral",
  INCELENIYOR: "info",
  ONAYLANDI: "success",
  REDDEDILDI: "danger",
  HAZIRLANIYOR: "info",
  SEVK_EDILDI: "info",
  TESLIM_EDILDI: "success",
  IPTAL: "neutral",
};

const CANCELABLE: ReadonlySet<SampleRequestStatus> = new Set(["TALEP_EDILDI", "INCELENIYOR"]);

export type DealerSampleRequestRow = {
  id: string;
  requestNo: string;
  status: SampleRequestStatus;
  requestedAt: string;
  trackingNo: string | null;
  cargoCompany: string | null;
  rejectReason: string | null;
  items: { id: string; productName: string; packSize: string | null; sku: string; quantity: number }[];
};

export type SampleCatalogItem = {
  variantId: string;
  productName: string;
  sku: string;
  packSize: string | null;
  packagingType: string;
};

export function DealerSampleRequests({
  requests,
  catalogItems,
  defaultDeliveryAddress,
  openWithVariantId,
}: {
  requests: DealerSampleRequestRow[];
  catalogItems: SampleCatalogItem[];
  defaultDeliveryAddress: string;
  openWithVariantId?: string;
}) {
  const [sheetOpen, setSheetOpen] = useState(Boolean(openWithVariantId));
  const [isPending, startTransition] = useTransition();
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  function handleCancel(id: string) {
    if (!window.confirm("Bu numune talebini iptal etmek istediğinize emin misiniz?")) return;
    setCancelingId(id);
    startTransition(async () => {
      try {
        await cancelSampleRequestAction(id);
        toast.success("Talep iptal edildi");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "İptal edilemedi");
      } finally {
        setCancelingId(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setSheetOpen(true)} className="gap-1.5">
          <Plus className="size-4" aria-hidden />
          Yeni numune talebi
        </Button>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="Henüz numune talebiniz yok"
          description="Sipariş vermeden önce denemek istediğiniz ürünler için talep açın."
          action={
            <Button type="button" onClick={() => setSheetOpen(true)} className="gap-1.5">
              <Plus className="size-4" aria-hidden />
              Yeni numune talebi
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {requests.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-[var(--panel-ink-muted)]">{r.requestNo}</p>
                  <p className="text-caption text-[var(--panel-ink-muted)]">
                    {formatRelativeTime(new Date(r.requestedAt))}
                  </p>
                </div>
                <StatusBadge label={STATUS_LABEL[r.status]} tone={STATUS_TONE[r.status]} />
              </div>
              <ul className="mt-2 space-y-1 text-body-sm text-[var(--panel-ink)]">
                {r.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-2">
                    <span className="truncate">
                      {item.productName}
                      {item.packSize ? ` · ${item.packSize}` : ""}
                    </span>
                    <span className="shrink-0 tabular-nums text-[var(--panel-ink-muted)]">
                      {item.quantity} adet
                    </span>
                  </li>
                ))}
              </ul>
              {r.status === "REDDEDILDI" && r.rejectReason ? (
                <p className="mt-2 rounded-lg bg-[var(--danger-subtle)] px-2.5 py-1.5 text-caption text-[var(--danger-text)]">
                  {r.rejectReason}
                </p>
              ) : null}
              {r.trackingNo ? (
                <p className="mt-2 text-caption text-[var(--panel-ink-muted)]">
                  {r.cargoCompany ?? "Kargo"}: {r.trackingNo}
                </p>
              ) : null}
              {CANCELABLE.has(r.status) ? (
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending && cancelingId === r.id}
                    onClick={() => handleCancel(r.id)}
                    className="gap-1.5 text-[var(--danger-text)] hover:text-[var(--danger-text)]"
                  >
                    <Trash2 className="size-3.5" />
                    İptal et
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <NewSampleRequestSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        catalogItems={catalogItems}
        defaultDeliveryAddress={defaultDeliveryAddress}
        initialVariantId={openWithVariantId}
      />
    </div>
  );
}

type DraftLine = { variantId: string; quantity: number };

function NewSampleRequestSheet({
  open,
  onOpenChange,
  catalogItems,
  defaultDeliveryAddress,
  initialVariantId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalogItems: SampleCatalogItem[];
  defaultDeliveryAddress: string;
  initialVariantId?: string;
}) {
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<DraftLine[]>(
    initialVariantId && catalogItems.some((c) => c.variantId === initialVariantId)
      ? [{ variantId: initialVariantId, quantity: 1 }]
      : [],
  );
  const [address, setAddress] = useState(defaultDeliveryAddress);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    if (!q) return [];
    return catalogItems
      .filter((c) => c.productName.toLocaleLowerCase("tr-TR").includes(q) || c.sku.toLocaleLowerCase("tr-TR").includes(q))
      .filter((c) => !lines.some((l) => l.variantId === c.variantId))
      .slice(0, 8);
  }, [search, catalogItems, lines]);

  function addLine(variantId: string) {
    setLines((prev) => [...prev, { variantId, quantity: 1 }]);
    setSearch("");
  }

  function removeLine(variantId: string) {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  }

  function setQuantity(variantId: string, quantity: number) {
    setLines((prev) => prev.map((l) => (l.variantId === variantId ? { ...l, quantity } : l)));
  }

  function reset() {
    setLines([]);
    setSearch("");
    setNote("");
    setError(null);
    setAddress(defaultDeliveryAddress);
  }

  function handleSubmit() {
    setError(null);
    if (lines.length === 0) {
      setError("En az bir ürün ekleyin");
      return;
    }
    if (!address.trim()) {
      setError("Teslimat adresi gerekli");
      return;
    }
    startTransition(async () => {
      try {
        const result = await createSampleRequestAction({
          deliveryAddressLine: address,
          note: note || undefined,
          items: lines,
        });
        toast.success(
          result.flaggedForReview
            ? `${result.requestNo} numaralı talebiniz alındı, limit kontrolü için incelemede.`
            : `${result.requestNo} numaralı talebiniz alındı.`,
        );
        reset();
        onOpenChange(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Talep gönderilemedi");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Yeni numune talebi</SheetTitle>
          <SheetDescription>Denemek istediğiniz ürünleri ekleyin, tek talepte birden fazla ürün olabilir.</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)]">Ürün ara</label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün adı veya SKU…"
            />
            {filtered.length > 0 ? (
              <ul className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface)]">
                {filtered.map((c) => (
                  <li key={c.variantId}>
                    <button
                      type="button"
                      onClick={() => addLine(c.variantId)}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-body-sm hover:bg-muted"
                    >
                      <span className="truncate">
                        {c.productName}
                        {c.packSize ? ` · ${c.packSize}` : ""}
                      </span>
                      <span className="shrink-0 font-mono text-caption text-[var(--panel-ink-muted)]">
                        {c.sku}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {lines.length > 0 ? (
            <ul className="space-y-2">
              {lines.map((line) => {
                const item = catalogItems.find((c) => c.variantId === line.variantId);
                if (!item) return null;
                return (
                  <li
                    key={line.variantId}
                    className="flex items-center gap-2 rounded-xl border border-[var(--panel-border)] px-3 py-2"
                  >
                    <span className="min-w-0 flex-1 truncate text-body-sm">
                      {item.productName}
                      {item.packSize ? ` · ${item.packSize}` : ""}
                    </span>
                    <Input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) =>
                        setQuantity(line.variantId, Math.max(1, Number(e.target.value) || 1))
                      }
                      className="h-9 w-16 text-center"
                    />
                    <button
                      type="button"
                      onClick={() => removeLine(line.variantId)}
                      aria-label="Kaldır"
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[var(--panel-ink-muted)] hover:bg-muted"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)]">Teslimat adresi</label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)]">Not (opsiyonel)</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Talep nedeninizi kısaca yazabilirsiniz…"
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-[var(--danger-subtle)] px-3 py-2 text-xs text-[var(--danger-text)]">
              {error}
            </p>
          ) : null}

          <Button type="button" onClick={handleSubmit} disabled={isPending} className="h-10 w-full rounded-xl">
            {isPending ? "Gönderiliyor…" : "Talebi gönder"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
