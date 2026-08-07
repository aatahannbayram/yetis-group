import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { requireDealerPortal } from "@/features/dealer/portal-context";
import { listProformasForDealer } from "@/infra/db/proforma";
import { formatMoney } from "@/lib/format/money";
import { formatDate } from "@/lib/format/date";
import { money } from "@/domain/money";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  ISSUED: "Düzenlendi",
  VOID: "İptal",
  DRAFT: "Taslak",
};

export default async function BayiBelgelerPage() {
  const { dealerId } = await requireDealerPortal();
  const docs = await listProformasForDealer(dealerId);

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      <header className="border-b border-[var(--panel-border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--panel-ink)]">Belgelerim</h1>
        <p className="mt-1 text-sm text-[var(--panel-ink-muted)]">
          Proforma faturalar (e-Fatura sonraki faz)
        </p>
      </header>

      {docs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--panel-border)] bg-white px-6 py-14 text-center">
          <FileText className="mx-auto size-8 text-[var(--panel-ink-muted)]" aria-hidden />
          <p className="mt-3 font-medium text-[var(--panel-ink)]">Belge yok</p>
          <p className="mt-1 text-sm text-[var(--panel-ink-muted)]">
            Sipariş onaylandığında proforma burada listelenir.
          </p>
          <Link
            href="/bayi/siparis"
            className="mt-5 inline-flex h-10 items-center rounded-lg bg-[var(--panel-ink)] px-4 text-sm font-semibold text-white"
          >
            Sipariş ver
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--panel-border)] overflow-hidden rounded-xl border border-[var(--panel-border)] bg-white">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-[var(--panel-ink)]">{doc.number}</p>
                  <span
                    className={cn(
                      "rounded border px-2 py-0.5 text-[11px] font-medium",
                      doc.status === "ISSUED"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-stone-200 bg-stone-50 text-stone-600",
                    )}
                  >
                    {STATUS_LABEL[doc.status] ?? doc.status}
                  </span>
                  <span className="text-[11px] text-[var(--panel-ink-muted)]">v{doc.version}</span>
                </div>
                <p className="mt-1 text-xs text-[var(--panel-ink-muted)]">
                  {formatDate(doc.issuedAt)} · Sipariş #{doc.order.id.slice(-6)} ·{" "}
                  {doc.lines.length} kalem
                </p>
                <p className="mt-0.5 truncate text-sm text-[var(--panel-ink-muted)]">
                  {doc.lines.map((l) => l.description).join(" · ")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <p className="text-sm font-semibold tabular-nums text-[var(--panel-ink)]">
                  {formatMoney(money(doc.totalKurus))}
                </p>
                {doc.status === "ISSUED" ? (
                  <a
                    href={`/api/proforma/${doc.id}/pdf`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--panel-border)] bg-white px-3 text-xs font-semibold text-[var(--panel-ink)] hover:bg-[var(--surface-3)]"
                  >
                    <Download className="size-3.5" aria-hidden />
                    PDF
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
