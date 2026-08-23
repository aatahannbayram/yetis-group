import { Skeleton } from "@/components/ui/skeleton";

/** Storefront route fallback while the page shell streams in. */
export default function StoreLoading() {
  return (
    <div className="min-h-[70vh]" aria-busy="true" aria-label="Yükleniyor">
      <div className="relative h-[70vh] min-h-[28rem] w-full overflow-hidden bg-[var(--surface-3)]">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
