import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "Yetiş",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F3",
    theme_color: "#1B5E3A",
    lang: "tr",
    icons: [
      {
        src: "/brand/symbol.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
