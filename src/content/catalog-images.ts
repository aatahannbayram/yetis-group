/** Category still-life when a SKU has no product photo. */

const BY_CATEGORY: Record<string, string> = {
  "beyaz peynir": "/products/beyaz-peynir.jpg",
  "kaşar peyniri": "/products/kasar.jpg",
  kaşar: "/products/kasar.jpg",
  kasar: "/products/kasar.jpg",
  "eski kaşar": "/products/kasar.jpg",
  "taze kaşar": "/products/kasar.jpg",
  lor: "/products/lor.jpg",
  "lor peyniri": "/products/lor.jpg",
  tulum: "/products/tulum.jpg",
  "tulum peyniri": "/products/tulum.jpg",
  yoğurt: "/products/yogurt.jpg",
  yogurt: "/products/yogurt.jpg",
  tereyağı: "/products/tereyagi.jpg",
  tereyagi: "/products/tereyagi.jpg",
  "tereyağı & yoğurt": "/products/tereyagi.jpg",
  süt: "/products/sut.jpg",
  sut: "/products/sut.jpg",
  peynir: "/products/beyaz-peynir.jpg",
  "tel / dil / örgü peyniri": "/products/kasar.jpg",
  "otlu / özel peynirler": "/products/beyaz-peynir.jpg",
  "helva & tahin": "/products/beyaz-peynir.jpg",
  helva: "/products/beyaz-peynir.jpg",
  tahin: "/products/beyaz-peynir.jpg",
  "zeytin & zeytinyağı": "/products/beyaz-peynir.jpg",
  zeytin: "/products/beyaz-peynir.jpg",
  zeytinyağı: "/products/beyaz-peynir.jpg",
  "siyah zeytin": "/products/beyaz-peynir.jpg",
  "yeşil zeytin": "/products/beyaz-peynir.jpg",
  şarküteri: "/products/katalog-placeholder.jpg",
  "sucuk & pastırma": "/products/katalog-placeholder.jpg",
  "sosis & salam & jambon": "/products/katalog-placeholder.jpg",
};

/** Genel katalog varsayılanı: peynir still-life (sucuk görseli değil). */
const FALLBACK = "/products/beyaz-peynir.jpg";

export function catalogFallbackImage(category: string, imageUrl: string | null): string {
  if (imageUrl?.trim()) return imageUrl.trim();
  const key = category.trim().toLocaleLowerCase("tr-TR");
  if (!key) return FALLBACK;
  if (BY_CATEGORY[key]) return BY_CATEGORY[key]!;

  const partial = Object.keys(BY_CATEGORY)
    .filter((name) => key.includes(name) || name.includes(key))
    .sort((a, b) => b.length - a.length)[0];
  return (partial ? BY_CATEGORY[partial] : FALLBACK) ?? FALLBACK;
}

/** Yalnızca şarküteri / sucuk kategorileri için geçici placeholder. */
export const SUCUK_PLACEHOLDER = "/products/katalog-placeholder.jpg";
