import { Skeleton } from "@/components/ui/skeleton";

export default function BayiCatalogLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Katalog yükleniyor">
      <header className="border-b border-[var(--panel-border)] pb-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl" />
      </header>
      <Skeleton className="h-11 w-full rounded-lg" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
