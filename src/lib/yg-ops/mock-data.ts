import type { OrderStage } from "@/components/yg-ops/shared/status-badge";

export type MockOrderLine = {
  name: string;
  packs: number;
  kg: number;
  packLabel: string;
  /** FEFO önerisi (mock) */
  fefoLots: { lotNumber: string; expirationDate: string; allocateKg: number }[];
};

export type MockOrder = {
  id: string;
  dealer: string;
  totalKurus: number;
  stage: OrderStage;
  createdAt: string;
  lines: MockOrderLine[];
};

export type MockSku = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  priceKurus: number;
  stockKg: number;
  packCount: number;
  packLabel: string;
  kgPerPack: number;
  expirationDate: string;
  moq: number;
};

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "YG-1042",
    dealer: "Anadolu Market",
    totalKurus: 12450000,
    stage: "under_review",
    createdAt: "2026-08-25T08:12:00.000Z",
    lines: [
      {
        name: "Tazelim Beyaz Peynir",
        packs: 4,
        kg: 68,
        packLabel: "teneke",
        fefoLots: [
          { lotNumber: "LOT-A12", expirationDate: daysFromNow(18), allocateKg: 51 },
          { lotNumber: "LOT-A19", expirationDate: daysFromNow(40), allocateKg: 17 },
        ],
      },
    ],
  },
  {
    id: "YG-1041",
    dealer: "Ege Şarküteri",
    totalKurus: 8620000,
    stage: "confirmed",
    createdAt: "2026-08-24T14:40:00.000Z",
    lines: [
      {
        name: "Eski Kaşar",
        packs: 12,
        kg: 12,
        packLabel: "vakum",
        fefoLots: [{ lotNumber: "LOT-K08", expirationDate: daysFromNow(12), allocateKg: 12 }],
      },
    ],
  },
  {
    id: "YG-1040",
    dealer: "Karadeniz HORECA",
    totalKurus: 4530000,
    stage: "preparing",
    createdAt: "2026-08-24T09:05:00.000Z",
    lines: [
      {
        name: "Tulum",
        packs: 6,
        kg: 6,
        packLabel: "koli",
        fefoLots: [{ lotNumber: "LOT-T03", expirationDate: daysFromNow(4), allocateKg: 6 }],
      },
    ],
  },
  {
    id: "YG-1039",
    dealer: "Marmara Toptan",
    totalKurus: 19870000,
    stage: "shipped",
    createdAt: "2026-08-23T16:20:00.000Z",
    lines: [
      {
        name: "Taze Kaşar",
        packs: 20,
        kg: 20,
        packLabel: "vakum",
        fefoLots: [{ lotNumber: "LOT-TK11", expirationDate: daysFromNow(28), allocateKg: 20 }],
      },
    ],
  },
  {
    id: "YG-1038",
    dealer: "Anadolu Market",
    totalKurus: 6720000,
    stage: "delivered",
    createdAt: "2026-08-22T11:00:00.000Z",
    lines: [
      {
        name: "Lor",
        packs: 8,
        kg: 8,
        packLabel: "kova",
        fefoLots: [{ lotNumber: "LOT-L02", expirationDate: daysFromNow(14), allocateKg: 8 }],
      },
    ],
  },
];

export const MOCK_WEEKLY_VOLUME = [
  { day: "Pzt", kg: 420 },
  { day: "Sal", kg: 380 },
  { day: "Çar", kg: 510 },
  { day: "Per", kg: 460 },
  { day: "Cum", kg: 620 },
  { day: "Cmt", kg: 290 },
  { day: "Paz", kg: 80 },
];

export const MOCK_SKT_ALERTS = [
  { name: "Tazelim Beyaz · LOT-A12", expirationDate: daysFromNow(45) },
  { name: "Eski Kaşar · LOT-K08", expirationDate: daysFromNow(12) },
  { name: "Tulum · LOT-T03", expirationDate: daysFromNow(4) },
  { name: "Lor · LOT-L01", expirationDate: daysFromNow(-1) },
];

export const MOCK_DEALER_CREDIT = {
  usedKurus: 11550000,
  limitKurus: 20000000,
  dealerName: "Anadolu Market",
};

