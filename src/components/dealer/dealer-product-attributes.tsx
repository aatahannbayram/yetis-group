import { formatAttributeDisplay } from "@/lib/format/attribute-value";
import type { DealerCatalogAttributeValue } from "@/infra/db/dealer-catalog";

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
}: {
  values: DealerCatalogAttributeValue[];
}) {
  if (values.length === 0) return null;

  const numeric = values.filter((v) => v.attribute.type === "NUMBER");
  const other = values.filter((v) => v.attribute.type !== "NUMBER");

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-[var(--panel-ink)]">Ürün özellikleri</p>

      {numeric.length > 0 ? (
        <dl className="space-y-3">
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
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#EFEAE0]">
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
        <dl className="grid gap-2 sm:grid-cols-2">
          {other.map((v) => {
            const display = formatAttributeDisplay(v);
            if (!display) return null;
            return (
              <div key={v.attribute.key} className="rounded-lg bg-[#FAF8F3] px-3 py-2">
                <dt className="text-[11px] text-[var(--panel-ink-muted)]">{v.attribute.name}</dt>
                <dd className="mt-0.5 text-[13px] font-medium text-[var(--panel-ink)]">
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
