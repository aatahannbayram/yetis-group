"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { MetricStrip } from "@/components/ui/metric-strip";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { StatusPill } from "@/components/ui/status-pill";
import { FilterChip } from "@/components/ui/filter-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadDetailSheet } from "@/components/admin/lead-detail-sheet";
import { LeadsKanban } from "@/components/admin/leads-kanban";
import type { LeadItem } from "@/components/admin/leads-board";
import { LEAD_STAGE_LABELS, LEAD_STAGES, type LeadStage } from "@/domain/leads";
import { formatKg } from "@/lib/format/weight";
import { kg } from "@/domain/weight";
import {
  leadStaleBorder,
  leadStaleDays,
  leadStaleLabel,
  leadStaleTone,
} from "@/features/staff/leads/staleness";
import type { Density } from "@/components/ui/density-toggle";
import type { ViewMode } from "@/components/ui/view-switcher";
import { cn } from "@/lib/utils";
import { bulkTransitionLeadStageAction } from "@/app/(panel)/panel/bayi-adaylari/actions";

export type LeadListItem = LeadItem & { updatedAt: string };

function nextAction(lead: LeadListItem): string {
  const openTask = lead.tasks.find((t) => !t.doneAt);
  if (openTask) return openTask.title;
  if (lead.stage === "YENI") return "İlk arama yap";
  if (lead.stage === "ILETISIMDE") return "İhtiyaç netleştir";
  if (lead.stage === "NITELIKLI") return "Numune planla";
  if (lead.stage === "NUMUNE" || lead.stage === "NUMUNE_TEKLIF") return "Numune takibi";
  if (lead.stage === "TEKLIF" || lead.stage === "MUZAKERE") return "Teklifi kapat";
  return "-";
}

