/** Category still-life when a SKU has no product photo. */

const BY_CATEGORY: Record<string, string> = {
  "beyaz peynir": "/products/beyaz-peynir.jpg",
  kaşar: "/products/kasar.jpg",
  kasar: "/products/kasar.jpg",
  "eski kaşar": "/products/kasar.jpg",
  "taze kaşar": "/products/kasar.jpg",
  lor: "/products/lor.jpg",
  tulum: "/products/tulum.jpg",
  yoğurt: "/products/yogurt.jpg",
  yogurt: "/products/yogurt.jpg",
  tereyağı: "/products/tereyagi.jpg",
  tereyagi: "/products/tereyagi.jpg",
  süt: "/products/sut.jpg",
  sut: "/products/sut.jpg",
};

const FALLBACK = "/products/beyaz-peynir.jpg";

export function catalogFallbackImage(category: string, imageUrl: string | null): string | null {
  if (imageUrl) return imageUrl;
  const key = category.trim().toLocaleLowerCase("tr-TR");
  if (!key) return FALLBACK;
  if (BY_CATEGORY[key]) return BY_CATEGORY[key];

  const partial = Object.keys(BY_CATEGORY)
    .filter((name) => key.includes(name) || name.includes(key))
    .sort((a, b) => b.length - a.length)[0];
  return (partial ? BY_CATEGORY[partial] : FALLBACK) ?? FALLBACK;
}
