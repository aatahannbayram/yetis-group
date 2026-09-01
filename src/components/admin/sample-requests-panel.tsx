"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { AlertTriangle, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { EmptyState } from "@/components/ui/empty-state";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import type { Density } from "@/components/ui/density-toggle";
import { formatRelativeTime } from "@/lib/format/relative-time";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { nextSampleStatuses, type SampleRequestStatus } from "@/domain/sample/state-machine";
import {
  bulkApproveSampleRequestsAction,
  bulkRejectSampleRequestsAction,
  recordSampleFulfillmentAction,
  transitionSampleRequestAction,
} from "@/app/(panel)/panel/numuneler/actions";

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

export type SampleRequestRow = {
  id: string;
  requestNo: string;
  status: SampleRequestStatus;
  requestedAt: string;
  dealerName: string;
  dealerId: string;
  flaggedForReview: boolean;
  flagReason: string | null;
  rejectReason: string | null;
  cargoCompany: string | null;
  trackingNo: string | null;
  itemCount: number;
  items: {
    id: string;
    productName: string;
    packSize: string | null;
    sku: string;
    quantity: number;
    unitCostKurus: number | null;
  }[];
};

export function SampleRequestsPanel({ requests }: { requests: SampleRequestRow[] }) {
  const [data, setData] = useState(requests);
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState<Density>("compact");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const selected = data.find((r) => r.id === selectedId) ?? null;

  const getRowId = useCallback((r: SampleRequestRow) => r.id, []);
  const globalFilterFn = useCallback(
    (row: SampleRequestRow, q: string) =>
      row.requestNo.toLocaleLowerCase("tr-TR").includes(q) ||
      row.dealerName.toLocaleLowerCase("tr-TR").includes(q),
    [],
  );

  function updateRow(id: string, patch: Partial<SampleRequestRow>) {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function handleTransition(id: string, to: SampleRequestStatus, extra?: { rejectReason?: string }) {
    startTransition(async () => {
      try {
        await transitionSampleRequestAction(id, to, extra);
        updateRow(id, { status: to, rejectReason: extra?.rejectReason ?? null });
        toast.success(`Durum güncellendi: ${STATUS_LABEL[to]}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "İşlem başarısız");
      }
    });
  }

  function handleBulkApprove() {
    if (selectedRows.size === 0) return;
    startTransition(async () => {
      try {
        const result = await bulkApproveSampleRequestsAction([...selectedRows]);
        toast.success(`${result.succeeded} talep onaylandı${result.failed > 0 ? `, ${result.failed} başarısız` : ""}`);
        setSelectedRows(new Set());
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "İşlem başarısız");
      }
    });
  }

  function handleBulkReject() {
    if (selectedRows.size === 0) return;
    const reason = window.prompt("Red nedeni (tüm seçili talepler için):");
    if (!reason?.trim()) return;
    startTransition(async () => {
      try {
        const result = await bulkRejectSampleRequestsAction([...selectedRows], reason.trim());
        toast.success(`${result.succeeded} talep reddedildi${result.failed > 0 ? `, ${result.failed} başarısız` : ""}`);
        setSelectedRows(new Set());
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "İşlem başarısız");
      }
    });
  }

  const columns = useMemo<ColumnDef<SampleRequestRow, unknown>[]>(
    () => [
      {
        id: "select",
        header: "",
        size: 32,
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedRows.has(row.original.id)}
            onChange={(e) => {
              setSelectedRows((prev) => {
                const next = new Set(prev);
                if (e.target.checked) next.add(row.original.id);
                else next.delete(row.original.id);
                return next;
              });
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        accessorKey: "requestNo",
        header: "Talep no",
        cell: ({ row }) => (
          <div>
            <p className="font-mono text-[13px]">{row.original.requestNo}</p>
            {row.original.flaggedForReview ? (
              <span className="inline-flex items-center gap-1 text-caption text-[var(--warning-text)]">
                <AlertTriangle className="size-3" /> Limit flag
              </span>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "dealerName",
        header: "Bayi",
        cell: ({ row }) => <span>{row.original.dealerName}</span>,
      },
      {
        accessorKey: "itemCount",
        header: "Ürün",
        cell: ({ row }) => <span className="tabular-nums">{row.original.itemCount}</span>,
      },
      {
        accessorKey: "status",
        header: "Durum",
        cell: ({ row }) => (
          <StatusBadge label={STATUS_LABEL[row.original.status]} tone={STATUS_TONE[row.original.status]} />
        ),
      },
      {
        accessorKey: "requestedAt",
        header: "Tarih",
        cell: ({ row }) => (
          <span className="text-[var(--text-secondary)]">
            {formatRelativeTime(new Date(row.original.requestedAt))}
          </span>
        ),
      },
    ],
    [selectedRows],
  );

  return (
    <div className="space-y-3" data-density={density}>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Talep no veya bayi ara…"
        density={density}
        onDensityChange={setDensity}
        trailing={
          selectedRows.size > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-caption text-muted-foreground">{selectedRows.size} seçili</span>
              <Button type="button" size="sm" disabled={isPending} onClick={handleBulkApprove}>
                Toplu onayla
              </Button>
              <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={handleBulkReject}>
                Toplu reddet
              </Button>
            </div>
          ) : null
        }
      />

      {data.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="Henüz numune talebi yok"
          description="Bayiler numune istediğinde burada görünecek."
        />
      ) : (
        <DataTable
          data={data}
          columns={columns}
          getRowId={getRowId}
          storageKey="panel-sample-requests"
          search={search}
          globalFilterFn={globalFilterFn}
          onRowOpen={(row) => setSelectedId(row.id)}
          emptyTitle="Talep yok"
          emptyDescription="Filtreyi temizleyip tekrar deneyin."
          filterEmptyTitle="Filtre sonucu boş"
          filterEmptyDescription="Aramayı temizleyip tekrar deneyin."
        />
      )}

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected ? (
            <SampleRequestDetail
              request={selected}
              isPending={isPending}
              onTransition={handleTransition}
              onCostSaved={(itemId, unitCostKurus) =>
                updateRow(selected.id, {
                  items: selected.items.map((i) => (i.id === itemId ? { ...i, unitCostKurus } : i)),
                })
              }
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SampleRequestDetail({
  request,
  isPending,
  onTransition,
  onCostSaved,
}: {
  request: SampleRequestRow;
  isPending: boolean;
  onTransition: (id: string, to: SampleRequestStatus, extra?: { rejectReason?: string }) => void;
  onCostSaved: (itemId: string, unitCostKurus: number) => void;
}) {
  const next = nextSampleStatuses(request.status);
  const [costDrafts, setCostDrafts] = useState<Record<string, string>>({});
  const [savingCostId, setSavingCostId] = useState<string | null>(null);

  function saveCost(itemId: string) {
    const raw = costDrafts[itemId];
    const kurus = Math.round(Number(raw?.replace(",", ".") ?? "0") * 100);
    if (!Number.isFinite(kurus) || kurus < 0) {
      toast.error("Geçerli bir maliyet girin");
      return;
    }
    setSavingCostId(itemId);
    recordSampleFulfillmentAction(itemId, { unitCostKurus: kurus })
      .then(() => {
        onCostSaved(itemId, kurus);
        toast.success("Maliyet kaydedildi");
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Kaydedilemedi"))
      .finally(() => setSavingCostId(null));
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-mono">{request.requestNo}</SheetTitle>
        <SheetDescription>{request.dealerName}</SheetDescription>
      </SheetHeader>

      <div className="space-y-4 px-4 pb-4">
        <StatusBadge label={STATUS_LABEL[request.status]} tone={STATUS_TONE[request.status]} />

        {request.flaggedForReview && request.flagReason ? (
          <p className="rounded-lg bg-[var(--warning-subtle)] px-3 py-2 text-caption text-[var(--warning-text)]">
            {request.flagReason}
          </p>
        ) : null}

        {request.rejectReason ? (
          <p className="rounded-lg bg-[var(--danger-subtle)] px-3 py-2 text-caption text-[var(--danger-text)]">
            Red nedeni: {request.rejectReason}
          </p>
        ) : null}

        <ul className="space-y-2">
          {request.items.map((item) => (
            <li key={item.id} className="rounded-xl border border-[var(--panel-border)] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-body-sm font-medium">
                  {item.productName}
                  {item.packSize ? ` · ${item.packSize}` : ""}
                </span>
                <span className="shrink-0 tabular-nums text-caption text-muted-foreground">
                  {item.quantity} adet
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-caption text-muted-foreground">Birim maliyet:</span>
                {item.unitCostKurus != null ? (
                  <span className="text-caption font-medium">{formatMoney(money(item.unitCostKurus))}</span>
                ) : (
                  <>
                    <Input
                      value={costDrafts[item.id] ?? ""}
                      onChange={(e) => setCostDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      placeholder="0.00"
                      className="h-8 w-24"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={savingCostId === item.id}
                      onClick={() => saveCost(item.id)}
                    >
                      Kaydet
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>

        {next.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t border-[var(--panel-border)] pt-3">
            {next.map((status) => (
              <Button
                key={status}
                type="button"
                size="sm"
                variant={status === "REDDEDILDI" || status === "IPTAL" ? "outline" : "default"}
                disabled={isPending}
                onClick={() => {
                  if (status === "REDDEDILDI") {
                    const reason = window.prompt("Red nedeni:");
                    if (!reason?.trim()) return;
                    onTransition(request.id, status, { rejectReason: reason.trim() });
                  } else {
                    onTransition(request.id, status);
                  }
                }}
                className={status === "REDDEDILDI" ? "text-[var(--danger-text)]" : undefined}
              >
                {STATUS_LABEL[status]}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
