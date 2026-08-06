/**
 * Corporate-site image manifesto: one asset, one slot.
 * Access only via getImage(id). B2B catalog (/urunler) product photos are out of scope.
 *
 * All slots use real JPEGs from /public — no "çekim bekleniyor" SVG placeholders in UI.
 */

export type ImageSlotId =
  | "hero"
  | "about-producer"
  | "stat-a"
  | "stat-b"
  | "cap-order"
  | "cap-cold"
  | "cap-delivery"
  | "cap-whatsapp"
  | "cat-kasar"
  | "cat-yogurt"
  | "cat-tereyagi"
  | "cat-sut"
  | "offer-board"
  | "process-tedarik"
  | "process-siparis"
  | "process-sevkiyat"
  | "about-sales"
  | "about-quality"
  | "about-ops"
  | "partner-kitchen"
  | "cta-final"
  | "contact-facility"
  | "news-hero"
  | "auth-side"
  | "stat-c"
  | "support-team"
  | "story-field";

export type ImageAsset = {
  id: ImageSlotId;
  src: string;
  alt: string;
  topic: string;
  usedAt: string;
  aspect: `${number}/${number}`;
  /** Dev-only label; never shown in UI */
  placeholderLabel: string;
  isPlaceholder: boolean;
};

export const IMAGE_MANIFEST: Record<ImageSlotId, ImageAsset> = {
  hero: {
    id: "hero",
    src: "/hero-dairy.jpg",
    alt: "Yetiş Grup, yöresel peynir ve kırsal süt ürünleri",
    topic: "Hero: süt ürünleri tezgâh atmosferi",
    usedAt: "home.hero",
    aspect: "16/9",
    placeholderLabel: "01 · Hero",
    isPlaceholder: false,
  },
  "about-producer": {
    id: "about-producer",
    src: "/scenes/warehouse.jpg",
    alt: "Yetiş depo ve soğuk alan",
    topic: "Hakkımızda hero: depo",
    usedAt: "about.hero",
    aspect: "16/9",
    placeholderLabel: "02 · Depo",
    isPlaceholder: false,
  },
  "stat-a": {
    id: "stat-a",
    src: "/products/lor.jpg",
    alt: "Lor peyniri",
    topic: "İstatistik şeridi: ürün detay",
    usedAt: "home.stat-a",
    aspect: "4/5",
    placeholderLabel: "03 · Stat A",
    isPlaceholder: false,
  },
  "stat-b": {
    id: "stat-b",
    src: "/products/kasar.jpg",
    alt: "Kaşar peyniri, üretici ürün detayı",
    topic: "İstatistik şeridi: ikinci foto",
    usedAt: "home.stat-b",
    aspect: "4/5",
    placeholderLabel: "04 · Stat B",
    isPlaceholder: false,
  },
  "stat-c": {
    id: "stat-c",
    src: "/scenes/truck-close.jpg",
    alt: "Sevkiyat hazırlığı",
    topic: "İstatistik şeridi: üçüncü foto",
    usedAt: "home.stat-c",
    aspect: "4/5",
    placeholderLabel: "05 · Stat C",
    isPlaceholder: false,
  },
  "cap-order": {
    id: "cap-order",
    src: "/products/beyaz-peynir.jpg",
    alt: "Beyaz peynir, sipariş kataloğu",
    topic: "Yetenek: sipariş",
    usedAt: "home.cap-order",
    aspect: "5/4",
    placeholderLabel: "06 · Sipariş",
    isPlaceholder: false,
  },
  "cap-cold": {
    id: "cap-cold",
    src: "/scenes/cold-chain.jpg",
    alt: "Soğuk zincir depolama",
    topic: "Yetenek: soğuk zincir",
    usedAt: "home.cap-cold",
    aspect: "5/4",
    placeholderLabel: "07 · Soğuk",
    isPlaceholder: false,
  },
  "cap-delivery": {
    id: "cap-delivery",
    src: "/scenes/truck-close.jpg",
    alt: "Teslimat aracı",
    topic: "Yetenek: teslimat",
    usedAt: "home.cap-delivery",
    aspect: "5/4",
    placeholderLabel: "08 · Teslimat",
    isPlaceholder: false,
  },
  "cap-whatsapp": {
    id: "cap-whatsapp",
    src: "/scenes/whatsapp-desk.jpg",
    alt: "WhatsApp destek masası",
    topic: "Yetenek: WhatsApp",
    usedAt: "home.cap-whatsapp",
    aspect: "5/4",
    placeholderLabel: "09 · WhatsApp",
    isPlaceholder: false,
  },
  "cat-kasar": {
    id: "cat-kasar",
    src: "/products/kasar.jpg",
    alt: "Kaşar peyniri",
    topic: "Katalog şeridi: kaşar",
    usedAt: "home.catalog-kasar",
    aspect: "3/4",
    placeholderLabel: "10 · Kaşar",
    isPlaceholder: false,
  },
  "cat-yogurt": {
    id: "cat-yogurt",
    src: "/products/yogurt.jpg",
    alt: "Yoğurt",
    topic: "Katalog şeridi: yoğurt",
    usedAt: "home.catalog-yogurt",
    aspect: "3/4",
    placeholderLabel: "11 · Yoğurt",
    isPlaceholder: false,
  },
  "cat-tereyagi": {
    id: "cat-tereyagi",
    src: "/products/tereyagi.jpg",
    alt: "Tereyağı",
    topic: "Katalog şeridi: tereyağı",
    usedAt: "home.catalog-tereyagi",
    aspect: "3/4",
    placeholderLabel: "12 · Tereyağı",
    isPlaceholder: false,
  },
  "cat-sut": {
    id: "cat-sut",
    src: "/products/sut.jpg",
    alt: "Süt",
    topic: "Katalog şeridi: süt",
    usedAt: "home.catalog-sut",
    aspect: "3/4",
    placeholderLabel: "13 · Süt",
    isPlaceholder: false,
  },
  "offer-board": {
    id: "offer-board",
    src: "/scenes/offer-board.jpg",
    alt: "Peynir tahtası, yöresel ürünler",
    topic: "Ne sunuyoruz görseli",
    usedAt: "home.offer-board",
    aspect: "16/10",
    placeholderLabel: "14 · Teklif",
    isPlaceholder: false,
  },
  "process-tedarik": {
    id: "process-tedarik",
    src: "/products/tulum.jpg",
    alt: "Tulum peyniri, tedarik",
    topic: "Süreç: tedarik",
    usedAt: "home.process-tedarik",
    aspect: "16/10",
    placeholderLabel: "15 · Tedarik",
    isPlaceholder: false,
  },
  "process-siparis": {
    id: "process-siparis",
    src: "/scenes/whatsapp-desk.jpg",
    alt: "Bayi sipariş ve iletişim masası",
    topic: "Süreç: sipariş",
    usedAt: "home.process-siparis",
    aspect: "16/10",
    placeholderLabel: "16 · Sipariş süreci",
    isPlaceholder: false,
  },
  "process-sevkiyat": {
    id: "process-sevkiyat",
    src: "/scenes/delivery.jpg",
    alt: "Sevkiyat teslimatı",
    topic: "Süreç: sevkiyat",
    usedAt: "home.process-sevkiyat",
    aspect: "16/10",
    placeholderLabel: "17 · Sevkiyat",
    isPlaceholder: false,
  },
  "about-sales": {
    id: "about-sales",
    src: "/scenes/how-sales.jpg",
    alt: "Satış ekibi, bayi ziyareti",
    topic: "Hakkımızda: satış yüzü",
    usedAt: "about.face-sales",
    aspect: "4/5",
    placeholderLabel: "18 · Satış",
    isPlaceholder: false,
  },
  "about-quality": {
    id: "about-quality",
    src: "/scenes/how-quality.jpg",
    alt: "Kalite ve soğuk zincir kontrolü",
    topic: "Hakkımızda: kalite",
    usedAt: "about.face-quality",
    aspect: "4/5",
    placeholderLabel: "19 · Kalite",
    isPlaceholder: false,
  },
  "about-ops": {
    id: "about-ops",
    src: "/scenes/how-ops.jpg",
    alt: "Operasyon ve sevkiyat planı",
    topic: "Hakkımızda: operasyon",
    usedAt: "about.face-ops",
    aspect: "4/5",
    placeholderLabel: "20 · Operasyon",
    isPlaceholder: false,
  },
  "partner-kitchen": {
    id: "partner-kitchen",
    src: "/scenes/kitchen.jpg",
    alt: "HORECA mutfak partner sahnesi",
    topic: "SSS sol görsel",
    usedAt: "home.faq-visual",
    aspect: "4/5",
    placeholderLabel: "21 · Mutfak",
    isPlaceholder: false,
  },
  "cta-final": {
    id: "cta-final",
    src: "/scenes/how-sales.jpg",
    alt: "Bayi sipariş masası",
    topic: "Final bayi CTA",
    usedAt: "home.cta-final",
    aspect: "4/5",
    placeholderLabel: "22 · CTA final",
    isPlaceholder: false,
  },
  "contact-facility": {
    id: "contact-facility",
    src: "/scenes/kitchen.jpg",
    alt: "Yetiş tesis / mutfak alanı",
    topic: "İletişim hero",
    usedAt: "contact.hero",
    aspect: "16/9",
    placeholderLabel: "23 · İletişim",
    isPlaceholder: false,
  },
  "news-hero": {
    id: "news-hero",
    src: "/scenes/warehouse.jpg",
    alt: "Haberler sayfası kapak: depo ve tedarik",
    topic: "Haberler hero",
    usedAt: "news.hero",
    aspect: "16/9",
    placeholderLabel: "24 · Haberler",
    isPlaceholder: false,
  },
  "auth-side": {
    id: "auth-side",
    src: "/scenes/offer-board.jpg",
    alt: "Bayi giriş görseli",
    topic: "Auth yan görsel",
    usedAt: "auth.side",
    aspect: "3/4",
    placeholderLabel: "25 · Auth",
    isPlaceholder: false,
  },
  "support-team": {
    id: "support-team",
    src: "/scenes/how-sales.jpg",
    alt: "Satış destek ekibi",
    topic: "Destek şeridi",
    usedAt: "home.support-team",
    aspect: "1/1",
    placeholderLabel: "26 · Destek",
    isPlaceholder: false,
  },
  "story-field": {
    id: "story-field",
    src: "/scenes/delivery.jpg",
    alt: "Kırsal üretim ve teslimat",
    topic: "Hikâye / çözüm ortağı vurgu",
    usedAt: "home.story-field",
    aspect: "16/10",
    placeholderLabel: "27 · Hikâye",
    isPlaceholder: false,
  },
};

export function getImage(id: ImageSlotId): ImageAsset {
  const asset = IMAGE_MANIFEST[id];
  if (!asset) throw new Error(`Unknown image slot: ${id}`);
  return asset;
}

export function listImageAssets(): ImageAsset[] {
  return Object.values(IMAGE_MANIFEST);
}
