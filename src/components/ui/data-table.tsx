"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type OnChangeFn,
  type PaginationState,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Module-level stable — never recreate in render (avoids update-depth loops). */
const DEFAULT_PAGE_SIZES: number[] = [25, 50, 100];
const EMPTY_ROW_SELECTION: RowSelectionState = {};
const EMPTY_VISIBILITY: VisibilityState = {};

type StoredPrefs = {
  visibility: VisibilityState;
  pageSize: number;
};

function readStoredPrefs(
  storageKey: string | undefined,
  fallbackPageSize: number,
  sizeOptions: number[],
): StoredPrefs {
  const fallback: StoredPrefs = { visibility: {}, pageSize: fallbackPageSize };
  if (!storageKey || typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`dt:${storageKey}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as {
      visibility?: VisibilityState;
      pageSize?: number;
    };
    return {
      visibility:
        parsed.visibility && typeof parsed.visibility === "object"
          ? parsed.visibility
          : {},
      pageSize:
        typeof parsed.pageSize === "number" && sizeOptions.includes(parsed.pageSize)
          ? parsed.pageSize
          : fallbackPageSize,
    };
  } catch {
    return fallback;
  }
}

function exportCsv<T>(
  rows: T[],
  columns: { id: string; header: string; accessor: (row: T) => string }[],
) {
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const header = columns.map((c) => escape(c.header)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escape(c.accessor(row))).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${header}\n${body}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "export.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const SELECT_COLUMN: ColumnDef<unknown, unknown> = {
  id: "_select",
  header: ({ table }) => (
    <input
      type="checkbox"
      aria-label="Tümünü seç"
      checked={table.getIsAllPageRowsSelected()}
      onChange={table.getToggleAllPageRowsSelectedHandler()}
      className="size-3.5 accent-[var(--primary-solid)]"
    />
  ),
  cell: ({ row }) => (
    <input
      type="checkbox"
      aria-label="Satır seç"
      checked={row.getIsSelected()}
      onChange={row.getToggleSelectedHandler()}
      onClick={(e) => e.stopPropagation()}
      className="size-3.5 accent-[var(--primary-solid)]"
    />
  ),
  size: 40,
  enableSorting: false,
};

export type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  getRowId: (row: T) => string;
  storageKey?: string;
  search?: string;
  globalFilterFn?: (row: T, query: string) => boolean;
  onRowOpen?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  filterEmptyTitle?: string;
  filterEmptyDescription?: string;
  className?: string;
  enableSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  staleLeftBorder?: (row: T) => string | null;
  exportColumns?: { id: string; header: string; accessor: (row: T) => string }[];
  onExportReady?: (exportFn: () => void) => void;
  pageSizeOptions?: number[];
  initialPageSize?: number;
};

export function DataTable<T>({
  data,
  columns,
  getRowId,
  storageKey,
  search = "",
  globalFilterFn,
  onRowOpen,
  emptyTitle = "Kayıt yok",
  emptyDescription = "Filtreleri temizleyin veya yeni kayıt ekleyin.",
  emptyAction,
  filterEmptyTitle = "Filtre sonucu boş",
  filterEmptyDescription = "Arama veya filtreleri temizleyip tekrar deneyin.",
  className,
  enableSelection,
  rowSelection,
  onRowSelectionChange,
  sorting: controlledSorting,
  onSortingChange,
  staleLeftBorder,
  exportColumns,
  onExportReady,
  pageSizeOptions,
  initialPageSize = 25,
}: DataTableProps<T>) {
  const sizeOptions = pageSizeOptions ?? DEFAULT_PAGE_SIZES;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    const v = readStoredPrefs(storageKey, initialPageSize, sizeOptions).visibility;
    return Object.keys(v).length === 0 ? EMPTY_VISIBILITY : v;
  });
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pageIndex: 0,
    pageSize: readStoredPrefs(storageKey, initialPageSize, sizeOptions).pageSize,
  }));

  // One-shot client hydrate (SSR initializer cannot read localStorage).
  const hasHydrated = useRef(false);
  useEffect(() => {
    if (!storageKey || hasHydrated.current) return;
    hasHydrated.current = true;
    const prefs = readStoredPrefs(storageKey, initialPageSize, sizeOptions);
    setColumnVisibility((cur) =>
      JSON.stringify(cur) === JSON.stringify(prefs.visibility) ? cur : prefs.visibility,
    );
    setPagination((p) =>
      p.pageSize === prefs.pageSize ? p : { ...p, pageSize: prefs.pageSize },
    );
    // sizeOptions / initialPageSize read once at hydrate — not deps (unstable arrays loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Persist after hydrate; skip the render that applied stored prefs.
  const persistSkip = useRef(true);
  useEffect(() => {
    if (!storageKey || !hasHydrated.current) return;
    if (persistSkip.current) {
      persistSkip.current = false;
      return;
    }
    localStorage.setItem(
      `dt:${storageKey}`,
      JSON.stringify({ visibility: columnVisibility, pageSize: pagination.pageSize }),
    );
  }, [storageKey, columnVisibility, pagination.pageSize]);

  const dataLen = data.length;
  useEffect(() => {
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }, [search, dataLen]);

  // Avoid re-filter every parent render when globalFilterFn is inline.
  const filterFnRef = useRef(globalFilterFn);
  filterFnRef.current = globalFilterFn;

  const filteredData = useMemo(() => {
    const fn = filterFnRef.current;
    const q = search.trim().toLowerCase();
    if (!q || !fn) return data;
    return data.filter((row) => fn(row, q));
  }, [data, search]);

  const tableColumns = useMemo<ColumnDef<T, unknown>[]>(() => {
    if (!enableSelection) return columns;
    return [SELECT_COLUMN as ColumnDef<T, unknown>, ...columns];
  }, [columns, enableSelection]);

  const getRowIdRef = useRef(getRowId);
  getRowIdRef.current = getRowId;
  const getRowIdStable = useCallback((row: T) => getRowIdRef.current(row), []);

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    state: {
      sorting: controlledSorting ?? sorting,
      columnVisibility,
      rowSelection: rowSelection ?? EMPTY_ROW_SELECTION,
      pagination,
    },
    onSortingChange: onSortingChange ?? setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: getRowIdStable,
    enableRowSelection: enableSelection,
  });

  const rows = table.getRowModel().rows;
  const pageCount = table.getPageCount();

  const doExport = useCallback(() => {
    if (!exportColumns) return;
    exportCsv(filteredData, exportColumns);
  }, [exportColumns, filteredData]);

  const onExportReadyRef = useRef(onExportReady);
  onExportReadyRef.current = onExportReady;
  useEffect(() => {
    onExportReadyRef.current?.(doExport);
  }, [doExport]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (rows.length === 0) return;

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, rows.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const row = rows[focusedIndex];
        if (row && onRowOpen) {
          e.preventDefault();
          onRowOpen(row.original);
        }
      } else if (e.key === " " && enableSelection) {
        const row = rows[focusedIndex];
        if (row) {
          e.preventDefault();
          const next = { ...(rowSelection ?? {}) };
          if (e.shiftKey && lastSelectedIndex != null) {
            const from = Math.min(lastSelectedIndex, focusedIndex);
            const to = Math.max(lastSelectedIndex, focusedIndex);
            for (let i = from; i <= to; i++) next[rows[i]!.id] = true;
          } else {
            next[row.id] = !row.getIsSelected();
            setLastSelectedIndex(focusedIndex);
          }
          onRowSelectionChange?.(next);
        }
      } else if (e.key === "Escape") {
        onRowSelectionChange?.({});
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [
    rows,
    focusedIndex,
    onRowOpen,
    enableSelection,
    rowSelection,
    onRowSelectionChange,
    lastSelectedIndex,
  ]);

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  if (filteredData.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title={filterEmptyTitle}
        description={filterEmptyDescription}
        action={emptyAction}
      />
    );
  }

  const headerGroups = table.getHeaderGroups();
  const from = pagination.pageIndex * pagination.pageSize + 1;
  const to = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    filteredData.length,
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {filteredData.length} kayıt, {from}–{to} gösteriliyor
      </div>
      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
        <div className="relative max-h-[min(70vh,720px)] overflow-auto">
          <table className="w-full min-w-[720px] border-collapse text-[length:var(--panel-font-size)]">
            <thead className="sticky top-0 z-10 bg-[var(--surface-2)]">
              {headerGroups.map((hg) => (
                <tr key={hg.id} className="border-b border-[var(--border)]">
                  {hg.headers.map((header, hi) => {
                    const isFirst = hi === 0;
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={
                          sorted === "asc"
                            ? "ascending"
                            : sorted === "desc"
                              ? "descending"
                              : "none"
                        }
                        className={cn(
                          "h-10 px-3 text-left align-middle text-[length:var(--text-caption)] font-semibold tracking-[0.04em] whitespace-nowrap text-[var(--text-muted)] uppercase",
                          header.column.getCanSort() && "cursor-pointer select-none",
                          isFirst &&
                            "sticky left-0 z-[1] bg-[var(--surface-2)] shadow-[2px_0_4px_-2px_rgb(33_28_22/0.12)]",
                        )}
                        style={{
                          width: header.getSize() !== 150 ? header.getSize() : undefined,
                          minWidth: header.column.columnDef.minSize,
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted === "asc" ? " ↑" : sorted === "desc" ? " ↓" : null}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const border = staleLeftBorder?.(row.original);
                const focused = index === focusedIndex;
                const cells = row.getVisibleCells();
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "h-[var(--row-height)] border-b border-[var(--border)] transition-colors duration-[var(--motion-hover)] hover:bg-[var(--surface-2)]",
                      focused && "bg-[var(--primary-subtle)]/60",
                      row.getIsSelected() && "bg-[var(--primary-subtle)]/40",
                    )}
                    style={{ borderLeft: border ? `3px solid ${border}` : undefined }}
                    onClick={() => {
                      setFocusedIndex(index);
                      onRowOpen?.(row.original);
                    }}
                  >
                    {cells.map((cell, ci) => {
                      const isFirst = ci === 0;
                      return (
                        <td
                          key={cell.id}
                          className={cn(
                            "px-3 align-middle text-[var(--text-secondary)]",
                            isFirst &&
                              "sticky left-0 z-[1] bg-[var(--surface)] shadow-[2px_0_4px_-2px_rgb(33_28_22/0.08)]",
                            focused && isFirst && "bg-[var(--primary-subtle)]/60",
                          )}
                          style={{
                            width:
                              cell.column.getSize() !== 150 ? cell.column.getSize() : undefined,
                            minWidth: cell.column.columnDef.minSize,
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-1">
        <p className="text-[length:var(--text-caption)] tabular-nums text-[var(--text-muted)]">
          {from}–{to} / {filteredData.length}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-[length:var(--text-caption)] text-[var(--text-muted)]">
            Sayfa
            <select
              className="h-8 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-2 text-[var(--text-primary)]"
              value={pagination.pageSize}
              onChange={(e) =>
                setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })
              }
              aria-label="Sayfa boyutu"
            >
              {sizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Önceki
          </Button>
          <span className="tabular-nums text-[length:var(--text-caption)] text-[var(--text-muted)]">
            {pagination.pageIndex + 1} / {Math.max(pageCount, 1)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Sonraki
          </Button>
        </div>
      </div>
    </div>
  );
}
