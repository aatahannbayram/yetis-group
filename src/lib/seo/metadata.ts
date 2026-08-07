import type { Metadata } from "next";
import { SITE, absoluteUrl, getSiteUrl } from "@/lib/site";

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(input.path);
  let ogImage = absoluteUrl("/brand/logo-light.png");
  if (input.image) {
    ogImage = input.image.startsWith("http") ? input.image : absoluteUrl(input.image);
  }

  const title = input.title.includes(SITE.name) ? input.title : `${input.title} · ${SITE.name}`;
  const description = input.description.trim().slice(0, 160);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        tr: url,
        "x-default": url,
      },
    },
    openGraph: {
      type: input.type ?? "website",
      locale: SITE.locale,
      url,
      siteName: SITE.name,
      title: input.title,
      description,
      images: [{ url: ogImage, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: [ogImage],
    },
    robots: input.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    metadataBase: new URL(getSiteUrl()),
  };
}
