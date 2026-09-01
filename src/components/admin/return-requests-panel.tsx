"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Undo2 } from "lucide-react";
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
import { nextReturnStatuses, type ReturnRequestStatus } from "@/domain/return/state-machine";
import type { ReturnReason } from "@/domain/return/reasons";
import { transitionReturnRequestAction } from "@/app/(panel)/panel/iadeler/actions";

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

export type ReturnRequestRow = {
  id: string;
  returnNo: string;
  status: ReturnRequestStatus;
  requestedAt: string;
  dealerName: string;
  dealerId: string;
  orderId: string;
  rejectReason: string | null;
  shippingCostResponsibility: "YETIS" | "BAYI" | null;
  items: {
    id: string;
    productName: string;
    sku: string;
    reason: ReturnReason;
    reasonLabel: string;
    requestedQty: number;
    approvedQty: number | null;
    acceptedGoodQty: number | null;
    acceptedDamagedQty: number | null;
    photoUrls: string[];
    lotNumber: string | null;
    unitPriceKurus: number;
  }[];
};

export function ReturnRequestsPanel({
  requests,
  openId,
}: {
  requests: ReturnRequestRow[];
  openId?: string;
}) {
  const [data, setData] = useState(requests);
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState<Density>("compact");
  const [selectedId, setSelectedId] = useState<string | null>(
    openId && requests.some((r) => r.id === openId) ? openId : null,
  );

  const selected = data.find((r) => r.id === selectedId) ?? null;

  const getRowId = useCallback((r: ReturnRequestRow) => r.id, []);
  const globalFilterFn = useCallback(
    (row: ReturnRequestRow, q: string) =>
      row.returnNo.toLocaleLowerCase("tr-TR").includes(q) ||
      row.dealerName.toLocaleLowerCase("tr-TR").includes(q),
    [],
  );

  function updateRow(id: string, patch: Partial<ReturnRequestRow>) {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  const columns = useMemo<ColumnDef<ReturnRequestRow, unknown>[]>(
    () => [
      {
        accessorKey: "returnNo",
        header: "İade no",
        cell: ({ row }) => <span className="font-mono text-[13px]">{row.original.returnNo}</span>,
      },
      { accessorKey: "dealerName", header: "Bayi" },
      {
        id: "itemCount",
        header: "Kalem",
        cell: ({ row }) => <span className="tabular-nums">{row.original.items.length}</span>,
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
    [],
  );

  return (
    <div className="space-y-3" data-density={density}>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="İade no veya bayi ara…"
        density={density}
        onDensityChange={setDensity}
      />

      {data.length === 0 ? (
        <EmptyState icon={Undo2} title="Henüz iade talebi yok" description="Bayiler iade istediğinde burada görünecek." />
      ) : (
        <DataTable
          data={data}
          columns={columns}
          getRowId={getRowId}
          storageKey="panel-return-requests"
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
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected ? <ReturnRequestDetail request={selected} onUpdated={(patch) => updateRow(selected.id, patch)} /> : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ReturnRequestDetail({
  request,
  onUpdated,
}: {
  request: ReturnRequestRow;
  onUpdated: (patch: Partial<ReturnRequestRow>) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [approvedDrafts, setApprovedDrafts] = useState<Record<string, number>>(
    Object.fromEntries(request.items.map((i) => [i.id, i.approvedQty ?? i.requestedQty])),
  );
  const [acceptedDrafts, setAcceptedDrafts] = useState<Record<string, { goodQty: number; damagedQty: number }>>(
    Object.fromEntries(
      request.items.map((i) => [i.id, { goodQty: i.approvedQty ?? 0, damagedQty: 0 }]),
    ),
  );

  const next = nextReturnStatuses(request.status);

  function run(to: ReturnRequestStatus, input?: Parameters<typeof transitionReturnRequestAction>[2]) {
    startTransition(async () => {
      try {
        const result = await transitionReturnRequestAction(request.id, to, input);
        onUpdated({
          status: to,
          rejectReason: input?.rejectReason ?? null,
          items: request.items.map((item) => {
            const approvedQty = input?.approvedQtyByItem?.[item.id];
            const accepted = input?.acceptedByItem?.[item.id];
            return {
              ...item,
              ...(approvedQty !== undefined ? { approvedQty } : {}),
              ...(accepted ? { acceptedGoodQty: accepted.goodQty, acceptedDamagedQty: accepted.damagedQty } : {}),
            };
          }),
        });
        toast.success(`Durum güncellendi: ${STATUS_LABEL[to]}`);
        if (result.warnings.length > 0) {
          for (const w of result.warnings) toast.warning(w);
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "İşlem başarısız");
      }
    });
  }

  function handleApprove() {
    run("ONAYLANDI", { approvedQtyByItem: approvedDrafts });
  }

  function handleWarehouseAccept() {
    run("URUN_TESLIM_ALINDI", { acceptedByItem: acceptedDrafts });
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-mono">{request.returnNo}</SheetTitle>
        <SheetDescription>{request.dealerName}</SheetDescription>
      </SheetHeader>

      <div className="space-y-4 px-4 pb-4">
        <StatusBadge label={STATUS_LABEL[request.status]} tone={STATUS_TONE[request.status]} />

        {request.rejectReason ? (
          <p className="rounded-lg bg-[var(--danger-subtle)] px-3 py-2 text-caption text-[var(--danger-text)]">
            Red nedeni: {request.rejectReason}
          </p>
        ) : null}

        <ul className="space-y-2">
          {request.items.map((item) => (
            <li key={item.id} className="rounded-xl border border-[var(--panel-border)] p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-body-sm font-medium">{item.productName}</span>
                <span className="shrink-0 font-mono text-caption text-muted-foreground">{item.sku}</span>
              </div>
              <p className="text-caption text-muted-foreground">
                {item.reasonLabel} · Talep: {item.requestedQty} adet · {formatMoney(money(item.unitPriceKurus))}/birim
                {item.lotNumber ? ` · Lot: ${item.lotNumber}` : ""}
              </p>
              {item.photoUrls.length > 0 ? (
                <div className="flex gap-1.5">
                  {item.photoUrls.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="size-14 rounded-md object-cover ring-1 ring-black/5" />
                    </a>
                  ))}
                </div>
              ) : null}

              {request.status === "INCELENIYOR" ? (
                <div className="flex items-center gap-2">
                  <span className="text-caption text-muted-foreground">Onaylanacak adet:</span>
                  <Input
                    type="number"
                    min={0}
                    max={item.requestedQty}
                    value={approvedDrafts[item.id] ?? item.requestedQty}
                    onChange={(e) =>
                      setApprovedDrafts((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))
                    }
                    className="h-8 w-20"
                  />
                </div>
              ) : null}

              {request.status === "ONAYLANDI" ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-caption text-muted-foreground">Onaylanan: {item.approvedQty}</span>
                  <label className="flex items-center gap-1.5 text-caption">
                    Sağlam
                    <Input
                      type="number"
                      min={0}
                      value={acceptedDrafts[item.id]?.goodQty ?? 0}
                      onChange={(e) =>
                        setAcceptedDrafts((prev) => ({
                          ...prev,
                          [item.id]: { ...prev[item.id]!, goodQty: Number(e.target.value) },
                        }))
                      }
                      className="h-8 w-16"
                    />
                  </label>
                  <label className="flex items-center gap-1.5 text-caption">
                    Hasarlı/imha
                    <Input
                      type="number"
                      min={0}
                      value={acceptedDrafts[item.id]?.damagedQty ?? 0}
                      onChange={(e) =>
                        setAcceptedDrafts((prev) => ({
                          ...prev,
                          [item.id]: { ...prev[item.id]!, damagedQty: Number(e.target.value) },
                        }))
                      }
                      className="h-8 w-16"
                    />
                  </label>
                </div>
              ) : null}

              {(item.acceptedGoodQty != null || item.acceptedDamagedQty != null) &&
              request.status !== "ONAYLANDI" ? (
                <p className="text-caption text-muted-foreground">
                  Depo kabul: sağlam {item.acceptedGoodQty ?? 0}, hasarlı/imha {item.acceptedDamagedQty ?? 0}
                </p>
              ) : null}
            </li>
          ))}
        </ul>

        {next.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t border-[var(--panel-border)] pt-3">
            {next.map((status) => {
              if (status === "ONAYLANDI") {
                return (
                  <Button key={status} type="button" size="sm" disabled={isPending} onClick={handleApprove}>
                    Onayla
                  </Button>
                );
              }
              if (status === "URUN_TESLIM_ALINDI") {
                return (
                  <Button key={status} type="button" size="sm" disabled={isPending} onClick={handleWarehouseAccept}>
                    Depo kabulünü kaydet
                  </Button>
                );
              }
              if (status === "REDDEDILDI") {
                return (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    className="text-[var(--danger-text)]"
                    onClick={() => {
                      const reason = window.prompt("Red nedeni:");
                      if (!reason?.trim()) return;
                      run(status, { rejectReason: reason.trim() });
                    }}
                  >
                    Reddet
                  </Button>
                );
              }
              return (
                <Button key={status} type="button" size="sm" disabled={isPending} onClick={() => run(status)}>
                  {STATUS_LABEL[status]}
                </Button>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
}
