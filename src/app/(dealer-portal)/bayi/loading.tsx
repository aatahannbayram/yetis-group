import { Skeleton } from "@/components/ui/skeleton";

/** Instant shell while bayi layout/page data resolves. */
export default function BayiLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-5 px-3 py-6 sm:px-5 sm:py-8" aria-busy="true" aria-label="Yükleniyor">
      <Skeleton className="h-[11.5rem] w-full rounded-[1.35rem] sm:h-[13rem]" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <Skeleton className="h-40 w-full rounded-[1.35rem]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
    </div>
  );
}
