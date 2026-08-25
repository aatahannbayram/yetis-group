"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { YgButton } from "@/components/yg-ops/shared/button";
import { cn } from "@/lib/utils";

export function DataTable<T>({
  data,
  columns,
  pageSize = 25,
  className,
  emptyMessage = "Kayıt yok.",
}: {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const rows = table.getRowModel().rows;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="overflow-x-auto rounded-[var(--yg-radius-lg)] bg-[var(--yg-panel-2)]">
        <table className="w-full min-w-[480px] border-collapse text-left">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-[var(--yg-row-h)] px-4 text-[length:var(--yg-text-12)] font-medium tracking-[0.02em] text-[var(--yg-text-muted)] uppercase"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-[var(--yg-row-h)] px-4 text-[length:var(--yg-text-14)] text-[var(--yg-text-muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[color:var(--yg-border)] hover:bg-[color-mix(in_srgb,var(--yg-panel)_80%,transparent)]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="h-[var(--yg-row-h)] px-4 text-[length:var(--yg-text-14)] text-[var(--yg-text-secondary)]"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {table.getPageCount() > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <YgButton
            variant="ghost"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Önceki
          </YgButton>
          <span className="text-[length:var(--yg-text-13)] tabular-nums text-[var(--yg-text-muted)]">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <YgButton
            variant="ghost"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Sonraki
          </YgButton>
        </div>
      ) : null}
    </div>
  );
}
