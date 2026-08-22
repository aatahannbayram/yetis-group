import { formatAttributeDisplay } from "@/lib/format/attribute-value";
import type { AttributeType } from "@/generated/prisma";
import { productJsonLd } from "@/lib/seo/json-ld";
import { cn } from "@/lib/utils";

type AttrValue = {
  valueText: string | null;
  valueNumber: { toString(): string } | null;
  valueBoolean: boolean | null;
  selectedOptions: { option: { label: string } }[];
  attribute: { name: string; type: AttributeType; unit: string | null; key: string };
};

function numericBarPercent(value: AttrValue): number | null {
  if (value.attribute.type !== "NUMBER") return null;
  const n = Number(value.valueNumber?.toString() ?? "");
  if (!Number.isFinite(n) || n < 0) return null;
  const unit = (value.attribute.unit ?? "").toLocaleLowerCase("tr-TR");
  if (unit.includes("%") || unit.includes("yüzde")) return Math.min(100, n);
  if (!unit && n <= 100) return n;
  return null;
}

function NumericBar({ value }: { value: AttrValue }) {
  const display = formatAttributeDisplay(value);
  if (!display) return null;
  const pct = numericBarPercent(value);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <dt className="mkt-label text-mkt-ink-muted">{value.attribute.name}</dt>
        <dd className="text-[13px] font-medium tabular-nums text-mkt-ink">{display}</dd>
      </div>
      {pct !== null ? (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E8E4DA]">
          <div
            className="h-full rounded-full bg-[var(--brand-700)] motion-reduce:transition-none motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

export function ProductAttributes({ values }: { values: AttrValue[] }) {
  if (!values.length) return null;

  const certificates = values.find((v) => v.attribute.key === "sertifika");
  const rest = values.filter((v) => v.attribute.key !== "sertifika");
  const numeric = rest.filter((v) => v.attribute.type === "NUMBER");
  const other = rest.filter((v) => v.attribute.type !== "NUMBER");

  return (
    <div className="space-y-6">
      {certificates && certificates.selectedOptions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {certificates.selectedOptions.map((s) => (
            <span
              key={s.option.label}
              className="mkt-pill mkt-label bg-mkt-accent/15 px-3 py-1.5 text-mkt-green-text"
            >
              {s.option.label}
            </span>
          ))}
        </div>
      ) : null}

      {numeric.length > 0 ? (
        <dl className="space-y-4">
          {numeric.map((v) => (
            <NumericBar key={v.attribute.key} value={v} />
          ))}
        </dl>
      ) : null}

      {other.length > 0 ? (
        <dl className="grid gap-3 sm:grid-cols-2">
          {other.map((v) => {
            const display = formatAttributeDisplay(v);
            if (!display) return null;
            return (
              <div
                key={v.attribute.key}
                className={cn("rounded-[1rem] bg-[#FAF8F3] px-4 py-3")}
              >
                <dt className="mkt-label text-mkt-ink-muted">{v.attribute.name}</dt>
                <dd className="mt-1 text-[15px] font-medium text-mkt-ink">{display}</dd>
              </div>
            );
          })}
        </dl>
      ) : null}
    </div>
  );
}

export function ProductJsonLd(props: {
  name: string;
  description: string;
  image: string | null;
  sku: string;
  priceKurus?: number;
  brand: string;
  path: string;
  category?: string;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(props)) }}
    />
  );
}
