"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Trash2, Megaphone, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";
import type { Density } from "@/components/ui/density-toggle";
import {
  createCampaignAction,
  updateCampaignAction,
  toggleCampaignActiveAction,
  deleteCampaignAction,
} from "@/app/(panel)/panel/kampanyalar/actions";

export type CampaignRow = {
  id: string;
  name: string;
  note: string;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
};

const fieldClass =
  "h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none transition-shadow focus-visible:border-[var(--primary-solid)] focus-visible:ring-4 focus-visible:ring-[var(--primary-solid)]/15";

function campaignStatus(row: CampaignRow): { label: string; tone: StatusTone } {
  if (!row.active) return { label: "Pasif", tone: "neutral" };
  const now = new Date().getTime();
  if (row.startDate && new Date(row.startDate).getTime() > now) {
    return { label: "Planlandı", tone: "info" };
  }
  if (row.endDate && new Date(row.endDate).getTime() < now) {
    return { label: "Süresi doldu", tone: "neutral-strong" };
  }
  return { label: "Aktif", tone: "success" };
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function CampaignForm({ campaign, onDone }: { campaign: CampaignRow | null; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    if (campaign) formData.set("id", campaign.id);

    startTransition(async () => {
      try {
        if (campaign) {
          await updateCampaignAction(formData);
        } else {
          await createCampaignAction(formData);
        }
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kaydedilemedi.");
      }
    });
  }

  function handleDelete() {
    if (!campaign) return;
    setError(null);
    const formData = new FormData();
    formData.set("id", campaign.id);
    startTransition(async () => {
      try {
        await deleteCampaignAction(formData);
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Silinemedi.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text-muted)]">Kampanya adı</label>
        <Input
          name="name"
          required
          defaultValue={campaign?.name ?? ""}
          placeholder="Örn. Ramazan ayı özel fiyatı"
          className={fieldClass}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)]">Başlangıç</label>
          <input
            name="startDate"
            type="date"
            defaultValue={toDateInputValue(campaign?.startDate ?? null)}
            className={fieldClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)]">Bitiş</label>
          <input
            name="endDate"
            type="date"
            defaultValue={toDateInputValue(campaign?.endDate ?? null)}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text-muted)]">Not</label>
        <textarea
          name="note"
          defaultValue={campaign?.note ?? ""}
          placeholder="Kampanya kapsamı, hedef bayi grubu vb."
          rows={4}
          className={cn(fieldClass, "h-auto resize-none py-2")}
        />
      </div>

      {campaign ? (
        <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <input
            type="checkbox"
            name="activeCheckbox"
            defaultChecked={campaign.active}
            onChange={() => {
              const formData = new FormData();
              formData.set("id", campaign.id);
              formData.set("active", String(campaign.active));
              startTransition(async () => {
                await toggleCampaignActiveAction(formData);
                onDone();
              });
            }}
            className="size-4 rounded border-[var(--border)]"
          />
          Aktif
        </label>
      ) : null}

      {error ? (
        <p className="flex items-center gap-1.5 rounded-xl bg-[var(--danger-subtle)] px-3 py-2 text-xs text-[var(--danger-text)]">
          <CircleAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="flex gap-2 pt-1">
        {campaign ? (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={handleDelete}
            className="h-10 gap-1.5 text-[var(--danger-text)] hover:text-[var(--danger-text)]"
          >
            <Trash2 className="size-3.5" />
            Sil
          </Button>
        ) : null}
        <Button type="submit" disabled={isPending} className="h-10 flex-1 rounded-xl">
          {isPending ? "Kaydediliyor…" : campaign ? "Kaydet" : "Kampanya oluştur"}
        </Button>
      </div>
    </form>
  );
}

export function CampaignListSheet({ campaigns }: { campaigns: CampaignRow[] }) {
  const [mode, setMode] = useState<"closed" | "create" | "detail">("closed");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState<Density>("compact");

  const selected = campaigns.find((c) => c.id === selectedId) ?? null;

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

  const getRowId = useCallback((r: CampaignRow) => r.id, []);
  const globalFilterFn = useCallback(
    (row: CampaignRow, q: string) =>
      row.name.toLocaleLowerCase("tr-TR").includes(q) ||
      row.note.toLocaleLowerCase("tr-TR").includes(q),
    [],
  );

  const columns = useMemo<ColumnDef<CampaignRow, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Kampanya",
        minSize: 220,
        cell: ({ row }) => (
          <div className="min-w-0 max-w-[300px]">
            <p className="truncate font-medium text-[var(--text-primary)]" title={row.original.name}>
              {row.original.name}
            </p>
            {row.original.note ? (
              <p className="truncate text-[length:var(--text-caption)] text-[var(--text-muted)]">
                {row.original.note}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: "range",
        header: "Tarih aralığı",
        cell: ({ row }) => {
          const { startDate, endDate } = row.original;
          if (!startDate && !endDate) {
            return <span className="text-[var(--text-muted)]">Süresiz</span>;
          }
          return (
            <span className="text-[var(--text-secondary)]">
              {startDate ? formatDate(new Date(startDate)) : "-"}
              {" – "}
              {endDate ? formatDate(new Date(endDate)) : "-"}
            </span>
          );
        },
      },
      {
        id: "status",
        header: "Durum",
        cell: ({ row }) => {
          const s = campaignStatus(row.original);
          return <StatusBadge label={s.label} tone={s.tone} />;
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-3" data-density={density}>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Kampanya veya not ara…"
        density={density}
        onDensityChange={setDensity}
        trailing={
          <Button type="button" onClick={openCreate} className="h-8 gap-1.5">
            <Plus className="size-4" aria-hidden />
            Yeni kampanya
          </Button>
        }
      />

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Henüz kampanya yok"
          description="Ad, not ve tarih aralığı ile hafif kampanya kayıtları oluşturun."
          action={
            <Button type="button" onClick={openCreate} className="gap-1.5">
              <Plus className="size-4" aria-hidden />
              Yeni kampanya
            </Button>
          }
        />
      ) : (
        <DataTable
          data={campaigns}
          columns={columns}
          getRowId={getRowId}
          storageKey="panel-campaigns"
          search={search}
          globalFilterFn={globalFilterFn}
          onRowOpen={(row) => openDetail(row.id)}
          emptyTitle="Kampanya yok"
          emptyDescription="Yeni kampanya oluşturarak listeyi doldurun."
          filterEmptyTitle="Filtre sonucu boş"
          filterEmptyDescription="Aramayı temizleyip tekrar deneyin."
        />
      )}

      <Sheet open={mode !== "closed"} onOpenChange={(open) => !open && close()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{mode === "create" ? "Yeni Kampanya" : selected?.name}</SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Hafif kampanya kaydı; fiyat motoruna bağlı değildir."
                : "Kampanya bilgilerini düzenleyin."}
            </SheetDescription>
          </SheetHeader>
          {mode === "create" ? <CampaignForm campaign={null} onDone={close} /> : null}
          {mode === "detail" && selected ? <CampaignForm campaign={selected} onDone={close} /> : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
