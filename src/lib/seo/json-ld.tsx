import { SITE, absoluteUrl, getSiteUrl } from "@/lib/site";

function absImage(url: string | null | undefined) {
  if (!url) return undefined;
  return url.startsWith("http") ? url : absoluteUrl(url);
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${getSiteUrl()}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: getSiteUrl(),
    logo: absoluteUrl("/brand/logo-light.png"),
    slogan: SITE.slogan,
    email: SITE.email,
    telephone: SITE.phone,
    sameAs: SITE.sameAs,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.phone,
      contactType: "sales",
      areaServed: "TR",
      availableLanguage: ["Turkish"],
    },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${getSiteUrl()}/#localbusiness`,
    name: SITE.name,
    description: SITE.description,
    url: getSiteUrl(),
    telephone: SITE.phone,
    email: SITE.email,
    image: absoluteUrl("/brand/logo-light.png"),
    priceRange: "$$",
    areaServed: {
      "@type": "Country",
      name: "Türkiye",
    },
    parentOrganization: { "@id": `${getSiteUrl()}/#organization` },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getSiteUrl()}/#website`,
    name: SITE.name,
    url: getSiteUrl(),
    description: SITE.description,
    inLanguage: "tr-TR",
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl()}/urunler?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function itemListJsonLd(
  items: { name: string; path: string; image?: string | null }[],
  listName: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(item.path),
      name: item.name,
      ...(absImage(item.image) ? { image: absImage(item.image) } : {}),
    })),
  };
}

export function productJsonLd(input: {
  name: string;
  description: string;
  path: string;
  image: string | null;
  sku: string;
  priceKurus?: number;
  brand: string;
  category?: string;
}) {
  const image = absImage(input.image);
  const showPrice =
    typeof input.priceKurus === "number" && Number.isFinite(input.priceKurus);
  const price = showPrice ? input.priceKurus : null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    sku: input.sku,
    url: absoluteUrl(input.path),
    category: input.category,
    brand: { "@type": "Brand", name: input.brand },
    ...(image ? { image: [image] } : {}),
    ...(price != null
      ? {
          offers: {
            "@type": "Offer",
            url: absoluteUrl(input.path),
            priceCurrency: "TRY",
            price: (price / 100).toFixed(2),
            availability: "https://schema.org/InStock",
            seller: { "@id": `${getSiteUrl()}/#organization` },
          },
        }
      : {}),
  };
}

export function JsonLdScript({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload.length === 1 ? payload[0] : payload),
      }}
    />
  );
}
