import { Skeleton } from "@/components/ui/skeleton";

/** Catalog route skeleton while product list streams in. */
export default function ProductsLoading() {
  return (
    <div className="min-h-[70vh]" aria-busy="true" aria-label="Ürün kataloğu yükleniyor">
      <div className="relative h-[36vh] min-h-[16rem] w-full overflow-hidden bg-[var(--surface-3)] md:min-h-[20rem]">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>
        <Skeleton className="mt-6 h-11 max-w-sm rounded-full" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-[1.25rem] border border-[color:var(--mkt-border)]">
              <Skeleton className="aspect-[4/5] w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
