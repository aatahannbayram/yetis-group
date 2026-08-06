import type { Metadata } from "next";
import { SITE, absoluteUrl, getSiteUrl } from "@/lib/site";

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(input.path);
  let ogImage = absoluteUrl("/brand/logo-light.png");
  if (input.image) {
    ogImage = input.image.startsWith("http") ? input.image : absoluteUrl(input.image);
  }

  return {
    title: input.title.includes(SITE.name) ? input.title : `${input.title} · ${SITE.name}`,
    description: input.description,
    alternates: {
      canonical: url,
      languages: {
        tr: url,
        "x-default": url,
      },
    },
    openGraph: {
      type: "website",
      locale: SITE.locale,
      url,
      siteName: SITE.name,
      title: input.title,
      description: input.description,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [ogImage],
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    metadataBase: new URL(getSiteUrl()),
  };
}
