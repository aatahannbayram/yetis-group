"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Undo2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CreditLimitBar } from "@/components/admin/credit-limit-bar";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { cn } from "@/lib/utils";
import { addLedgerEntryAction, reverseLedgerEntryAction } from "@/app/(panel)/panel/cari/actions";
import type { Density } from "@/components/ui/density-toggle";
import {
  AGING_BUCKET_LABEL,
  dealerAging,
  type AgingBucket,
} from "@/domain/ledger/aging";

const DEALER_TYPE_LABEL: Record<string, string> = {
  BAYI: "Bayi",
  HORECA: "HORECA",
  ZINCIR: "Müşteri (zincir)",
  ARA_TOPTANCI: "Ara toptancı",
};

export type LedgerEntryRow = {
  id: string;
  type: "BORC" | "ODEME";
  amountKurus: number;
  description: string;
  createdAt: string;
  reversesId: string | null;
};

export type DealerBalanceRow = {
  id: string;
  unvan: string;
  dealerType: string;
  creditLimitKurus: number | null;
  paymentTermDays: number | null;
  entryCount: number;
  balanceKurus: number;
  entries: LedgerEntryRow[];
};

function balanceLabel(balanceKurus: number): string {
  if (balanceKurus > 0) return "Borç";
  if (balanceKurus < 0) return "Alacaklı";
  return "Sıfır";
}

const AGING_TONE: Record<AgingBucket, "success" | "warning" | "danger"> = {
  ok: "success",
  warn: "warning",
  danger: "danger",
};

function rowAging(row: DealerBalanceRow) {
  return dealerAging({
    entries: row.entries,
    paymentTermDays: row.paymentTermDays,
    balanceKurus: row.balanceKurus,
  });
}

const fieldClass =
  "h-10 rounded-lg border-stone-200 bg-white text-stone-900 focus-visible:border-[#1B5E3A] focus-visible:ring-[#1B5E3A]/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100";