export function LeadsListPage({ leads }: { leads: LeadListItem[] }) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [density, setDensity] = useState<Density>("compact");
  const [activeView, setActiveView] = useState("all");
  const [metricFilter, setMetricFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [bulkStage, setBulkStage] = useState<LeadStage>("ILETISIMDE");
  const [bulkLostReason, setBulkLostReason] = useState("");
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkPending, startBulk] = useTransition();

  const selectedIds = useMemo(
    () => Object.keys(rowSelection).filter((k) => rowSelection[k]),
    [rowSelection],
  );

  const openLeads = useMemo(
    () => leads.filter((l) => l.stage !== "KAZANILDI" && l.stage !== "KAYBEDILDI"),
    [leads],
  );

  const metrics = useMemo(() => {
    const stale = openLeads.filter((l) => leadStaleDays(l.updatedAt) >= 4).length;
    const critical = openLeads.filter((l) => leadStaleDays(l.updatedAt) >= 15).length;
    const potential = openLeads.reduce(
      (sum, l) => sum + (l.estimatedMonthlyKg ? Number(l.estimatedMonthlyKg) : 0),
      0,
    );
    return [
      { id: "open", label: "Açık", value: openLeads.length },
      { id: "stale", label: "Bayat (4+ gün)", value: stale, tone: "warn" as const },
      { id: "critical", label: "Kritik (15+)", value: critical, tone: "danger" as const },
      {
        id: "potential",
        label: "Potansiyel kg/ay",
        value: Math.round(potential).toLocaleString("tr-TR"),
      },
      {
        id: "won",
        label: "Kazanılan",
        value: leads.filter((l) => l.stage === "KAZANILDI").length,
        tone: "info" as const,
      },
    ];
  }, [leads, openLeads]);

  const filtered = useMemo(() => {
    let rows = leads;
    if (activeView === "open") rows = openLeads;
    if (activeView === "stale") {
      rows = openLeads.filter((l) => leadStaleDays(l.updatedAt) >= 4);
    }
    if (metricFilter === "stale") {
      rows = openLeads.filter((l) => leadStaleDays(l.updatedAt) >= 4);
    }
    if (metricFilter === "critical") {
      rows = openLeads.filter((l) => leadStaleDays(l.updatedAt) >= 15);
    }
    if (metricFilter === "open") rows = openLeads;
    if (metricFilter === "won") rows = leads.filter((l) => l.stage === "KAZANILDI");
    return rows;
  }, [leads, openLeads, activeView, metricFilter]);

  const displayed = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    if (!q) return filtered;
    return filtered.filter(
      (row) =>
        row.companyName.toLocaleLowerCase("tr-TR").includes(q) ||
        row.contactName.toLocaleLowerCase("tr-TR").includes(q),
    );
  }, [filtered, search]);

  const columns = useMemo<ColumnDef<LeadListItem, unknown>[]>(
    () => [
      {
        accessorKey: "companyName",
        header: "Firma",
        minSize: 220,
        cell: ({ row }) => (
          <div className="min-w-0 max-w-[280px]">
            <p
              className="truncate font-medium text-stone-900 dark:text-zinc-50"
              title={row.original.companyName}
            >
              {row.original.companyName}
            </p>
            <p
              className="truncate text-xs text-stone-500 dark:text-zinc-400"
              title={row.original.contactName}
            >
              {row.original.contactName}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "stage",
        header: "Aşama",
        cell: ({ getValue }) => {
          const stage = getValue() as LeadListItem["stage"];
          return <StatusPill label={LEAD_STAGE_LABELS[stage]} tone="progress" />;
        },
      },
      {
        id: "assignee",
        header: "Sahip",
        cell: ({ row }) => (
          <span
            className="truncate text-stone-600 dark:text-zinc-400"
            title={row.original.assigneeName ?? "Atanmadı"}
          >
            {row.original.assigneeName ?? "Atanmadı"}
          </span>
        ),
      },
      {
        id: "potential",
        header: "Potansiyel",
        cell: ({ row }) => (
          <span className="tabular-nums text-stone-700 dark:text-zinc-300">
            {row.original.estimatedMonthlyKg
              ? formatKg(kg(row.original.estimatedMonthlyKg))
              : "-"}
          </span>
        ),
      },
      {
        id: "stale",
        header: "Bekleme",
        sortingFn: (a, b) =>
          leadStaleDays(a.original.updatedAt) - leadStaleDays(b.original.updatedAt),
        cell: ({ row }) => {
          const days = leadStaleDays(row.original.updatedAt);
          const tone = leadStaleTone(days);
          return (
            <StatusPill
              label={leadStaleLabel(days)}
              tone={
                tone === "critical"
                  ? "danger"
                  : tone === "urgent"
                    ? "warn"
                    : tone === "warn"
                      ? "skt-warn"
                      : "neutral"
              }
            />
          );
        },
      },
      {
        id: "next",
        header: "Sonraki aksiyon",
        minSize: 160,
        cell: ({ row }) => {
          const label = nextAction(row.original);
          return (
            <span
              className="block max-w-[200px] truncate text-stone-600 dark:text-zinc-400"
              title={label}
            >
              {label}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        size: 48,
        enableSorting: false,
        cell: () => (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="İşlemler"
            className="text-stone-400 hover:text-stone-700"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        ),
      },
    ],
    [],
  );

  const selectedLead = leads.find((l) => l.id === selectedId) ?? null;

  const getRowId = useCallback((r: LeadListItem) => r.id, []);
  const globalFilterFn = useCallback(
    (row: LeadListItem, q: string) =>
      row.companyName.toLocaleLowerCase("tr-TR").includes(q) ||
      row.contactName.toLocaleLowerCase("tr-TR").includes(q),
    [],
  );
  const staleLeftBorder = useCallback(
    (row: LeadListItem) => leadStaleBorder(leadStaleDays(row.updatedAt)),
    [],
  );

  return (
    <div
      className="-mx-3 -my-4 bg-stone-50 px-3 py-4 sm:-mx-4 sm:-my-5 sm:px-4 sm:py-5 md:-m-6 md:p-6 dark:bg-zinc-950"
      data-density={density}
    >
      <div
        className={cn(
          "mx-auto space-y-5",
          viewMode === "kanban" ? "max-w-none" : "max-w-5xl",
        )}
      >
        <PageHeader
          title="Bayi/Müşteri adayları"
          count={leads.length}
          description="Başvurular, aşama ve sonraki aksiyon."
          primaryAction={<Button className="h-9">Yeni aday</Button>}
        />

        <MetricStrip
          items={metrics}
          activeId={metricFilter}
          onSelect={(id) => setMetricFilter((cur) => (cur === id ? null : id))}
        />

        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-stone-200 px-3 py-2 dark:border-zinc-800">
            <ListToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Firma veya kişi ara…"
              views={[
                { id: "all", label: "Tümü" },
                { id: "open", label: "Açık" },
                { id: "stale", label: "Bayat" },
              ]}
              activeViewId={activeView}
              onViewSelect={setActiveView}
              filters={
                metricFilter ? (
                  <FilterChip
                    label={metrics.find((m) => m.id === metricFilter)?.label ?? metricFilter}
                    active
                    onClear={() => setMetricFilter(null)}
                  />
                ) : null
              }
              density={density}
              onDensityChange={setDensity}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              viewModes={["table", "kanban"]}
            />
          </div>

          {viewMode === "table" ? (
            <DataTable
              data={displayed}
              columns={columns}
              getRowId={getRowId}
              storageKey="leads"
              search=""
              globalFilterFn={globalFilterFn}
              onRowOpen={(row) => setSelectedId(row.id)}
              enableSelection
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              staleLeftBorder={staleLeftBorder}
              emptyTitle="Aday yok"
              emptyDescription="Filtreleri temizleyin veya yeni başvuru bekleyin."
            />
          ) : (
            <div className="bg-gradient-to-b from-stone-50/80 to-white p-4 dark:from-zinc-950/80 dark:to-zinc-900">
              {displayed.length === 0 ? (
                <p className="py-12 text-center text-sm text-stone-500">
                  Bu görünümde aday yok.
                </p>
              ) : (
                <LeadsKanban leads={displayed} onOpen={(id) => setSelectedId(id)} />
              )}
            </div>
          )}
        </div>
      </div>

      <BulkActionBar
        count={selectedIds.length}
        onClear={() => setRowSelection({})}
      >
        <Button
          size="sm"
          variant="secondary"
          disabled={selectedIds.length === 0}
          onClick={() => {
            setBulkError(null);
            setBulkLostReason("");
            setBulkStage("ILETISIMDE");
            setStageDialogOpen(true);
          }}
        >
          Aşama değiştir
        </Button>
      </BulkActionBar>

      <Dialog open={stageDialogOpen} onOpenChange={setStageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aşama değiştir</DialogTitle>
            <DialogDescription>
              Seçili {selectedIds.length} aday için hedef aşamayı seçin. Geçersiz
              geçişler atlanır.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-stone-500">Hedef aşama</span>
              <Select
                value={bulkStage}
                onValueChange={(v) => setBulkStage(v as LeadStage)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {LEAD_STAGE_LABELS[stage]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            {bulkStage === "KAYBEDILDI" ? (
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-500">Kayıp nedeni</span>
                <Input
                  value={bulkLostReason}
                  onChange={(e) => setBulkLostReason(e.target.value)}
                  placeholder="Örn. fiyat, rakip, zamanlama"
                  required
                />
              </label>
            ) : null}
            {bulkError ? (
              <p className="text-sm text-red-600 dark:text-red-400">{bulkError}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStageDialogOpen(false)}
              disabled={bulkPending}
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              disabled={
                bulkPending ||
                selectedIds.length === 0 ||
                (bulkStage === "KAYBEDILDI" && !bulkLostReason.trim())
              }
              onClick={() => {
                setBulkError(null);
                startBulk(async () => {
                  try {
                    const result = await bulkTransitionLeadStageAction({
                      leadIds: selectedIds,
                      toStage: bulkStage,
                      lostReason:
                        bulkStage === "KAYBEDILDI" ? bulkLostReason.trim() : null,
                    });
                    if (result.failed > 0 && result.updated === 0) {
                      setBulkError(
                        result.errors[0] ??
                          `${result.failed} aday güncellenemedi.`,
                      );
                      return;
                    }
                    if (result.failed > 0) {
                      setBulkError(
                        `${result.updated} güncellendi, ${result.failed} atlandı${
                          result.errors[0] ? `: ${result.errors[0]}` : "."
                        }`,
                      );
                      return;
                    }
                    setRowSelection({});
                    setStageDialogOpen(false);
                  } catch (err) {
                    setBulkError(
                      err instanceof Error ? err.message : "Aşama güncellenemedi.",
                    );
                  }
                });
              }}
            >
              {bulkPending ? "Güncelleniyor…" : "Uygula"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LeadDetailSheet
        lead={selectedLead}
        open={Boolean(selectedLead)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </div>
  );
}
