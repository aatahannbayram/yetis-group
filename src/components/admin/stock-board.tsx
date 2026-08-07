"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Package,
  Plus,
  Search,
} from "lucide-react";
import type { StockBoardRow } from "@/infra/db/inventory";
import {
  addStockMovementFromStockAction,
  createLotFromStockAction,
} from "@/app/(panel)/panel/stok/actions";
import { formatDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const kgFmt = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

type Filter = "all" | "low" | "soon" | "expired" | "empty";

type PickerVariant = { id: string; slug: string; label: string };

export function StockBoard({
  rows,
  variants,
}: {
  rows: StockBoardRow[];
  variants: PickerVariant[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    return rows.filter((r) => {
      if (filter === "empty" && r.shippableKg > 0) return false;
      if (filter === "low" && !(r.shippableKg > 0 && r.shippableKg < 50)) return false;
      if (filter === "soon") {
        const hasSoon = r.lots.some(
          (l) => !l.expired && l.availableKg > 0 && l.daysToExpiry <= 14,
        );
        if (!hasSoon) return false;
      }
      if (filter === "expired") {
        if (!r.lots.some((l) => l.expired && l.availableKg > 0)) return false;
      }
      if (!q) return true;
      return (
        r.productName.toLocaleLowerCase("tr-TR").includes(q) ||
        r.sku.toLocaleLowerCase("tr-TR").includes(q) ||
        (r.packSize?.toLocaleLowerCase("tr-TR").includes(q) ?? false)
      );
    });
  }, [rows, search, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative min-w-0 flex-1 sm:max-w-md">
          <span className="sr-only">Ara</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün, SKU veya paket ara…"
            className="h-10 pl-9"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["all", "Tümü"],
              ["soon", "SKT yakın"],
              ["low", "Düşük stok"],
              ["empty", "Stoksuz"],
              ["expired", "SKT geçmiş"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "h-8 rounded-md border px-2.5 text-xs font-medium transition-colors",
                filter === id
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-400",
              )}
            >
              {label}
            </button>
          ))}
          <Button type="button" size="sm" className="h-8 gap-1" onClick={() => setShowCreate((v) => !v)}>
            <Plus className="size-3.5" />
            Yeni lot
          </Button>
        </div>
      </div>

      {showCreate ? (
        <CreateLotPanel variants={variants} onDone={() => setShowCreate(false)} />
      ) : null}

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="hidden grid-cols-[minmax(0,1.6fr)_100px_88px_88px_100px_36px] gap-2 border-b border-stone-100 px-4 py-2 text-[11px] font-medium tracking-wide text-stone-500 uppercase sm:grid dark:border-zinc-800">
          <span>Ürün / varyant</span>
          <span>SKU</span>
          <span className="text-right">Sevk kg</span>
          <span className="text-right">Lot</span>
          <span>En yakın SKT</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-stone-500">Eşleşen kayıt yok.</p>
        ) : (
          <ul className="divide-y divide-stone-100 dark:divide-zinc-800">
            {filtered.map((row) => {
              const open = openId === row.variantId;
              return (
                <li key={row.variantId}>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : row.variantId)}
                    className="grid w-full grid-cols-1 gap-2 px-4 py-3 text-left transition-colors hover:bg-stone-50 sm:grid-cols-[minmax(0,1.6fr)_100px_88px_88px_100px_36px] sm:items-center sm:gap-2 dark:hover:bg-zinc-800/50"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-zinc-800">
                        {row.imageUrl ? (
                          <Image src={row.imageUrl} alt="" fill className="object-cover" sizes="40px" />
                        ) : (
                          <Package className="m-auto size-4 text-stone-400" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-stone-900 dark:text-zinc-100">
                          {row.productName}
                        </span>
                        <span className="block truncate text-xs text-stone-500">
                          {row.packSize ?? row.packagingType}
                          {!row.productActive ? " · pasif ürün" : ""}
                        </span>
                      </span>
                    </span>
                    <span className="font-mono text-xs text-stone-600 dark:text-zinc-400">{row.sku}</span>
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums sm:text-right",
                        row.shippableKg <= 0
                          ? "text-red-700"
                          : row.shippableKg < 50
                            ? "text-amber-700"
                            : "text-stone-900 dark:text-zinc-100",
                      )}
                    >
                      {kgFmt.format(row.shippableKg)}
                    </span>
                    <span className="text-sm tabular-nums text-stone-600 sm:text-right">
                      {row.lotCount}
                    </span>
                    <span className="text-xs text-stone-600">
                      {row.nearestExpiry ? formatDate(new Date(row.nearestExpiry)) : "—"}
                    </span>
                    <span className="flex justify-end text-stone-400">
                      {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </span>
                  </button>

                  {open ? (
                    <div className="space-y-3 border-t border-stone-100 bg-stone-50/80 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-stone-500">
                          Toplam {kgFmt.format(row.totalKg)} kg · Sevk edilebilir{" "}
                          {kgFmt.format(row.shippableKg)} kg
                        </p>
                        <Link
                          href={`/panel/urunler/${row.productSlug}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B5E3A] hover:underline"
                        >
                          Ürün detayı <ExternalLink className="size-3" />
                        </Link>
                      </div>

                      {row.lots.length === 0 ? (
                        <p className="text-sm text-stone-500">Bu varyantta lot yok. Yukarıdan yeni lot ekleyin.</p>
                      ) : (
                        <ul className="space-y-2">
                          {row.lots.map((lot) => (
                            <LotRow key={lot.id} lot={lot} />
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function LotRow({
  lot,
}: {
  lot: StockBoardRow["lots"][number];
}) {
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState<"GIRIS" | "CIKIS">("GIRIS");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const tone = lot.expired
    ? "danger"
    : lot.daysToExpiry <= 14
      ? "warning"
      : "ok";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const quantityKg = Number(qty.replace(",", "."));
    if (!Number.isFinite(quantityKg) || quantityKg <= 0) {
      setError("Geçerli kg girin");
      return;
    }
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("lotId", lot.id);
        fd.set("type", type);
        fd.set("quantityKg", String(quantityKg));
        if (note.trim()) fd.set("note", note.trim());
        await addStockMovementFromStockAction(fd);
        setQty("");
        setNote("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Hareket kaydedilemedi");
      }
    });
  }

  return (
    <li className="rounded-lg border border-stone-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
            Lot {lot.lotNumber}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span>SKT {formatDate(new Date(lot.expirationDate))}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-medium",
                tone === "danger" && "border-red-200 bg-red-50 text-red-800",
                tone === "warning" && "border-amber-200 bg-amber-50 text-amber-900",
                tone === "ok" && "border-emerald-200 bg-emerald-50 text-emerald-900",
              )}
            >
              {tone !== "ok" ? <AlertTriangle className="size-3" /> : null}
              {lot.expired
                ? "Süresi geçti"
                : lot.daysToExpiry <= 14
                  ? `${lot.daysToExpiry} gün`
                  : "Uygun"}
            </span>
          </p>
        </div>
        <p
          className={cn(
            "text-sm font-semibold tabular-nums",
            lot.availableKg <= 0 ? "text-stone-400" : "text-stone-900 dark:text-zinc-100",
          )}
        >
          {kgFmt.format(lot.availableKg)} kg
        </p>
      </div>

      <form onSubmit={submit} className="mt-3 flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Hareket</Label>
          <div className="flex rounded-md border border-stone-200 p-0.5 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setType("GIRIS")}
              className={cn(
                "inline-flex h-8 items-center gap-1 rounded px-2 text-xs font-medium",
                type === "GIRIS" ? "bg-emerald-600 text-white" : "text-stone-600",
              )}
            >
              <ArrowUpCircle className="size-3.5" /> Giriş
            </button>
            <button
              type="button"
              onClick={() => setType("CIKIS")}
              disabled={lot.expired}
              className={cn(
                "inline-flex h-8 items-center gap-1 rounded px-2 text-xs font-medium disabled:opacity-40",
                type === "CIKIS" ? "bg-stone-900 text-white" : "text-stone-600",
              )}
            >
              <ArrowDownCircle className="size-3.5" /> Çıkış
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`qty-${lot.id}`} className="text-xs">
            kg
          </Label>
          <Input
            id={`qty-${lot.id}`}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="h-8 w-24"
            inputMode="decimal"
            placeholder="0"
            required
          />
        </div>
        <div className="min-w-[10rem] flex-1 space-y-1">
          <Label htmlFor={`note-${lot.id}`} className="text-xs">
            Not
          </Label>
          <Input
            id={`note-${lot.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-8"
            placeholder="Opsiyonel"
          />
        </div>
        <Button type="submit" size="sm" className="h-8" disabled={pending}>
          Kaydet
        </Button>
      </form>
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}

      {lot.movements.length > 0 ? (
        <ul className="mt-3 space-y-1 border-t border-stone-100 pt-2 dark:border-zinc-800">
          {lot.movements.slice(0, 4).map((m) => (
            <li key={m.id} className="flex justify-between gap-2 text-[11px] text-stone-500">
              <span>
                {m.type === "GIRIS" ? "Giriş" : m.type === "CIKIS" ? "Çıkış" : m.type} ·{" "}
                {kgFmt.format(m.quantityKg)} kg
                {m.note ? ` · ${m.note}` : ""}
              </span>
              <span className="shrink-0 tabular-nums">{formatDate(new Date(m.createdAt))}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function CreateLotPanel({
  variants,
  onDone,
}: {
  variants: PickerVariant[];
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createLotFromStockAction(fd);
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lot oluşturulamadı");
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="variantId">Varyant</Label>
        <select
          id="variantId"
          name="variantId"
          required
          className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          defaultValue=""
        >
          <option value="" disabled>
            Seçin…
          </option>
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="lotNumber">Lot no</Label>
        <Input id="lotNumber" name="lotNumber" required placeholder="L-2026-08-01" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="expirationDate">SKT</Label>
        <Input id="expirationDate" name="expirationDate" type="date" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="initialKg">İlk giriş (kg)</Label>
        <Input
          id="initialKg"
          name="initialKg"
          required
          inputMode="decimal"
          placeholder="17"
          step="0.001"
          min="0.001"
        />
      </div>
      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
        <Button type="submit" disabled={pending} className="gap-1.5">
          <Plus className="size-4" />
          Lot oluştur
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Vazgeç
        </Button>
        {error ? <p className="text-xs text-red-700">{error}</p> : null}
      </div>
    </form>
  );
}
