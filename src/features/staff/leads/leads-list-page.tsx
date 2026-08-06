"use client";

import { useCallback, useMemo, useState } from "react";
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
import { LeadDetailSheet } from "@/components/admin/lead-detail-sheet";
import type { LeadItem } from "@/components/admin/leads-board";
import { LEAD_STAGES, LEAD_STAGE_LABELS } from "@/domain/leads";
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

export type LeadListItem = LeadItem & { updatedAt: string };

function nextAction(lead: LeadListItem): string {
  const openTask = lead.tasks.find((t) => !t.doneAt);
  if (openTask) return openTask.title;
  if (lead.stage === "YENI") return "İlk arama yap";
  if (lead.stage === "ILETISIMDE") return "İhtiyaç netleştir";
  if (lead.stage === "NITELIKLI") return "Numune planla";
  if (lead.stage === "NUMUNE" || lead.stage === "NUMUNE_TEKLIF") return "Numune takibi";
  if (lead.stage === "TEKLIF" || lead.stage === "MUZAKERE") return "Teklifi kapat";
  return "—";
}

export function LeadsListPage({ leads }: { leads: LeadListItem[] }) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [density, setDensity] = useState<Density>("compact");
  const [activeView, setActiveView] = useState("all");
  const [metricFilter, setMetricFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

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

  const columns = useMemo<ColumnDef<LeadListItem, unknown>[]>(
    () => [
      {
        accessorKey: "companyName",
        header: "Firma",
        minSize: 220,
        cell: ({ row }) => (
          <div className="min-w-0 max-w-[280px]">
            <p className="truncate font-medium text-[var(--panel-ink)]" title={row.original.companyName}>
              {row.original.companyName}
            </p>
            <p className="truncate text-caption text-[var(--panel-ink-muted)]" title={row.original.contactName}>
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
          <span className="truncate" title={row.original.assigneeName ?? "Atanmadı"}>
            {row.original.assigneeName ?? "Atanmadı"}
          </span>
        ),
      },
      {
        id: "potential",
        header: "Potansiyel",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.estimatedMonthlyKg
              ? formatKg(kg(row.original.estimatedMonthlyKg))
              : "—"}
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
            <span className="block max-w-[200px] truncate" title={label}>
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
          <Button type="button" variant="ghost" size="icon-sm" aria-label="İşlemler">
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
    <div className="mx-auto max-w-7xl space-y-4" data-density={density}>
      <PageHeader
        title="Bayi adayları"
        count={leads.length}
        actions={
          <Button className="bg-[var(--panel-accent-action)] hover:bg-brand-800">Yeni aday</Button>
        }
      />

      <MetricStrip
        items={metrics}
        activeId={metricFilter}
        onSelect={(id) => setMetricFilter((cur) => (cur === id ? null : id))}
      />

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

      {viewMode === "table" ? (
        <DataTable
          data={filtered}
          columns={columns}
          getRowId={getRowId}
          storageKey="leads"
          search={search}
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
        <KanbanView
          leads={filtered}
          onOpen={(id) => setSelectedId(id)}
        />
      )}

      <BulkActionBar
        count={Object.keys(rowSelection).filter((k) => rowSelection[k]).length}
        onClear={() => setRowSelection({})}
      >
        <Button size="sm" variant="secondary">
          Aşama değiştir
        </Button>
        <Button size="sm" variant="secondary">
          Sahip ata
        </Button>
      </BulkActionBar>

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

function KanbanView({
  leads,
  onOpen,
}: {
  leads: LeadListItem[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {LEAD_STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.stage === stage);
        const potential = stageLeads.reduce(
          (s, l) => s + (l.estimatedMonthlyKg ? Number(l.estimatedMonthlyKg) : 0),
          0,
        );
        const empty = stageLeads.length === 0;
        return (
          <div
            key={stage}
            className={cn(
              "shrink-0 rounded-[var(--radius-md)] border border-[var(--panel-border)] bg-neutral-50/80",
              empty ? "w-12" : "w-64",
            )}
          >
            <div
              className={cn(
                "border-b border-[var(--panel-border)] px-2 py-2",
                empty && "px-1 writing-mode-vertical",
              )}
              title={`${LEAD_STAGE_LABELS[stage]} · ${stageLeads.length}`}
            >
              {!empty ? (
                <>
                  <p className="text-caption font-semibold text-[var(--panel-ink)]">
                    {LEAD_STAGE_LABELS[stage]}
                  </p>
                  <p className="text-caption tabular-nums text-[var(--panel-ink-muted)]">
                    {stageLeads.length} · {Math.round(potential).toLocaleString("tr-TR")} kg/ay
                  </p>
                </>
              ) : (
                <p
                  className="text-center text-caption text-[var(--panel-ink-muted)]"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                >
                  {LEAD_STAGE_LABELS[stage]}
                </p>
              )}
            </div>
            {!empty ? (
              <div className="space-y-2 p-2">
                {stageLeads.map((lead) => {
                  const days = leadStaleDays(lead.updatedAt);
                  return (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => onOpen(lead.id)}
                      className="w-full rounded-[var(--radius-sm)] border border-[var(--panel-border)] bg-white p-2.5 text-left"
                      style={{ borderLeft: `3px solid ${leadStaleBorder(days) ?? "transparent"}` }}
                    >
                      <p className="truncate font-medium" title={lead.companyName}>
                        {lead.companyName}
                      </p>
                      <p className="mt-1 truncate text-caption text-[var(--panel-ink-muted)]">
                        {lead.assigneeName ?? "Atanmadı"} · {leadStaleLabel(days)}
                      </p>
                      <p className="mt-1 truncate text-caption" title={nextAction(lead)}>
                        {nextAction(lead)}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
