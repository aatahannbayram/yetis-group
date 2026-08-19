/** Category still-life when a SKU has no product photo. */

const BY_CATEGORY: Record<string, string> = {
  "beyaz peynir": "/products/beyaz-peynir.jpg",
  kaşar: "/products/kasar.jpg",
  kasar: "/products/kasar.jpg",
  lor: "/products/lor.jpg",
  tulum: "/products/tulum.jpg",
  yoğurt: "/products/yogurt.jpg",
  yogurt: "/products/yogurt.jpg",
  tereyağı: "/products/tereyagi.jpg",
  tereyagi: "/products/tereyagi.jpg",
  süt: "/products/sut.jpg",
  sut: "/products/sut.jpg",
};

export function catalogFallbackImage(category: string, imageUrl: string | null): string | null {
  if (imageUrl) return imageUrl;
  const key = category.trim().toLocaleLowerCase("tr-TR");
  return BY_CATEGORY[key] ?? "/products/beyaz-peynir.jpg";
}
