"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Plus, Trash2, Boxes, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { Density } from "@/components/ui/density-toggle";
import {
  createProducerAction,
  updateProducerAction,
  deleteProducerAction,
} from "@/app/(panel)/panel/ureticiler/actions";

export type ProducerRow = {
  id: string;
  name: string;
  region: string | null;
  productionMethod: string | null;
  geoIndication: string | null;
  imageUrl: string | null;
  story: string;
  productCount: number;
};

const fieldClass =
  "h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none transition-shadow focus-visible:border-[var(--primary-solid)] focus-visible:ring-4 focus-visible:ring-[var(--primary-solid)]/15";

function ProducerForm({
  producer,
  onDone,
}: {
  producer: ProducerRow | null;
  onDone: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    if (producer) formData.set("id", producer.id);

    startTransition(async () => {
      try {
        if (producer) {
          await updateProducerAction(formData);
        } else {
          await createProducerAction(formData);
        }
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kaydedilemedi.");
      }
    });
  }

  function handleDelete() {
    if (!producer) return;
    setError(null);
    const formData = new FormData();
    formData.set("id", producer.id);
    startTransition(async () => {
      try {
        await deleteProducerAction(formData);
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Silinemedi.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text-muted)]">Üretici adı</label>
        <Input
          name="name"
          required
          defaultValue={producer?.name ?? ""}
          placeholder="Örn. Kars Kaşar Üreticileri Kooperatifi"
          className={fieldClass}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)]">Bölge</label>
          <Input name="region" defaultValue={producer?.region ?? ""} placeholder="Kars" className={fieldClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)]">Üretim yöntemi</label>
          <Input
            name="productionMethod"
            defaultValue={producer?.productionMethod ?? ""}
            placeholder="Geleneksel"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text-muted)]">Coğrafi işaret (opsiyonel)</label>
        <Input
          name="geoIndication"
          defaultValue={producer?.geoIndication ?? ""}
          placeholder="Örn. Kars Kaşarı Mahreç İşareti"
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text-muted)]">Görsel URL (opsiyonel)</label>
        <Input
          name="imageUrl"
          defaultValue={producer?.imageUrl ?? ""}
          placeholder="https://…"
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text-muted)]">Hikâye</label>
        <textarea
          name="story"
          defaultValue={producer?.story ?? ""}
          placeholder="Üreticinin kamuya açık hikâyesi…"
          rows={5}
          className={cn(fieldClass, "h-auto resize-none py-2")}
        />
      </div>

      {producer && producer.productCount > 0 ? (
        <p className="text-xs text-[var(--text-muted)]">
          {producer.productCount} ürüne bağlı ·{" "}
          <Link href="/panel/urunler" className="font-medium text-[var(--primary-text)] hover:underline">
            ürünleri gör
          </Link>
        </p>
      ) : null}

      {error ? (
        <p className="flex items-center gap-1.5 rounded-xl bg-[var(--danger-subtle)] px-3 py-2 text-xs text-[var(--danger-text)]">
          <CircleAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="flex gap-2 pt-1">
        {producer ? (
          <Button
            type="button"
            variant="outline"
            disabled={isPending || producer.productCount > 0}
            onClick={handleDelete}
            title={producer.productCount > 0 ? "Önce bağlı ürünleri taşıyın" : undefined}
            className="h-10 gap-1.5 text-[var(--danger-text)] hover:text-[var(--danger-text)]"
          >
            <Trash2 className="size-3.5" />
            Sil
          </Button>
        ) : null}
        <Button type="submit" disabled={isPending} className="h-10 flex-1 rounded-xl">
          {isPending ? "Kaydediliyor…" : producer ? "Kaydet" : "Üretici oluştur"}
        </Button>
      </div>
    </form>
  );
}

export function ProducerListSheet({ producers }: { producers: ProducerRow[] }) {
  const [mode, setMode] = useState<"closed" | "create" | "detail">("closed");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState<Density>("compact");

  const selected = producers.find((p) => p.id === selectedId) ?? null;

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

  const getRowId = useCallback((r: ProducerRow) => r.id, []);
  const globalFilterFn = useCallback(
    (row: ProducerRow, q: string) =>
      row.name.toLocaleLowerCase("tr-TR").includes(q) ||
      (row.region ?? "").toLocaleLowerCase("tr-TR").includes(q),
    [],
  );

  const columns = useMemo<ColumnDef<ProducerRow, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Üretici",
        minSize: 220,
        cell: ({ row }) => (
          <div className="min-w-0 max-w-[280px]">
            <p className="truncate font-medium text-[var(--text-primary)]" title={row.original.name}>
              {row.original.name}
            </p>
            {row.original.geoIndication ? (
              <p className="truncate text-[length:var(--text-caption)] text-[var(--text-muted)]">
                {row.original.geoIndication}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "region",
        header: "Bölge",
        cell: ({ row }) => (
          <span className="text-[var(--text-secondary)]">{row.original.region ?? "-"}</span>
        ),
      },
      {
        accessorKey: "productionMethod",
        header: "Üretim yöntemi",
        cell: ({ row }) => (
          <span className="text-[var(--text-secondary)]">{row.original.productionMethod ?? "-"}</span>
        ),
      },
      {
        id: "productCount",
        header: "Ürün",
        accessorFn: (r) => r.productCount,
        cell: ({ row }) => (
          <span className="tabular-nums text-[var(--text-secondary)]">{row.original.productCount}</span>
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
        searchPlaceholder="Üretici veya bölge ara…"
        density={density}
        onDensityChange={setDensity}
        trailing={
          <Button type="button" onClick={openCreate} className="h-8 gap-1.5">
            <Plus className="size-4" aria-hidden />
            Yeni üretici
          </Button>
        }
      />

      {producers.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="Henüz üretici yok"
          description="Kamuya açık üretici hikâyelerini burada oluşturun."
          action={
            <Button type="button" onClick={openCreate} className="gap-1.5">
              <Plus className="size-4" aria-hidden />
              Yeni üretici
            </Button>
          }
        />
      ) : (
        <DataTable
          data={producers}
          columns={columns}
          getRowId={getRowId}
          storageKey="panel-producers"
          search={search}
          globalFilterFn={globalFilterFn}
          onRowOpen={(row) => openDetail(row.id)}
          emptyTitle="Üretici yok"
          emptyDescription="Yeni üretici oluşturarak listeyi doldurun."
          filterEmptyTitle="Filtre sonucu boş"
          filterEmptyDescription="Aramayı temizleyip tekrar deneyin."
        />
      )}

      <Sheet open={mode !== "closed"} onOpenChange={(open) => !open && close()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{mode === "create" ? "Yeni Üretici" : selected?.name}</SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Kamuya açık üretici hikâyesi ürün detayında gösterilir."
                : "Üretici bilgilerini düzenleyin."}
            </SheetDescription>
          </SheetHeader>
          {mode === "create" ? <ProducerForm producer={null} onDone={close} /> : null}
          {mode === "detail" && selected ? <ProducerForm producer={selected} onDone={close} /> : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
