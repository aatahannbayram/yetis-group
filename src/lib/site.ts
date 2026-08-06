/**
 * Site identity + absolute URL helpers (SEO, OG, Schema.org, llms.txt).
 */

export const SITE = {
  name: "Yetiş Grup",
  legalName: "Yetiş Grup",
  slogan: "Temiz Gıdaya Eriş, Sağlıklı Yetiş",
  description:
    "Yöresel ve kırsal ürünlerde B2B çözüm ortağı. Market, şarküteri, HORECA ve ara toptancılara temiz gıda tedariki.",
  locale: "tr_TR",
  language: "tr",
  email: "info@yetisgrup.com",
  phone: "+908501234567",
  phoneDisplay: "0850 123 45 67",
  sameAs: [] as string[],
} as const;

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
