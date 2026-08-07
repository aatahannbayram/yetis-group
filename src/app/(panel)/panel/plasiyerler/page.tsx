import Link from "next/link";
import { UserRound, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/admin/stat-card";
import { listSalesRepsWithAssignments } from "@/infra/db/dealers";

export default async function PlasiyerlerPage() {
  const { reps, unassignedCount } = await listSalesRepsWithAssignments();

  const totalAssigned = reps.reduce((sum, r) => sum + r.salesRepOf.length, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Plasiyerler"
        count={reps.length}
        description="Saha ekibi ataması: bayi/müşteri kaydına atanan sorumlu personel (Bayiler ekranından düzenlenir)."
      />

      <section aria-label="Özet" className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Personel" value={reps.length} href="#plasiyer-listesi" />
        <StatCard label="Atanmış bayi" value={totalAssigned} href="#plasiyer-listesi" />
        <StatCard
          label="Sorumlusuz bayi"
          value={unassignedCount}
          tone={unassignedCount > 0 ? "warning" : "neutral"}
          href="/panel/bayiler"
        />
      </section>

      <div id="plasiyer-listesi" className="space-y-3">
        {reps.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title="Personel yok"
            description="Yönetim panelinde STAFF hesabı oluşunca burada listelenir."
          />
        ) : (
          <div className="divide-y divide-[var(--border)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
            {reps.map((rep) => (
              <div key={rep.id} className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-[var(--text-primary)]">{rep.name}</p>
                  <p className="text-[length:var(--text-caption)] text-[var(--text-muted)]">{rep.email}</p>
                </div>
                <div className="min-w-0 sm:max-w-[60%] sm:text-right">
                  {rep.salesRepOf.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 sm:justify-end">
                      {rep.salesRepOf.map((d) => (
                        <span
                          key={d.id}
                          className="rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[length:var(--text-caption)] text-[var(--text-secondary)]"
                        >
                          {d.unvan}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[length:var(--text-caption)] text-[var(--text-muted)]">
                      Atanmış bayi yok
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/panel/bayiler"
        className="inline-flex items-center gap-1 text-[length:var(--text-caption)] font-medium text-[var(--primary-text)] hover:underline"
      >
        Bayi ataması yap/düzenle
        <ArrowUpRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}
