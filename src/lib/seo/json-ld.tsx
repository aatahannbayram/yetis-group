import { SITE, absoluteUrl, getSiteUrl } from "@/lib/site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    legalName: SITE.legalName,
    url: getSiteUrl(),
    logo: absoluteUrl("/brand/logo-light.png"),
    slogan: SITE.slogan,
    email: SITE.email,
    telephone: SITE.phone,
    sameAs: SITE.sameAs,
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
    name: SITE.name,
    url: getSiteUrl(),
    description: SITE.description,
    inLanguage: "tr-TR",
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: absoluteUrl("/brand/logo-light.png"),
    },
  };
}

export function JsonLdScript({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload.length === 1 ? payload[0] : payload) }}
    />
  );
}
