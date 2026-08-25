import { formatAttributeDisplay } from "@/lib/format/attribute-value";
import type { DealerCatalogAttributeValue } from "@/infra/db/dealer-catalog";
import { cn } from "@/lib/utils";

function numericBarPercent(value: DealerCatalogAttributeValue): number | null {
  if (value.attribute.type !== "NUMBER") return null;
  const n = Number(value.valueNumber ?? "");
  if (!Number.isFinite(n) || n < 0) return null;
  const unit = (value.attribute.unit ?? "").toLocaleLowerCase("tr-TR");
  if (unit.includes("%") || unit.includes("yüzde")) return Math.min(100, n);
  if (!unit && n <= 100) return n;
  return null;
}

export function DealerProductAttributes({
  values,
  compact = false,
}: {
  values: DealerCatalogAttributeValue[];
  compact?: boolean;
}) {
  if (values.length === 0) return null;

  const numeric = values.filter((v) => v.attribute.type === "NUMBER");
  const other = values.filter((v) => v.attribute.type !== "NUMBER");

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <p
        className={cn(
          "font-medium text-[var(--panel-ink)]",
          compact ? "text-[11px] uppercase tracking-wide text-[var(--panel-ink-muted)]" : "text-xs",
        )}
      >
        Ürün özellikleri
      </p>

      {numeric.length > 0 ? (
        <dl className={compact ? "space-y-2" : "space-y-3"}>
          {numeric.map((v) => {
            const display = formatAttributeDisplay(v);
            if (!display) return null;
            const pct = numericBarPercent(v);
            return (
              <div key={v.attribute.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-xs text-[var(--panel-ink-muted)]">{v.attribute.name}</dt>
                  <dd className="text-[13px] font-medium tabular-nums text-[var(--panel-ink)]">
                    {display}
                  </dd>
                </div>
                {pct !== null ? (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#EFEAE0]">
                    <div
                      className="h-full rounded-full bg-[var(--brand-700)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </dl>
      ) : null}

      {other.length > 0 ? (
        <dl className={cn("grid gap-2", compact ? "grid-cols-2" : "sm:grid-cols-2")}>
          {other.map((v) => {
            const display = formatAttributeDisplay(v);
            if (!display) return null;
            return (
              <div
                key={v.attribute.key}
                className={cn(
                  "rounded-lg border border-[var(--panel-border)]",
                  compact
                    ? "bg-[var(--panel-surface)] px-2.5 py-2"
                    : "bg-[var(--surface-3)] px-3 py-2",
                )}
              >
                <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--panel-ink-muted)]">
                  {v.attribute.name}
                </dt>
                <dd className="mt-0.5 text-[12px] font-medium leading-snug text-[var(--panel-ink)]">
                  {display}
                </dd>
              </div>
            );
          })}
        </dl>
      ) : null}
    </div>
  );
}
