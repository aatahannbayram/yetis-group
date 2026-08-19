"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Download, FileSpreadsheet, FileText, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/format/money";
import { formatDate } from "@/lib/format/date";
import { money } from "@/domain/money";
import { proformaSettlementBadge } from "@/domain/ledger";
import { cn } from "@/lib/utils";
import type { Density } from "@/components/ui/density-toggle";
import {
  resendProformaAction,
  exportFaturalarExcelAction,
  exportFaturalarPdfAction,
} from "@/app/(panel)/panel/faturalar/actions";
import type { FaturaExportRow } from "@/infra/export/faturalar-excel";

function downloadBase64(base64: string, filename: string, mime: string) {
  const bytes = atob(base64);
  const buf = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
  const blob = new Blob([buf], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const DEALER_TYPE_LABEL: Record<string, string> = {
  BAYI: "Bayi",
  HORECA: "HORECA",
  ZINCIR: "Müşteri (zincir)",
  ARA_TOPTANCI: "Ara toptancı",
};

export type FaturaLineRow = {
  id: string;
  description: string;
  quantity: number;
  unitPriceKurus: number;
  vatRateBasisPoints: number;
  lineTotalKurus: number;
};

export type FaturaRow = {
  id: string;
  orderId: string;
  number: string;
  status: "DRAFT" | "ISSUED" | "VOID";
  version: number;
  dealerName: string;
  dealerType: string;
  buyerVergiNo: string | null;
  buyerVergiDairesi: string | null;
  buyerAddress: string | null;
  buyerEmail: string | null;
  subtotalKurus: number;
  vatKurus: number;
  totalKurus: number;
  pdfPath: string | null;
  issuedAt: string;
  sentAt: string | null;
  paymentMethod: "HAVALE" | "CARI" | "ONLINE" | null;
  paidAt: string | null;
  paymentTermDays: number | null;
  lines: FaturaLineRow[];
};

function statusBadge(status: FaturaRow["status"]) {
  if (status === "VOID") return { tone: "neutral" as const, label: "İptal" };
  if (status === "DRAFT") return { tone: "warning" as const, label: "Taslak" };
  return { tone: "success" as const, label: "Düzenlendi" };
}

export function FaturaList({ faturalar }: { faturalar: FaturaRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState<Density>("compact");
  const [viewFilter, setViewFilter] = useState("all");
  const [pending, startTransition] = useTransition();
  const [sendMessage, setSendMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const open = faturalar.find((f) => f.id === openId) ?? null;

  function close() {
    setOpenId(null);
    setSendMessage(null);
  }

  const filtered = useMemo(() => {
    if (viewFilter === "unsent") {
      return faturalar.filter((f) => f.status === "ISSUED" && !f.sentAt);
    }
    if (viewFilter === "void") return faturalar.filter((f) => f.status === "VOID");
    return faturalar;
  }, [faturalar, viewFilter]);

  const getRowId = useCallback((r: FaturaRow) => r.id, []);
  const globalFilterFn = useCallback(
    (row: FaturaRow, q: string) =>
      row.number.toLocaleLowerCase("tr-TR").includes(q) ||
      row.dealerName.toLocaleLowerCase("tr-TR").includes(q),
    [],
  );

  const exportRows = useMemo<FaturaExportRow[]>(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    const base = q ? filtered.filter((f) => globalFilterFn(f, q)) : filtered;
    return base.map((f) => ({
      number: f.number,
      status: f.status,
      version: f.version,
      dealerName: f.dealerName,
      dealerType: DEALER_TYPE_LABEL[f.dealerType] ?? f.dealerType,
      subtotalKurus: f.subtotalKurus,
      vatKurus: f.vatKurus,
      totalKurus: f.totalKurus,
      sentAt: f.sentAt,
      issuedAt: f.issuedAt,
    }));
  }, [filtered, search, globalFilterFn]);

  async function runExport(format: "excel" | "pdf") {
    setExportError(null);
    setExporting(format);
    try {
      const result =
        format === "excel"
          ? await exportFaturalarExcelAction(exportRows)
          : await exportFaturalarPdfAction(exportRows);
      if (result.ok) {
        downloadBase64(result.base64, result.filename, result.mime);
      } else {
        setExportError(result.error);
      }
    } finally {
      setExporting(null);
    }
  }

  const columns = useMemo<ColumnDef<FaturaRow, unknown>[]>(
    () => [
      {
        accessorKey: "number",
        header: "Fatura",
        minSize: 180,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="font-mono text-sm font-medium text-stone-900 dark:text-zinc-50">
              {row.original.number}
            </p>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">
              {formatDate(new Date(row.original.issuedAt))}
              {row.original.version > 1 ? ` · v${row.original.version}` : ""}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "dealerName",
        header: "Bayi",
        minSize: 200,
        cell: ({ row }) => (
          <div className="min-w-0 max-w-[240px]">
            <p className="truncate text-sm text-stone-900 dark:text-zinc-50" title={row.original.dealerName}>
              {row.original.dealerName}
            </p>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              {DEALER_TYPE_LABEL[row.original.dealerType] ?? row.original.dealerType}
            </p>
          </div>
        ),
      },
      {
        id: "total",
        header: "Tutar",
        accessorFn: (r) => r.totalKurus,
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums text-stone-900 dark:text-zinc-50">
            {formatMoney(money(row.original.totalKurus))}
          </span>
        ),
      },
      {
        id: "status",
        header: "Durum",
        cell: ({ row }) => {
          const s = statusBadge(row.original.status);
          return <StatusBadge tone={s.tone} label={s.label} />;
        },
      },
      {
        id: "sent",
        header: "Gönderim",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.sentAt ? (
            <StatusBadge tone="success" label="Gönderildi" />
          ) : (
            <StatusBadge tone="warning" label="Gönderilmedi" />
          ),
      },
    ],
    [],
  );

  return (
    <div
      className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      data-density={density}
    >
      <div className="border-b border-stone-200 px-3 py-2 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ListToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Fatura no veya bayi ara…"
            views={[
              { id: "all", label: "Tümü" },
              { id: "unsent", label: "Gönderilmedi" },
              { id: "void", label: "İptal" },
            ]}
            activeViewId={viewFilter}
            onViewSelect={setViewFilter}
            density={density}
            onDensityChange={setDensity}
          />
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              disabled={exporting !== null || exportRows.length === 0}
              onClick={() => runExport("excel")}
            >
              {exporting === "excel" ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <FileSpreadsheet className="size-3.5" aria-hidden />
              )}
              Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              disabled={exporting !== null || exportRows.length === 0}
              onClick={() => runExport("pdf")}
            >
              {exporting === "pdf" ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <FileText className="size-3.5" aria-hidden />
              )}
              PDF
            </Button>
          </div>
        </div>
        {exportError ? (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="status">
            {exportError}
          </p>
        ) : null}
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        getRowId={getRowId}
        storageKey="panel-faturalar"
        search={search}
        globalFilterFn={globalFilterFn}
        onRowOpen={(row) => setOpenId(row.id)}
        emptyTitle="Fatura yok"
        emptyDescription="Sipariş oluştuğunda proforma fatura otomatik düzenlenir."
        filterEmptyTitle="Filtre sonucu boş"
        filterEmptyDescription="Görünümü veya aramayı temizleyip tekrar deneyin."
      />

      <Sheet open={open !== null} onOpenChange={(o) => !o && close()}>
        <SheetContent className="w-full gap-0 border-stone-200 bg-white p-0 sm:max-w-lg dark:border-zinc-800 dark:bg-zinc-950">
          {open ? (
            <>
              <SheetHeader className="space-y-1 border-b border-stone-200 px-5 py-4 text-left dark:border-zinc-800">
                <SheetTitle className="pr-8 font-mono text-lg font-semibold tracking-tight text-stone-900 dark:text-zinc-50">
                  {open.number}
                </SheetTitle>
                <SheetDescription className="text-sm text-stone-500 dark:text-zinc-400">
                  {open.dealerName} · {formatDate(new Date(open.issuedAt))}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 space-y-5 overflow-y-auto bg-stone-50/50 px-5 py-5 dark:bg-zinc-950">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone="info" label="Proforma" />
                  {(() => {
                    const s = statusBadge(open.status);
                    return <StatusBadge tone={s.tone} label={s.label} />;
                  })()}
                  {(() => {
                    const settlement = proformaSettlementBadge({
                      paymentMethod: open.paymentMethod,
                      paidAt: open.paidAt,
                      sentAt: open.sentAt,
                      paymentTermDays: open.paymentTermDays,
                    });
                    if (!settlement || settlement.kind === "unsent") return null;
                    const tone = settlement.kind === "paid" ? ("success" as const) : ("warning" as const);
                    return <StatusBadge tone={tone} label={settlement.label} />;
                  })()}
                  {open.sentAt ? (
                    <StatusBadge tone="success" label={`Gönderildi · ${formatDate(new Date(open.sentAt))}`} />
                  ) : (
                    <StatusBadge tone="warning" label="Gönderilmedi" />
                  )}
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">Alıcı</p>
                  <p className="mt-1 text-sm font-medium text-stone-900 dark:text-zinc-50">
                    {open.dealerName}
                  </p>
                  {open.buyerVergiNo ? (
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">
                      VN: {open.buyerVergiNo}
                      {open.buyerVergiDairesi ? ` · ${open.buyerVergiDairesi}` : ""}
                    </p>
                  ) : null}
                  {open.buyerAddress ? (
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">{open.buyerAddress}</p>
                  ) : null}
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">
                    {open.buyerEmail ?? "E-posta tanımlı değil"}
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="mb-2.5 text-xs font-medium tracking-wide text-stone-500 uppercase">
                    Kalemler
                  </p>
                  <div className="space-y-2">
                    {open.lines.map((line) => (
                      <div key={line.id} className="flex items-start justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <p className="truncate text-stone-900 dark:text-zinc-50">{line.description}</p>
                          <p className="text-xs text-stone-500 dark:text-zinc-400">
                            {line.quantity} adet · %{(line.vatRateBasisPoints / 100).toString()} KDV
                          </p>
                        </div>
                        <span className="shrink-0 font-medium tabular-nums text-stone-900 dark:text-zinc-50">
                          {formatMoney(money(line.lineTotalKurus))}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1 border-t border-stone-200 pt-3 text-sm dark:border-zinc-800">
                    <div className="flex justify-between text-stone-500 dark:text-zinc-400">
                      <span>Ara toplam</span>
                      <span className="tabular-nums">{formatMoney(money(open.subtotalKurus))}</span>
                    </div>
                    <div className="flex justify-between text-stone-500 dark:text-zinc-400">
                      <span>KDV</span>
                      <span className="tabular-nums">{formatMoney(money(open.vatKurus))}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-stone-900 dark:text-zinc-50">
                      <span>Genel toplam</span>
                      <span className="tabular-nums">{formatMoney(money(open.totalKurus))}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {open.pdfPath ? (
                    <Button asChild className="h-10 w-full">
                      <a href={`/${open.pdfPath}`} target="_blank" rel="noreferrer">
                        <Download className="size-4" aria-hidden />
                        PDF görüntüle / indir
                      </a>
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full"
                    disabled={pending || open.status !== "ISSUED"}
                    onClick={() => {
                      setSendMessage(null);
                      startTransition(async () => {
                        const result = await resendProformaAction(open.id);
                        setSendMessage(
                          result.ok
                            ? result.mocked
                              ? "Gönderildi (dev: e-posta loglandı, gerçek gönderim yok)"
                              : "E-posta gönderildi"
                            : result.error,
                        );
                      });
                    }}
                  >
                    {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
                    Yeniden gönder
                  </Button>
                  {sendMessage ? (
                    <p
                      className={cn(
                        "text-center text-xs",
                        sendMessage.includes("gönderildi") || sendMessage.includes("Gönderildi")
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400",
                      )}
                      role="status"
                    >
                      {sendMessage}
                    </p>
                  ) : null}
                  <Link
                    href="/panel/siparisler"
                    className="text-center text-xs font-medium text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Siparişe git
                  </Link>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