export function DealerLedgerBoard({ dealers }: { dealers: DealerBalanceRow[] }) {
  const [openDealerId, setOpenDealerId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState<Density>("compact");
  const [viewFilter, setViewFilter] = useState("all");

  const openDealer = dealers.find((d) => d.id === openDealerId) ?? null;
  const entries = openDealer?.entries ?? null;

  function close() {
    setOpenDealerId(null);
  }

  const filtered = useMemo(() => {
    if (viewFilter === "debt") return dealers.filter((d) => d.balanceKurus > 0);
    if (viewFilter === "over") {
      return dealers.filter(
        (d) => d.creditLimitKurus != null && d.balanceKurus > d.creditLimitKurus,
      );
    }
    if (viewFilter === "zero") return dealers.filter((d) => d.balanceKurus === 0);
    if (viewFilter === "d45") {
      return dealers.filter((d) => {
        const a = rowAging(d);
        return a.kind === "open" && a.bucket === "warn";
      });
    }
    if (viewFilter === "d46") {
      return dealers.filter((d) => {
        const a = rowAging(d);
        return a.kind === "open" && a.bucket === "danger";
      });
    }
    return dealers;
  }, [dealers, viewFilter]);

  const getRowId = useCallback((r: DealerBalanceRow) => r.id, []);
  const globalFilterFn = useCallback(
    (row: DealerBalanceRow, q: string) =>
      row.unvan.toLocaleLowerCase("tr-TR").includes(q) ||
      (DEALER_TYPE_LABEL[row.dealerType] ?? row.dealerType)
        .toLocaleLowerCase("tr-TR")
        .includes(q),
    [],
  );

  const columns = useMemo<ColumnDef<DealerBalanceRow, unknown>[]>(
    () => [
      {
        accessorKey: "unvan",
        header: "Hesap",
        minSize: 200,
        cell: ({ row }) => {
          const overLimit =
            row.original.creditLimitKurus != null &&
            row.original.balanceKurus > row.original.creditLimitKurus;
          return (
            <div className="min-w-0 max-w-[260px]">
              <p
                className="truncate font-medium text-stone-900 dark:text-zinc-50"
                title={row.original.unvan}
              >
                {row.original.unvan}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-zinc-400">
                <span>{DEALER_TYPE_LABEL[row.original.dealerType] ?? row.original.dealerType}</span>
                {overLimit ? (
                  <StatusBadge label="Limit aşımı" tone="danger" />
                ) : null}
              </p>
            </div>
          );
        },
      },
      {
        id: "balance",
        header: "Bakiye",
        accessorFn: (r) => r.balanceKurus,
        cell: ({ row }) => {
          const overLimit =
            row.original.creditLimitKurus != null &&
            row.original.balanceKurus > row.original.creditLimitKurus;
          return (
            <div>
              <p
                className={cn(
                  "font-semibold tabular-nums",
                  overLimit
                    ? "text-red-600 dark:text-red-400"
                    : row.original.balanceKurus > 0
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-stone-900 dark:text-zinc-50",
                )}
              >
                {formatMoney(money(Math.abs(row.original.balanceKurus)))}
              </p>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                {balanceLabel(row.original.balanceKurus)}
              </p>
            </div>
          );
        },
      },
      {
        id: "limit",
        header: "Kredi limiti",
        enableSorting: false,
        minSize: 160,
        cell: ({ row }) => (
          <div className="min-w-[140px] max-w-[200px]">
            <CreditLimitBar
              balanceKurus={row.original.balanceKurus}
              limitKurus={row.original.creditLimitKurus}
            />
          </div>
        ),
      },
      {
        id: "term",
        header: "Vade",
        cell: ({ row }) => {
          const aging = rowAging(row.original);
          const term =
            row.original.paymentTermDays != null
              ? `${row.original.paymentTermDays} gün`
              : "Vade yok";
          if (aging.kind === "clear") {
            return <span className="tabular-nums text-stone-600 dark:text-zinc-400">{term}</span>;
          }
          return (
            <div className="space-y-1">
              <StatusBadge
                tone={AGING_TONE[aging.bucket]}
                label={`${AGING_BUCKET_LABEL[aging.bucket]} · ${aging.daysOverdue}g`}
              />
              <p className="text-[11px] tabular-nums text-stone-500 dark:text-zinc-400">{term}</p>
            </div>
          );
        },
      },
      {
        id: "entries",
        header: "Kayıt",
        accessorFn: (r) => r.entryCount,
        cell: ({ row }) => (
          <span className="tabular-nums text-stone-600 dark:text-zinc-400">
            {row.original.entryCount}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" data-density={density}>
      <div className="border-b border-stone-200 px-3 py-2 dark:border-zinc-800">
        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Hesap veya tip ara…"
          views={[
            { id: "all", label: "Tümü" },
            { id: "debt", label: "Borçlu" },
            { id: "over", label: "Limit aşımı" },
            { id: "zero", label: "Sıfır" },
            { id: "d45", label: "31-45 gün" },
            { id: "d46", label: "46+ gün" },
          ]}
          activeViewId={viewFilter}
          onViewSelect={setViewFilter}
          density={density}
          onDensityChange={setDensity}
        />
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        getRowId={getRowId}
        storageKey="panel-cari"
        search={search}
        globalFilterFn={globalFilterFn}
        onRowOpen={(row) => setOpenDealerId(row.id)}
        emptyTitle="Hesap yok"
        emptyDescription="Cari hesaplar bayi/müşteri kaydı oluşunca burada görünür."
        filterEmptyTitle="Filtre sonucu boş"
        filterEmptyDescription="Görünümü veya aramayı temizleyip tekrar deneyin."
      />

      <Sheet open={openDealer !== null} onOpenChange={(open) => !open && close()}>
        <SheetContent className="w-full gap-0 border-stone-200 bg-white p-0 sm:max-w-lg dark:border-zinc-800 dark:bg-zinc-950">
          {openDealer ? (
            <>
              <SheetHeader className="space-y-1 border-b border-stone-200 px-5 py-4 text-left dark:border-zinc-800">
                <SheetTitle className="pr-8 text-lg font-semibold tracking-tight text-stone-900 dark:text-zinc-50">
                  {openDealer.unvan}
                </SheetTitle>
                <SheetDescription className="text-sm text-stone-500 dark:text-zinc-400">
                  Hareketler append-only; düzeltme ters kayıtla yapılır.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 space-y-5 overflow-y-auto bg-stone-50/50 px-5 py-5 dark:bg-zinc-950">
                <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-xs font-medium text-stone-500">Güncel bakiye</p>
                  <p
                    className={cn(
                      "mt-1 text-2xl font-semibold tabular-nums tracking-tight",
                      openDealer.balanceKurus > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-stone-900 dark:text-zinc-50",
                    )}
                  >
                    {formatMoney(money(Math.abs(openDealer.balanceKurus)))}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {balanceLabel(openDealer.balanceKurus)}
                    {" · "}
                    {DEALER_TYPE_LABEL[openDealer.dealerType] ?? openDealer.dealerType}
                  </p>
                  {(() => {
                    const aging = rowAging(openDealer);
                    if (aging.kind !== "open") return null;
                    return (
                      <div className="mt-2">
                        <StatusBadge
                          tone={AGING_TONE[aging.bucket]}
                          label={`Gecikme ${aging.daysOverdue} gün · ${AGING_BUCKET_LABEL[aging.bucket]}`}
                        />
                      </div>
                    );
                  })()}
                  <div className="mt-4">
                    <CreditLimitBar
                      balanceKurus={openDealer.balanceKurus}
                      limitKurus={openDealer.creditLimitKurus}
                    />
                  </div>
                </div>

                <form
                  action={async (formData) => {
                    await addLedgerEntryAction(formData);
                    close();
                  }}
                  className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <input type="hidden" name="dealerId" value={openDealer.id} />
                  <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-stone-500 uppercase">
                    <Plus className="size-3.5" aria-hidden />
                    Yeni kayıt
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      name="type"
                      defaultValue="BORC"
                      className={cn(fieldClass, "w-full px-3 text-sm outline-none")}
                    >
                      <option value="BORC">Borç (fatura/sevkiyat)</option>
                      <option value="ODEME">Ödeme (tahsilat)</option>
                    </select>
                    <Input
                      name="amountTl"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="₺ tutar"
                      required
                      className={cn(fieldClass, "tabular-nums")}
                    />
                  </div>
                  <Input
                    name="description"
                    placeholder="Açıklama"
                    required
                    className={fieldClass}
                  />
                  <Button type="submit" size="sm" className="h-10 w-full">
                    Kaydet
                  </Button>
                </form>

                <div>
                  <p className="mb-2.5 text-xs font-medium tracking-wide text-stone-500 uppercase">
                    Hareketler
                  </p>
                  <div className="space-y-2">
                    {(entries ?? []).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start justify-between gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-stone-900 dark:text-zinc-50">
                            {entry.description}
                          </p>
                          <p className="text-xs text-stone-500">
                            {new Date(entry.createdAt).toLocaleString("tr-TR")}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={cn(
                              "text-sm font-semibold tabular-nums",
                              entry.type === "BORC"
                                ? "text-red-600 dark:text-red-400"
                                : "text-[#1B5E3A] dark:text-emerald-400",
                            )}
                          >
                            {entry.type === "BORC" ? "+" : "−"}
                            {formatMoney(money(entry.amountKurus))}
                          </span>
                          {!entry.reversesId ? (
                            <form
                              action={async (formData) => {
                                await reverseLedgerEntryAction(formData);
                                close();
                              }}
                            >
                              <input type="hidden" name="entryId" value={entry.id} />
                              <Button
                                type="submit"
                                size="icon-sm"
                                variant="ghost"
                                title="Ters kayıt oluştur"
                                className="text-stone-400 hover:text-stone-700"
                              >
                                <Undo2 className="size-3.5" />
                              </Button>
                            </form>
                          ) : null}
                        </div>
                      </div>
                    ))}
                    {entries && entries.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-10 text-center text-stone-400">
                        <Wallet className="size-6" aria-hidden />
                        <p className="text-xs">Henüz cari hareketi yok.</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
