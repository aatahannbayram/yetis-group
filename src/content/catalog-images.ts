/** Category still-life when a SKU has no product photo. */

const KATALOG_PLACEHOLDER = "/products/katalog-placeholder.jpg";

const BY_CATEGORY: Record<string, string> = {
  "beyaz peynir": KATALOG_PLACEHOLDER,
  "kaşar peyniri": KATALOG_PLACEHOLDER,
  kaşar: KATALOG_PLACEHOLDER,
  kasar: "/products/kasar.jpg",
  "eski kaşar": KATALOG_PLACEHOLDER,
  "taze kaşar": KATALOG_PLACEHOLDER,
  lor: "/products/lor.jpg",
  "lor peyniri": "/products/lor.jpg",
  tulum: "/products/tulum.jpg",
  "tulum peyniri": KATALOG_PLACEHOLDER,
  yoğurt: "/products/yogurt.jpg",
  yogurt: "/products/yogurt.jpg",
  tereyağı: "/products/tereyagi.jpg",
  tereyagi: "/products/tereyagi.jpg",
  "tereyağı & yoğurt": KATALOG_PLACEHOLDER,
  süt: "/products/sut.jpg",
  sut: "/products/sut.jpg",
  peynir: KATALOG_PLACEHOLDER,
  "tel / dil / örgü peyniri": KATALOG_PLACEHOLDER,
  "otlu / özel peynirler": KATALOG_PLACEHOLDER,
  "helva & tahin": KATALOG_PLACEHOLDER,
  helva: KATALOG_PLACEHOLDER,
  tahin: KATALOG_PLACEHOLDER,
  "zeytin & zeytinyağı": KATALOG_PLACEHOLDER,
  zeytin: KATALOG_PLACEHOLDER,
  zeytinyağı: KATALOG_PLACEHOLDER,
  "siyah zeytin": KATALOG_PLACEHOLDER,
  "yeşil zeytin": KATALOG_PLACEHOLDER,
  şarküteri: KATALOG_PLACEHOLDER,
  "sucuk & pastırma": KATALOG_PLACEHOLDER,
  "sosis & salam & jambon": KATALOG_PLACEHOLDER,
};

const FALLBACK = KATALOG_PLACEHOLDER;

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

export { KATALOG_PLACEHOLDER };
