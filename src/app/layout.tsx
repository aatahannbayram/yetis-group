import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SITE, getSiteUrl, absoluteUrl } from "@/lib/site";
import { ChunkErrorReload } from "@/components/system/chunk-error-reload";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE.name} · ${SITE.slogan}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: getSiteUrl() }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "business",
  keywords: [
    "Yetiş Grup",
    "toptan gıda",
    "B2B",
    "yöresel ürün",
    "bayi sipariş",
    "HORECA tedarik",
    "peynir toptan",
  ],
  alternates: {
    canonical: "/",
    languages: {
      tr: "/",
      "x-default": "/",
    },
    types: {
      "application/rss+xml": absoluteUrl("/haberler/rss.xml"),
    },
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: getSiteUrl(),
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    images: [{ url: absoluteUrl("/brand/logo-light.png"), alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
    images: [absoluteUrl("/brand/logo-light.png")],
  },
  robots: {
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
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/symbol.png", type: "image/png", sizes: "any" },
    ],
    shortcut: "/favicon.png",
    apple: "/brand/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={cn("h-full", "antialiased", "font-sans", inter.variable)}>
      <body className="min-h-full flex flex-col bg-canvas text-neutral-900">
        <ChunkErrorReload />
        {children}
      </body>
    </html>
  );
}
