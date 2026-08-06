import { formatAttributeDisplay } from "@/infra/db/attributes";
import type { AttributeType } from "@/generated/prisma";

type AttrValue = {
  valueText: string | null;
  valueNumber: { toString(): string } | null;
  valueBoolean: boolean | null;
  selectedOptions: { option: { label: string } }[];
  attribute: { name: string; type: AttributeType; unit: string | null; key: string };
};

export function ProductAttributes({ values }: { values: AttrValue[] }) {
  if (!values.length) return null;

  const certificates = values.find((v) => v.attribute.key === "sertifika");
  const rest = values.filter((v) => v.attribute.key !== "sertifika");

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

      <dl className="grid gap-3 sm:grid-cols-2">
        {rest.map((v) => {
          const display = formatAttributeDisplay(v);
          if (!display) return null;
          return (
            <div key={v.attribute.key} className="rounded-[1rem] bg-mkt-card-muted px-4 py-3">
              <dt className="mkt-label text-mkt-ink-muted">{v.attribute.name}</dt>
              <dd className="mt-1 text-[15px] font-medium text-mkt-ink">{display}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export function ProductJsonLd({
  name,
  description,
  image,
  sku,
  priceKurus,
  brand,
}: {
  name: string;
  description: string;
  image: string | null;
  sku: string;
  priceKurus: number;
  brand: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    sku,
    brand: { "@type": "Brand", name: brand },
    image: image ? [image] : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: (priceKurus / 100).toFixed(2),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