export const MOCK_CATALOG: MockSku[] = [
  {
    id: "sku-beyaz",
    name: "Tazelim Beyaz Peynir",
    category: "beyaz-peynir",
    imageUrl: "/products/beyaz-peynir.jpg",
    priceKurus: 1850000,
    stockKg: 340,
    packCount: 20,
    packLabel: "teneke",
    kgPerPack: 17,
    expirationDate: daysFromNow(20),
    moq: 3,
  },
  {
    id: "sku-kasar",
    name: "Eski Kaşar",
    category: "eski-kasar",
    imageUrl: "/products/kasar.jpg",
    priceKurus: 980000,
    stockKg: 96,
    packCount: 96,
    packLabel: "vakum",
    kgPerPack: 1,
    expirationDate: daysFromNow(55),
    moq: 1,
  },
  {
    id: "sku-tulum",
    name: "Erzincan Tulum",
    category: "tulum",
    imageUrl: "/products/tulum.jpg",
    priceKurus: 720000,
    stockKg: 48,
    packCount: 48,
    packLabel: "koli",
    kgPerPack: 1,
    expirationDate: daysFromNow(8),
    moq: 2,
  },
  {
    id: "sku-lor",
    name: "Taze Lor",
    category: "lor",
    imageUrl: "/products/lor.jpg",
    priceKurus: 410000,
    stockKg: 60,
    packCount: 60,
    packLabel: "kova",
    kgPerPack: 1,
    expirationDate: daysFromNow(10),
    moq: 1,
  },
  {
    id: "sku-yogurt",
    name: "Köy Yoğurdu",
    category: "yogurt",
    imageUrl: "/products/yogurt.jpg",
    priceKurus: 285000,
    stockKg: 120,
    packCount: 120,
    packLabel: "kova",
    kgPerPack: 1,
    expirationDate: daysFromNow(7),
    moq: 4,
  },
  {
    id: "sku-tereyagi",
    name: "Köy Tereyağı",
    category: "tereyagi",
    imageUrl: "/products/tereyagi.jpg",
    priceKurus: 650000,
    stockKg: 40,
    packCount: 40,
    packLabel: "koli",
    kgPerPack: 1,
    expirationDate: daysFromNow(35),
    moq: 1,
  },
];

export const MOCK_CATALOG_CATEGORIES = [
  { id: "all", label: "Tümü" },
  { id: "beyaz-peynir", label: "Beyaz Peynir" },
  { id: "eski-kasar", label: "Eski Kaşar" },
  { id: "tulum", label: "Tulum" },
  { id: "lor", label: "Lor" },
  { id: "yogurt", label: "Yoğurt" },
  { id: "tereyagi", label: "Tereyağı" },
] as const;

export const MOCK_LAST_ORDER = {
  id: "YG-1038",
  totalKurus: 6720000,
  stage: "delivered" as OrderStage,
  summary: "3 kalem · 8 kova (8,0 kg) lor + beyaz",
};

export const MOCK_DEALERS = [
  {
    id: "d1",
    unvan: "Anadolu Market",
    city: "Ankara",
    usedKurus: 21550000,
    limitKurus: 30000000,
  },
  {
    id: "d2",
    unvan: "Ege Şarküteri",
    city: "İzmir",
    usedKurus: 8200000,
    limitKurus: 15000000,
  },
  {
    id: "d3",
    unvan: "Karadeniz HORECA",
    city: "Trabzon",
    usedKurus: 14200000,
    limitKurus: 12000000,
  },
  {
    id: "d4",
    unvan: "Marmara Toptan",
    city: "İstanbul",
    usedKurus: 4500000,
    limitKurus: 25000000,
  },
];

export const MOCK_PRICE_LISTS = [
  { id: "pl1", name: "Standart bayi", dealerCount: 86, itemCount: 42 },
  { id: "pl2", name: "HORECA", dealerCount: 28, itemCount: 38 },
  { id: "pl3", name: "Zincir market", dealerCount: 12, itemCount: 40 },
];

export const MOCK_SHIPMENTS = [
  { id: "SV-221", route: "Ankara kuzey", orders: 4, kg: 820, day: "Perşembe" },
  { id: "SV-222", route: "İstanbul Anadolu", orders: 6, kg: 1140, day: "Cuma" },
  { id: "SV-223", route: "İzmir çevre", orders: 3, kg: 510, day: "Cumartesi" },
];

export const MOCK_LEDGER = [
  { id: "l1", date: daysFromNow(-12), label: "Sipariş YG-1038", amountKurus: -6720000 },
  { id: "l2", date: daysFromNow(-8), label: "Havale", amountKurus: 10000000 },
  { id: "l3", date: daysFromNow(-2), label: "Sipariş YG-1042 (açık)", amountKurus: -12450000 },
];

export const MOCK_TICKETS = [
  { id: "T-14", subject: "Limit artırım talebi", status: "Açık" },
  { id: "T-11", subject: "Teslimat günü değişikliği", status: "Yanıtlandı" },
];

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString();
}
