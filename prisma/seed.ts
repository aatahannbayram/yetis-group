import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";
import { PACKAGING_OPTIONS } from "../src/lib/format/packaging";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on("connect", (client) => {
  void client.query("SET search_path TO public");
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const leads = [
  {
    companyName: "Beşiktaş Şarküteri Dünyası",
    contactName: "Murat Kaya",
    phone: "0532 111 22 33",
    city: "İstanbul",
    channel: "SARKUTERI" as const,
    stage: "MUZAKERE" as const,
    estimatedMonthlyKg: "420.000",
    note: "17 kg teneke beyaz peynir + kaşar için haftalık sabit sipariş istiyor.",
  },
  {
    companyName: "Kadıköy Zincir Market A.Ş.",
    contactName: "Elif Sarıkaya",
    phone: "0533 222 33 44",
    city: "İstanbul",
    channel: "MARKET" as const,
    stage: "NUMUNE_TEKLIF" as const,
    estimatedMonthlyKg: "1250.000",
    note: "6 şube için merkezi sipariş; numune gönderildi, fiyat teklifi bekleniyor.",
  },
  {
    companyName: "Liman Otel & Restoran Grubu",
    contactName: "Serkan Demir",
    phone: "0535 333 44 55",
    city: "Antalya",
    channel: "HORECA" as const,
    stage: "ILETISIMDE" as const,
    estimatedMonthlyKg: "300.000",
    note: "Otel mutfağı için dilimli kaşar ve lor peyniri görüşülüyor.",
  },
  {
    companyName: "Ege Toptan Gıda Dağıtım",
    contactName: "Ayşe Yıldırım",
    phone: "0536 444 55 66",
    city: "İzmir",
    channel: "ARA_TOPTANCI" as const,
    stage: "YENI" as const,
    estimatedMonthlyKg: "2000.000",
    note: "Ege bölgesi ara toptancı; ilk görüşme talebi WhatsApp'tan geldi.",
  },
  {
    companyName: "Bursa Şehir Marketleri",
    contactName: "Hakan Öztürk",
    phone: "0537 555 66 77",
    city: "Bursa",
    channel: "MARKET" as const,
    stage: "KAZANILDI" as const,
    estimatedMonthlyKg: "680.000",
    note: "Sözleşme imzalandı, ilk sevkiyat planlanıyor.",
  },
  {
    companyName: "Karaköy Cafe & Bistro",
    contactName: "Zeynep Aydın",
    phone: "0538 666 77 88",
    city: "İstanbul",
    channel: "HORECA" as const,
    stage: "KAYBEDILDI" as const,
    lostReason: "Bütçe uyuşmazlığı",
    estimatedMonthlyKg: "60.000",
    note: "Bütçe uyuşmadı; 6 ay sonra tekrar aranacak.",
  },
  {
    companyName: "Konya Şarküteri Toptan",
    contactName: "Mehmet Çelik",
    phone: "0539 777 88 99",
    city: "Konya",
    channel: "SARKUTERI" as const,
    stage: "ILETISIMDE" as const,
    estimatedMonthlyKg: "540.000",
    note: "Tulum peyniri kapasitesi soruldu; teknik görüşme planlanıyor.",
  },
  {
    companyName: "Adana Toptan Süt Ürünleri",
    contactName: "Fatma Şahin",
    phone: "0530 888 99 00",
    city: "Adana",
    channel: "ARA_TOPTANCI" as const,
    stage: "YENI" as const,
    estimatedMonthlyKg: "1800.000",
    note: "Fuar standından gelen kayıt; henüz aranmadı.",
  },
];

type ExtraCins = {
  sku: string;
  packSize: string;
  unitFactor: string;
  pricePerUnitKurus: number;
  horeca?: number;
  market?: number;
};

function packagingOf(unitLabel: string): string {
  const u = unitLabel.toLocaleLowerCase("tr-TR");
  if (u.includes("teneke")) return "TENEKE";
  if (u.includes("vakum")) return "VAKUM";
  if (u.includes("kutu")) return "KUTU";
  if (u.includes("dökme") || u.includes("dokme")) return "DOKME";
  return "KOLI";
}

const products = [
  {
    sku: "YG-BP17-TNK",
    name: "Beyaz Peynir",
    slug: "beyaz-peynir-17kg-teneke",
    category: "Beyaz Peynir",
    description:
      "Geleneksel tam yağlı inek sütü beyaz peynir. Şarküteri ve toptan için teneke; tezgâh için vakum cinsleri.",
    unitLabel: "17 kg teneke",
    kgPerUnit: "17.000",
    pricePerUnitKurus: 340000,
    imageUrl: "/products/beyaz-peynir.jpg",
    extraCins: [
      {
        sku: "YG-BP01-VAK",
        packSize: "1 kg vakum",
        unitFactor: "1.000",
        pricePerUnitKurus: 22000,
        horeca: 21400,
        market: 20800,
      },
    ] satisfies ExtraCins[],
  },
  {
    sku: "YG-KS01-VAK",
    name: "Kaşar Peyniri",
    slug: "kasar-peyniri-1kg-vakum",
    category: "Kaşar",
    description: "Olgunlaştırılmış tam yağlı kaşar. Vakum teker ve koli cinsleri.",
    unitLabel: "1 kg vakum",
    kgPerUnit: "1.000",
    pricePerUnitKurus: 38000,
    imageUrl: "/products/kasar.jpg",
    extraCins: [
      {
        sku: "YG-KS03-KOL",
        packSize: "3 kg koli",
        unitFactor: "3.000",
        pricePerUnitKurus: 108000,
        horeca: 105000,
        market: 102000,
      },
    ] satisfies ExtraCins[],
  },
  {
    sku: "YG-KS025-DLM",
    name: "Dilimli Kaşar",
    slug: "dilimli-kasar-250g",
    category: "Kaşar",
    description: "Hazır dilimli kaşar peyniri, raf ve HORECA paketi.",
    unitLabel: "250 g paket",
    kgPerUnit: "0.250",
    pricePerUnitKurus: 11000,
    imageUrl: "/products/kasar.jpg",
    extraCins: [
      {
        sku: "YG-KS1-DLM",
        packSize: "1 kg kutu",
        unitFactor: "1.000",
        pricePerUnitKurus: 40000,
        horeca: 38800,
        market: 37600,
      },
    ] satisfies ExtraCins[],
  },
  {
    sku: "YG-TL08-VAK",
    name: "Tulum Peyniri",
    slug: "tulum-peyniri-800g",
    category: "Tulum",
    description: "Geleneksel tulum peyniri, vakum cinsleri.",
    unitLabel: "800 g vakum",
    kgPerUnit: "0.800",
    pricePerUnitKurus: 32000,
    imageUrl: "/products/tulum.jpg",
    extraCins: [
      {
        sku: "YG-TL04-VAK",
        packSize: "400 g vakum",
        unitFactor: "0.400",
        pricePerUnitKurus: 17500,
        horeca: 17000,
        market: 16500,
      },
    ] satisfies ExtraCins[],
  },
  {
    sku: "YG-LR01-STD",
    name: "Lor Peyniri",
    slug: "lor-peyniri-1kg",
    category: "Lor",
    description: "Taze lor peyniri. 1 kg paket ve 5 kg kova cinsleri.",
    unitLabel: "1 kg vakum",
    kgPerUnit: "1.000",
    pricePerUnitKurus: 18000,
    imageUrl: "/products/lor.jpg",
    extraCins: [
      {
        sku: "YG-LR05-KOV",
        packSize: "5 kg kova",
        unitFactor: "5.000",
        pricePerUnitKurus: 82000,
        horeca: 80000,
        market: 78000,
      },
    ] satisfies ExtraCins[],
  },
  {
    sku: "YG-TY01-KOV",
    name: "Tereyağı",
    slug: "tereyagi-1kg-kova",
    category: "Tereyağı",
    description: "Sade tereyağı. Kova ve kutu cinsleri.",
    unitLabel: "1 kg kova",
    kgPerUnit: "1.000",
    pricePerUnitKurus: 45000,
    imageUrl: "/products/tereyagi.jpg",
    extraCins: [
      {
        sku: "YG-TY02-KUT",
        packSize: "200 g kutu",
        unitFactor: "0.200",
        pricePerUnitKurus: 10500,
        horeca: 10200,
        market: 9900,
      },
    ] satisfies ExtraCins[],
  },
  {
    sku: "YG-YG05-KOV",
    name: "Yoğurt",
    slug: "yogurt-5kg-kova",
    category: "Yoğurt",
    description: "Tam yağlı süzme yoğurt. Toptan kova cinsleri.",
    unitLabel: "5 kg kova",
    kgPerUnit: "5.000",
    pricePerUnitKurus: 25000,
    imageUrl: "/products/yogurt.jpg",
    extraCins: [
      {
        sku: "YG-YG01-KOV",
        packSize: "1 kg kova",
        unitFactor: "1.000",
        pricePerUnitKurus: 6200,
        horeca: 6000,
        market: 5800,
      },
    ] satisfies ExtraCins[],
  },
  {
    sku: "YG-ST01-LTR",
    name: "Süt",
    slug: "sut-1l",
    category: "Süt",
    description: "Pastörize tam yağlı süt. Litre ve bidon cinsleri.",
    unitLabel: "1 L",
    kgPerUnit: "1.000",
    pricePerUnitKurus: 3500,
    imageUrl: "/products/sut.jpg",
    extraCins: [
      {
        sku: "YG-ST05-BID",
        packSize: "5 L bidon",
        unitFactor: "5.000",
        pricePerUnitKurus: 16500,
        horeca: 16000,
        market: 15500,
      },
    ] satisfies ExtraCins[],
  },
];

// slug -> { horeca, market } fiyatları (kuruş) - Standart liste ürünün baz
// fiyatını (pricePerUnitKurus) kullanır.
const priceListOverrides: Record<string, { horeca: number; market: number }> = {
  "beyaz-peynir-17kg-teneke": { horeca: 332000, market: 322000 },
  "kasar-peyniri-1kg-vakum": { horeca: 37200, market: 36000 },
  "dilimli-kasar-250g": { horeca: 10600, market: 10300 },
  "tulum-peyniri-800g": { horeca: 31200, market: 30200 },
  "lor-peyniri-1kg": { horeca: 17600, market: 17000 },
  "tereyagi-1kg-kova": { horeca: 44000, market: 42500 },
  "yogurt-5kg-kova": { horeca: 24300, market: 23500 },
  "sut-1l": { horeca: 3400, market: 3300 },
};

async function seedLeads() {
  const existing = await prisma.lead.count();
  if (existing > 0) {
    console.log(`Skipping leads - ${existing} already exist.`);
    return;
  }
  for (const lead of leads) {
    await prisma.lead.create({ data: lead });
  }
  console.log(`Seeded ${leads.length} lead(s).`);
}

async function seedCatalog() {
  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log(`Skipping catalog - ${existing} product(s) already exist.`);
    return;
  }

  const producer =
    (await prisma.producer.findUnique({ where: { slug: "yetis-uretim" } })) ??
    (await prisma.producer.create({
      data: {
        name: "Yetiş Üretim",
        slug: "yetis-uretim",
        region: "Türkiye",
        story: "Yetiş Grup kendi üretim ve seçilmiş yöresel ürün portföyü.",
      },
    }));

  const categoryByName = new Map<string, string>();
  for (const name of [...new Set(products.map((p) => p.category))]) {
    const slug = name
      .toLocaleLowerCase("tr-TR")
      .replaceAll("ı", "i")
      .replaceAll("ğ", "g")
      .replaceAll("ü", "u")
      .replaceAll("ş", "s")
      .replaceAll("ö", "o")
      .replaceAll("ç", "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const cat = await prisma.category.create({ data: { name, slug } });
    categoryByName.set(name, cat.id);
  }

  type CreatedVariant = {
    slug: string;
    sku: string;
    variantId: string;
    price: number;
    horeca?: number;
    market?: number;
  };
  const createdVariants: CreatedVariant[] = [];

  for (const p of products) {
    const categoryId = categoryByName.get(p.category);
    if (!categoryId) throw new Error(`Missing category ${p.category}`);
    const extras = "extraCins" in p ? p.extraCins : [];
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        imageUrl: p.imageUrl,
        producerId: producer.id,
        primaryCategoryId: categoryId,
        categories: { create: { categoryId } },
        variants: {
          create: [
            {
              sku: p.sku,
              packagingType: packagingOf(p.unitLabel),
              packSize: p.unitLabel,
              unitFactor: p.kgPerUnit,
              pricePerUnitKurus: p.pricePerUnitKurus,
              sortOrder: 0,
            },
            ...extras.map((c, i) => ({
              sku: c.sku,
              packagingType: packagingOf(c.packSize),
              packSize: c.packSize,
              unitFactor: c.unitFactor,
              pricePerUnitKurus: c.pricePerUnitKurus,
              sortOrder: i + 1,
            })),
          ],
        },
      },
      include: { variants: true },
    });
    const primary = product.variants.find((v) => v.sku === p.sku) ?? product.variants[0]!;
    const override = priceListOverrides[p.slug];
    createdVariants.push({
      slug: p.slug,
      sku: primary.sku,
      variantId: primary.id,
      price: p.pricePerUnitKurus,
      horeca: override?.horeca,
      market: override?.market,
    });
    for (const extra of extras) {
      const variant = product.variants.find((v) => v.sku === extra.sku);
      if (!variant) continue;
      createdVariants.push({
        slug: p.slug,
        sku: extra.sku,
        variantId: variant.id,
        price: extra.pricePerUnitKurus,
        horeca: extra.horeca,
        market: extra.market,
      });
    }
  }

  const standart = await prisma.priceList.create({
    data: { name: "Standart", slug: "standart" },
  });
  const horeca = await prisma.priceList.create({
    data: { name: "HORECA", slug: "horeca" },
  });
  const market = await prisma.priceList.create({
    data: { name: "Zincir Market", slug: "zincir-market" },
  });

  for (const row of createdVariants) {
    await prisma.priceListItem.create({
      data: { priceListId: standart.id, variantId: row.variantId, priceKurus: row.price },
    });
    if (row.horeca != null) {
      await prisma.priceListItem.create({
        data: { priceListId: horeca.id, variantId: row.variantId, priceKurus: row.horeca },
      });
    }
    if (row.market != null) {
      await prisma.priceListItem.create({
        data: { priceListId: market.id, variantId: row.variantId, priceKurus: row.market },
      });
    }
  }

  await prisma.user.updateMany({
    where: { email: "bayi@yetisgrup.test" },
    data: { priceListId: standart.id },
  });
  await prisma.dealer.updateMany({
    where: { users: { some: { email: "bayi@yetisgrup.test" } } },
    data: { priceListId: standart.id },
  });
  await prisma.dealer.updateMany({
    where: { users: { some: { email: "horeca@yetisgrup.test" } } },
    data: { priceListId: horeca.id },
  });

  console.log(`Seeded ${createdVariants.length} product(s) with variants + price lists.`);
}

async function seedAccountTypes() {
  await prisma.user.updateMany({
    where: { email: { in: ["bayi@yetisgrup.test", "horeca@yetisgrup.test"] } },
    data: { accountType: "DEALER" },
  });
}

async function seedLeadActivities() {
  const existing = await prisma.leadActivity.count();
  if (existing > 0) {
    console.log(`Skipping lead activities - ${existing} already exist.`);
    return;
  }

  const besiktas = await prisma.lead.findFirst({
    where: { companyName: "Beşiktaş Şarküteri Dünyası" },
  });
  const kadikoy = await prisma.lead.findFirst({
    where: { companyName: "Kadıköy Zincir Market A.Ş." },
  });
  const bursa = await prisma.lead.findFirst({
    where: { companyName: "Bursa Şehir Marketleri" },
  });

  const activities: {
    leadId: string;
    type: "ARAMA" | "NOT" | "TEKLIF" | "TESLIMAT" | "DURUM_DEGISIKLIGI";
    note: string;
  }[] = [];

  if (besiktas) {
    activities.push(
      { leadId: besiktas.id, type: "ARAMA", note: "İlk tanışma görüşmesi yapıldı, ihtiyaçlar dinlendi." },
      { leadId: besiktas.id, type: "NOT", note: "17 kg teneke beyaz peynir + kaşar için haftalık düzenli sipariş talebi var." },
      { leadId: besiktas.id, type: "TEKLIF", note: "Haftalık sabit sipariş için özel fiyat teklifi iletildi." },
      { leadId: besiktas.id, type: "ARAMA", note: "Teklif üzerine ikinci görüşme yapıldı, müzakere sürüyor." },
    );
  }
  if (kadikoy) {
    activities.push(
      { leadId: kadikoy.id, type: "ARAMA", note: "6 şube için merkezi tedarik ihtiyacı görüşüldü." },
      { leadId: kadikoy.id, type: "TESLIMAT", note: "Numune paketi tüm şubelere gönderildi." },
      { leadId: kadikoy.id, type: "NOT", note: "Satın alma ekibi numuneleri değerlendiriyor, fiyat teklifi bekleniyor." },
    );
  }
  if (bursa) {
    activities.push(
      { leadId: bursa.id, type: "TEKLIF", note: "Yıllık tedarik teklifi sunuldu ve kabul edildi." },
      { leadId: bursa.id, type: "DURUM_DEGISIKLIGI", note: "Sözleşme imzalandı, aday kazanıldı olarak işaretlendi." },
      { leadId: bursa.id, type: "TESLIMAT", note: "İlk sevkiyat için depo ile koordinasyon sağlanıyor." },
    );
  }

  for (const activity of activities) {
    await prisma.leadActivity.create({ data: activity });
  }
  console.log(`Seeded ${activities.length} lead activity(s).`);
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function seedInventory() {
  const existing = await prisma.lot.count();
  if (existing > 0) {
    console.log(`Skipping inventory - ${existing} lot(s) already exist.`);
    return;
  }

  const variants = await prisma.productVariant.findMany({ include: { product: true } });

  for (const variant of variants) {
    await prisma.lot.create({
      data: {
        variantId: variant.id,
        lotNumber: `${variant.sku}-A`,
        expirationDate: daysFromNow(90),
        movements: {
          create: {
            type: "GIRIS",
            quantityKg: variant.unitFactor.mul(20),
            note: "Üretimden ilk giriş",
          },
        },
      },
    });
    await prisma.lot.create({
      data: {
        variantId: variant.id,
        lotNumber: `${variant.sku}-B`,
        expirationDate: daysFromNow(10),
        movements: {
          create: {
            type: "GIRIS",
            quantityKg: variant.unitFactor.mul(5),
            note: "Önceki parti",
          },
        },
      },
    });
  }

  const lor = variants.find((v) => v.product.slug === "lor-peyniri-1kg");
  if (lor) {
    await prisma.lot.create({
      data: {
        variantId: lor.id,
        lotNumber: `${lor.sku}-EXP`,
        expirationDate: daysFromNow(-3),
        movements: {
          create: { type: "GIRIS", quantityKg: 4, note: "Satılamadan kalan parti" },
        },
      },
    });
  }

  console.log(`Seeded lots for ${variants.length} variant(s).`);
}

async function seedM13CatalogDepth() {
  const attrs = [
    {
      key: "ambalaj",
      name: "Ambalaj",
      type: "SELECT" as const,
      options: PACKAGING_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
    },
    {
      key: "sut-tipi",
      name: "Süt tipi",
      type: "SELECT" as const,
      options: [
        { value: "inek", label: "İnek" },
        { value: "koyun", label: "Koyun" },
        { value: "keçi", label: "Keçi" },
        { value: "karisim", label: "Karışım" },
      ],
    },
    {
      key: "yore",
      name: "Yöre",
      type: "SELECT" as const,
      options: [
        { value: "trakya", label: "Trakya" },
        { value: "ege", label: "Ege" },
        { value: "karadeniz", label: "Karadeniz" },
        { value: "anadolu", label: "İç Anadolu" },
      ],
    },
    {
      key: "olgunlasma",
      name: "Olgunlaşma",
      type: "SELECT" as const,
      options: [
        { value: "taze", label: "Taze" },
        { value: "yari", label: "Yarı olgun" },
        { value: "olgun", label: "Olgun" },
      ],
    },
    {
      key: "sertifika",
      name: "Sertifika",
      type: "MULTI_SELECT" as const,
      options: [
        { value: "helal", label: "Helal" },
        { value: "organik", label: "Organik" },
        { value: "cografi", label: "Coğrafi işaret" },
        { value: "iso", label: "ISO 22000" },
      ],
    },
    {
      key: "alerjen",
      name: "Alerjen",
      type: "MULTI_SELECT" as const,
      options: [
        { value: "sut", label: "Süt" },
        { value: "laktoz", label: "Laktoz" },
      ],
    },
    {
      key: "saklama",
      name: "Saklama koşulu",
      type: "TEXT" as const,
      options: [] as { value: string; label: string }[],
    },
  ];

  for (const [i, a] of attrs.entries()) {
    const existing = await prisma.attributeDefinition.findUnique({ where: { key: a.key } });
    if (existing) {
      if (a.key === "ambalaj") {
        for (const [oi, o] of a.options.entries()) {
          await prisma.attributeOption.upsert({
            where: {
              attributeId_value: { attributeId: existing.id, value: o.value },
            },
            create: {
              attributeId: existing.id,
              value: o.value,
              label: o.label,
              sortOrder: oi,
            },
            update: { label: o.label, sortOrder: oi },
          });
        }
      }
      continue;
    }
    await prisma.attributeDefinition.create({
      data: {
        key: a.key,
        name: a.name,
        type: a.type,
        filterable: a.key === "ambalaj" ? false : a.type !== "TEXT",
        sortOrder: a.key === "ambalaj" ? -10 : i,
        options: a.options.length
          ? { create: a.options.map((o, oi) => ({ ...o, sortOrder: oi })) }
          : undefined,
      },
    });
  }

  const definitions = await prisma.attributeDefinition.findMany({
    include: { options: true },
  });
  const byKey = Object.fromEntries(definitions.map((d) => [d.key, d]));

  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    for (const def of definitions) {
      await prisma.categoryAttribute.upsert({
        where: {
          categoryId_attributeId: { categoryId: cat.id, attributeId: def.id },
        },
        create: { categoryId: cat.id, attributeId: def.id },
        update: {},
      });
    }
  }

  const products = await prisma.product.findMany({ include: { media: true } });
  const defaults: Record<string, { sut?: string; yore?: string; olgun?: string }> = {
    "tam-yagli-beyaz-peynir-17kg": { sut: "inek", yore: "trakya", olgun: "taze" },
    "kasar-peyniri-dilimli-1kg": { sut: "inek", yore: "anadolu", olgun: "olgun" },
    "kasar-peyniri-blok-3kg": { sut: "inek", yore: "anadolu", olgun: "olgun" },
    "tulum-peyniri-1kg": { sut: "koyun", yore: "ege", olgun: "yari" },
    "lor-peyniri-1kg": { sut: "inek", yore: "trakya", olgun: "taze" },
    "tereyagi-500g": { sut: "inek", yore: "karadeniz", olgun: "taze" },
    "yogurt-5kg": { sut: "inek", yore: "anadolu", olgun: "taze" },
    "gunluk-sut-1l": { sut: "inek", yore: "trakya", olgun: "taze" },
  };

  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        storageCondition: product.storageCondition ?? "0–4°C, kapalı ambalaj",
        shelfLifeDays: product.shelfLifeDays ?? 45,
        requiresColdChain: true,
        usageTips:
          product.usageTips ||
          "Soğuk zinciri bozmadan saklayın. Açıldıktan sonra 3 gün içinde tüketilmesi önerilir.",
      },
    });

    if (product.media.length === 0 && product.imageUrl) {
      await prisma.productMedia.create({
        data: {
          productId: product.id,
          url: product.imageUrl,
          kind: "IMAGE",
          alt: product.name,
          isPrimary: true,
          sortOrder: 0,
        },
      });
      // secondary gallery images from other product photos
      const others = ["/products/beyaz-peynir.jpg", "/products/kasar.jpg", "/products/yogurt.jpg"].filter(
        (u) => u !== product.imageUrl,
      );
      for (const [i, url] of others.slice(0, 2).entries()) {
        await prisma.productMedia.create({
          data: {
            productId: product.id,
            url,
            kind: "IMAGE",
            alt: `${product.name} detay ${i + 1}`,
            sortOrder: i + 1,
          },
        });
      }
    }

    const d = defaults[product.slug] ?? { sut: "inek", yore: "trakya", olgun: "taze" };

    async function setSelect(key: string, optionValue: string) {
      const def = byKey[key];
      if (!def) return;
      const opt = def.options.find((o) => o.value === optionValue);
      if (!opt) return;
      const value = await prisma.productAttributeValue.upsert({
        where: {
          productId_attributeId: { productId: product.id, attributeId: def.id },
        },
        create: { productId: product.id, attributeId: def.id },
        update: {},
      });
      await prisma.productAttributeSelectedOption.deleteMany({ where: { valueId: value.id } });
      await prisma.productAttributeSelectedOption.create({
        data: { valueId: value.id, optionId: opt.id },
      });
    }

    async function setMulti(key: string, optionValues: string[]) {
      const def = byKey[key];
      if (!def) return;
      const value = await prisma.productAttributeValue.upsert({
        where: {
          productId_attributeId: { productId: product.id, attributeId: def.id },
        },
        create: { productId: product.id, attributeId: def.id },
        update: {},
      });
      await prisma.productAttributeSelectedOption.deleteMany({ where: { valueId: value.id } });
      const opts = def.options.filter((o) => optionValues.includes(o.value));
      if (opts.length) {
        await prisma.productAttributeSelectedOption.createMany({
          data: opts.map((o) => ({ valueId: value.id, optionId: o.id })),
        });
      }
    }

    async function setText(key: string, text: string) {
      const def = byKey[key];
      if (!def) return;
      await prisma.productAttributeValue.upsert({
        where: {
          productId_attributeId: { productId: product.id, attributeId: def.id },
        },
        create: { productId: product.id, attributeId: def.id, valueText: text },
        update: { valueText: text },
      });
    }

    await setSelect("sut-tipi", d.sut!);
    await setSelect("yore", d.yore!);
    await setSelect("olgunlasma", d.olgun!);
    await setMulti("sertifika", ["helal", "iso"]);
    await setMulti("alerjen", ["sut", "laktoz"]);
    await setText("saklama", "0–4°C soğuk depo");
  }

  console.log(`M13 depth: attributes + media for ${products.length} product(s).`);
}

async function seedM14Content() {
  const { seedPosts, seedRecipes } = await import("../src/content/seed-posts");
  const { estimateReadingMins } = await import("../src/lib/content/reading");

  const productBySlug = Object.fromEntries(
    (await prisma.product.findMany({ select: { id: true, slug: true } })).map((p) => [p.slug, p.id]),
  );

  for (const post of seedPosts) {
    const existing = await prisma.contentPost.findUnique({ where: { slug: post.slug } });
    if (existing) continue;
    const created = await prisma.contentPost.create({
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverUrl: post.coverUrl,
        body: post.body,
        category: post.category,
        tags: post.tags,
        status: "PUBLISHED",
        publishedAt: new Date(),
        readingMins: estimateReadingMins(post.body),
        products: {
          create: post.relatedProductSlugs
            .map((s) => productBySlug[s])
            .filter(Boolean)
            .map((productId) => ({ productId: productId! })),
        },
      },
    });
    void created;
  }

  for (const recipe of seedRecipes) {
    const existing = await prisma.recipe.findUnique({ where: { slug: recipe.slug } });
    if (existing) continue;
    await prisma.recipe.create({
      data: {
        title: recipe.title,
        slug: recipe.slug,
        excerpt: recipe.excerpt,
        coverUrl: recipe.coverUrl,
        servings: recipe.servings,
        prepMinutes: recipe.prepMinutes,
        cookMinutes: recipe.cookMinutes,
        difficulty: recipe.difficulty,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        tips: recipe.tips,
        status: "PUBLISHED",
        publishedAt: new Date(),
        products: {
          create: recipe.relatedProductSlugs
            .map((s) => productBySlug[s])
            .filter(Boolean)
            .map((productId) => ({ productId: productId! })),
        },
      },
    });
  }

  const postCount = await prisma.contentPost.count();
  const recipeCount = await prisma.recipe.count();
  console.log(`M14 content: ${postCount} post(s), ${recipeCount} recipe(s).`);
}

async function seedDealerDemoData() {
  const admin = await prisma.user.findUnique({ where: { email: "admin@yetisgrup.test" } });
  const salesRepId = admin?.id ?? null;

  const priceLists = await prisma.priceList.findMany({ select: { id: true, slug: true } });
  const priceListBySlug = new Map(priceLists.map((p) => [p.slug, p.id]));

  await prisma.dealer.updateMany({
    where: { unvan: "Test Bayi", vergiNo: null },
    data: {
      vergiNo: "1234567890",
      vergiDairesi: "Kadıköy V.D.",
      membershipTier: "STANDART",
      creditLimitKurus: 5_000_00,
      paymentTermDays: 30,
      deliveryZoneCode: "IST-AVR",
      salesRepId,
    },
  });

  await prisma.dealer.updateMany({
    where: { unvan: "Test HORECA", vergiNo: null },
    data: {
      vergiNo: "9876543210",
      vergiDairesi: "Muratpaşa V.D.",
      membershipTier: "PREMIUM",
      creditLimitKurus: 15_000_00,
      paymentTermDays: 45,
      deliveryZoneCode: "ANT-1",
      salesRepId,
    },
  });

  const zincirExists = await prisma.dealer.findFirst({
    where: { unvan: "Kadıköy Zincir Market A.Ş." },
  });
  if (!zincirExists) {
    await prisma.dealer.create({
      data: {
        unvan: "Kadıköy Zincir Market A.Ş.",
        dealerType: "ZINCIR",
        status: "AKTIF",
        vergiNo: "5551234567",
        vergiDairesi: "Kadıköy V.D.",
        membershipTier: "VIP",
        creditLimitKurus: 50_000_00,
        paymentTermDays: 60,
        deliveryZoneCode: "IST-AND",
        priceListId: priceListBySlug.get("zincir-market") ?? null,
        salesRepId,
      },
    });
  }

  const toptanciExists = await prisma.dealer.findFirst({
    where: { unvan: "Marmara Gıda Ara Toptan Ltd. Şti." },
  });
  if (!toptanciExists) {
    await prisma.dealer.create({
      data: {
        unvan: "Marmara Gıda Ara Toptan Ltd. Şti.",
        dealerType: "ARA_TOPTANCI",
        status: "ONAYLI",
        vergiNo: "1112223334",
        vergiDairesi: "Bakırköy V.D.",
        creditLimitKurus: 25_000_00,
        paymentTermDays: 30,
        deliveryZoneCode: "IST-AVR",
        priceListId: priceListBySlug.get("standart") ?? null,
        salesRepId,
      },
    });
  }

  console.log("Seeded demo bayi/müşteri field data (vergi, kredi limiti, vade, bölge, temsilci).");
}

async function seedPaymentSettingsDemo() {
  const existing = await prisma.paymentSettings.findUnique({ where: { id: "singleton" } });
  if (existing && (existing.bankTransferEnabled || existing.iban)) {
    console.log("Skipping payment settings demo - already configured.");
    return;
  }
  const demo = {
    bankTransferEnabled: true,
    bankName: "Ziraat Bankası",
    accountHolder: "Yetiş Gıda San. Tic. A.Ş.",
    iban: "TR33 0001 0009 4123 4567 8900 01",
    note: "Açıklama kısmına sipariş numaranızı yazınız.",
  };
  await prisma.paymentSettings.upsert({
    where: { id: "singleton" },
    update: demo,
    create: { id: "singleton", ...demo },
  });
  console.log("Seeded demo ödeme ayarları (banka havalesi / EFT).");
}

async function seedShippingDemoVariety() {
  const variants = await prisma.productVariant.findMany({ include: { product: true } });

  const extraExpired = variants.find((v) => v.product.slug === "sut-1l");
  if (extraExpired) {
    const lotNumber = `${extraExpired.sku}-EXP`;
    const exists = await prisma.lot.findFirst({ where: { lotNumber } });
    if (!exists) {
      await prisma.lot.create({
        data: {
          variantId: extraExpired.id,
          lotNumber,
          expirationDate: daysFromNow(-1),
          movements: {
            create: { type: "GIRIS", quantityKg: 6, note: "Satılamadan kalan parti" },
          },
        },
      });
    }
  }

  const criticalSoon = variants.find((v) => v.product.slug === "kasar-peyniri-1kg-vakum");
  if (criticalSoon) {
    const lotNumber = `${criticalSoon.sku}-C`;
    const exists = await prisma.lot.findFirst({ where: { lotNumber } });
    if (!exists) {
      await prisma.lot.create({
        data: {
          variantId: criticalSoon.id,
          lotNumber,
          expirationDate: daysFromNow(2),
          movements: {
            create: { type: "GIRIS", quantityKg: criticalSoon.unitFactor.mul(3), note: "Kritik SKT partisi" },
          },
        },
      });
    }
  }

  console.log("Seeded sevkiyat demo çeşitliliği (ek geçmiş/kritik SKT lotları).");
}

async function seedShipmentDemoData() {
  const existing = await prisma.shipment.count();
  if (existing > 0) {
    console.log(`Skipping sevkiyat demo - ${existing} shipment(s) already exist.`);
    return;
  }

  const plan: {
    dealerUnvan: string;
    productSlug: string;
    quantityKg: number;
    status: "HAZIRLANIYOR" | "YOLDA" | "TESLIM_EDILDI";
    daysAgo: number;
    note: string;
  }[] = [
    {
      dealerUnvan: "Test Bayi",
      productSlug: "beyaz-peynir-17kg-teneke",
      quantityKg: 34,
      status: "TESLIM_EDILDI",
      daysAgo: 4,
      note: "Haftalık sabit sipariş",
    },
    {
      dealerUnvan: "Test HORECA",
      productSlug: "dilimli-kasar-250g",
      quantityKg: 2,
      status: "YOLDA",
      daysAgo: 1,
      note: "Otel mutfağı siparişi",
    },
    {
      dealerUnvan: "Kadıköy Zincir Market A.Ş.",
      productSlug: "tereyagi-1kg-kova",
      quantityKg: 10,
      status: "HAZIRLANIYOR",
      daysAgo: 0,
      note: "6 şube merkezi sevkiyat",
    },
    {
      dealerUnvan: "Marmara Gıda Ara Toptan Ltd. Şti.",
      productSlug: "yogurt-5kg-kova",
      quantityKg: 25,
      status: "TESLIM_EDILDI",
      daysAgo: 6,
      note: "Toptan sevkiyat",
    },
  ];

  for (const p of plan) {
    const dealer = await prisma.dealer.findFirst({ where: { unvan: p.dealerUnvan } });
    const variant = await prisma.productVariant.findFirst({
      where: { product: { slug: p.productSlug } },
    });
    if (!dealer || !variant) continue;

    const lot = await prisma.lot.findFirst({
      where: { variantId: variant.id, lotNumber: { endsWith: "-A" } },
    });
    if (!lot) continue;

    const createdAt = daysFromNow(-p.daysAgo);
    const shipment = await prisma.shipment.create({
      data: {
        dealerId: dealer.id,
        variantId: variant.id,
        quantityKg: p.quantityKg,
        status: p.status,
        note: p.note,
        createdAt,
        updatedAt: createdAt,
        shippedAt: p.status === "YOLDA" || p.status === "TESLIM_EDILDI" ? createdAt : null,
        deliveredAt: p.status === "TESLIM_EDILDI" ? createdAt : null,
      },
    });

    await prisma.shipmentLotAllocation.create({
      data: { shipmentId: shipment.id, lotId: lot.id, quantityKg: p.quantityKg },
    });

    await prisma.stockMovement.create({
      data: {
        lotId: lot.id,
        type: "CIKIS",
        quantityKg: p.quantityKg,
        note: `Sevkiyat #${shipment.id.slice(-6)} (demo)`,
        createdAt,
      },
    });
  }

  console.log("Seeded demo sevkiyat kayıtları (hazırlanıyor/yolda/teslim edildi).");
}

async function seedOrderDemoData() {
  const existing = await prisma.order.count();
  if (existing > 0) {
    console.log(`Skipping sipariş demo - ${existing} order(s) already exist.`);
    return;
  }

  async function resolvePrice(dealerId: string, variantId: string) {
    const dealer = await prisma.dealer.findUniqueOrThrow({
      where: { id: dealerId },
      select: { priceListId: true },
    });
    const variant = await prisma.productVariant.findUniqueOrThrow({
      where: { id: variantId },
      select: { pricePerUnitKurus: true, vatRateBasisPoints: true },
    });
    if (!dealer.priceListId) {
      return { unitPriceKurus: variant.pricePerUnitKurus, vatRateBasisPoints: variant.vatRateBasisPoints };
    }
    const override = await prisma.priceListItem.findUnique({
      where: { priceListId_variantId: { priceListId: dealer.priceListId, variantId } },
      select: { priceKurus: true },
    });
    return {
      unitPriceKurus: override?.priceKurus ?? variant.pricePerUnitKurus,
      vatRateBasisPoints: variant.vatRateBasisPoints,
    };
  }

  type Plan = {
    dealerUnvan: string;
    lines: { productSlug: string; quantity: number }[];
    history: { status: string; daysAgo: number; note: string }[];
  };

  const plans: Plan[] = [
    {
      dealerUnvan: "Test Bayi",
      lines: [
        { productSlug: "beyaz-peynir-17kg-teneke", quantity: 2 },
        { productSlug: "lor-peyniri-1kg", quantity: 5 },
      ],
      history: [
        { status: "SUBMITTED", daysAgo: 6, note: "Sipariş oluşturuldu" },
        { status: "UNDER_REVIEW", daysAgo: 5, note: "Stok ve kredi limiti kontrol ediliyor" },
        { status: "CONFIRMED", daysAgo: 5, note: "Onaylandı" },
        { status: "PREPARING", daysAgo: 4, note: "Depoda hazırlanıyor" },
        { status: "SHIPPED", daysAgo: 4, note: "Yola çıktı" },
        { status: "DELIVERED", daysAgo: 3, note: "Bayi teslim aldı" },
      ],
    },
    {
      dealerUnvan: "Test HORECA",
      lines: [{ productSlug: "dilimli-kasar-250g", quantity: 10 }],
      history: [
        { status: "SUBMITTED", daysAgo: 2, note: "Sipariş oluşturuldu" },
        { status: "UNDER_REVIEW", daysAgo: 2, note: "İnceleniyor" },
        { status: "CONFIRMED", daysAgo: 1, note: "Onaylandı" },
        { status: "PREPARING", daysAgo: 0, note: "Depoda hazırlanıyor" },
      ],
    },
    {
      dealerUnvan: "Kadıköy Zincir Market A.Ş.",
      lines: [
        { productSlug: "tereyagi-1kg-kova", quantity: 20 },
        { productSlug: "yogurt-5kg-kova", quantity: 8 },
      ],
      history: [
        { status: "SUBMITTED", daysAgo: 1, note: "6 şube merkezi sipariş" },
        { status: "UNDER_REVIEW", daysAgo: 0, note: "İnceleniyor" },
      ],
    },
    {
      dealerUnvan: "Marmara Gıda Ara Toptan Ltd. Şti.",
      lines: [{ productSlug: "sut-1l", quantity: 200 }],
      history: [
        { status: "SUBMITTED", daysAgo: 3, note: "Sipariş oluşturuldu" },
        { status: "UNDER_REVIEW", daysAgo: 2, note: "Kredi limiti aşıldığı için inceleniyor" },
        { status: "REJECTED", daysAgo: 2, note: "Kredi limiti aşımı nedeniyle reddedildi" },
      ],
    },
  ];

  for (const plan of plans) {
    const dealer = await prisma.dealer.findFirst({ where: { unvan: plan.dealerUnvan } });
    if (!dealer) continue;

    const lineData = [];
    for (const line of plan.lines) {
      const variant = await prisma.productVariant.findFirst({
        where: { product: { slug: line.productSlug } },
      });
      if (!variant) continue;
      const { unitPriceKurus, vatRateBasisPoints } = await resolvePrice(dealer.id, variant.id);
      lineData.push({
        variantId: variant.id,
        quantity: line.quantity,
        unitPriceKurus,
        vatRateBasisPoints,
        lineTotalKurus: unitPriceKurus * line.quantity,
      });
    }
    if (lineData.length === 0) continue;

    const totalKurus = lineData.reduce((sum, l) => sum + l.lineTotalKurus, 0);
    const finalEvent = plan.history[plan.history.length - 1]!;
    const createdAt = daysFromNow(-plan.history[0]!.daysAgo);

    const order = await prisma.order.create({
      data: {
        dealerId: dealer.id,
        status: finalEvent.status as never,
        totalKurus,
        createdAt,
        updatedAt: daysFromNow(-finalEvent.daysAgo),
        lines: { create: lineData },
      },
    });

    for (const h of plan.history) {
      await prisma.orderEvent.create({
        data: {
          orderId: order.id,
          status: h.status as never,
          note: h.note,
          createdAt: daysFromNow(-h.daysAgo),
        },
      });
    }

    if (finalEvent.status === "DELIVERED") {
      await prisma.ledgerEntry.create({
        data: {
          dealerId: dealer.id,
          type: "BORC",
          amountKurus: totalKurus,
          description: `Sipariş #${order.id.slice(-6)} teslim edildi`,
          createdAt: daysFromNow(-finalEvent.daysAgo),
        },
      });
    }
  }

  console.log("Seeded demo siparişler (tam yaşam döngüsü geçmişiyle).");
}

async function seedLedgerDemoData() {
  const existing = await prisma.ledgerEntry.count();
  if (existing > 0) {
    console.log(`Skipping cari demo - ${existing} ledger entry(ies) already exist.`);
    return;
  }

  const plan: Record<string, { borc: number; odeme: number; note: string }> = {
    "Test Bayi": { borc: 3_200_00, odeme: 1_200_00, note: "17 kg teneke beyaz peynir sevkiyatı" },
    "Test HORECA": { borc: 12_500_00, odeme: 4_000_00, note: "Aylık toplu sevkiyat" },
    "Kadıköy Zincir Market A.Ş.": {
      borc: 48_000_00,
      odeme: 10_000_00,
      note: "6 şube merkezi sevkiyat faturası",
    },
    "Marmara Gıda Ara Toptan Ltd. Şti.": {
      borc: 30_000_00,
      odeme: 3_000_00,
      note: "Toptan sevkiyat faturası",
    },
  };

  for (const [unvan, { borc, odeme, note }] of Object.entries(plan)) {
    const dealer = await prisma.dealer.findFirst({ where: { unvan } });
    if (!dealer) continue;

    await prisma.ledgerEntry.create({
      data: { dealerId: dealer.id, type: "BORC", amountKurus: borc, description: note },
    });
    await prisma.ledgerEntry.create({
      data: {
        dealerId: dealer.id,
        type: "ODEME",
        amountKurus: odeme,
        description: "Kısmi tahsilat (banka havalesi)",
      },
    });
  }

  console.log("Seeded demo cari (ledger) hareketleri.");
}

/** Mevcut katalogda tek cins kalan ürünlere ikinci cinsi ekler; isimleri sadeleştirir. */
async function seedExtraCins() {
  const lists = await prisma.priceList.findMany({
    where: { slug: { in: ["standart", "horeca", "zincir-market"] } },
    select: { id: true, slug: true },
  });
  const standartId = lists.find((l) => l.slug === "standart")?.id;
  const horecaId = lists.find((l) => l.slug === "horeca")?.id;
  const marketId = lists.find((l) => l.slug === "zincir-market")?.id;

  let added = 0;
  for (const p of products) {
    const product = await prisma.product.findUnique({
      where: { slug: p.slug },
      include: { variants: { select: { id: true, sku: true, sortOrder: true } } },
    });
    if (!product) continue;

    if (product.name !== p.name || product.description !== p.description) {
      await prisma.product.update({
        where: { id: product.id },
        data: { name: p.name, description: p.description },
      });
    }

    const extras = "extraCins" in p ? p.extraCins : [];
    const maxOrder = product.variants.reduce((m, v) => Math.max(m, v.sortOrder), 0);
    for (const [i, extra] of extras.entries()) {
      const existing = await prisma.productVariant.findUnique({ where: { sku: extra.sku } });
      if (existing) continue;
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: extra.sku,
          packagingType: packagingOf(extra.packSize),
          packSize: extra.packSize,
          unitFactor: extra.unitFactor,
          pricePerUnitKurus: extra.pricePerUnitKurus,
          sortOrder: maxOrder + i + 1,
        },
      });
      if (standartId) {
        await prisma.priceListItem.create({
          data: { priceListId: standartId, variantId: variant.id, priceKurus: extra.pricePerUnitKurus },
        });
      }
      if (horecaId && extra.horeca != null) {
        await prisma.priceListItem.create({
          data: { priceListId: horecaId, variantId: variant.id, priceKurus: extra.horeca },
        });
      }
      if (marketId && extra.market != null) {
        await prisma.priceListItem.create({
          data: { priceListId: marketId, variantId: variant.id, priceKurus: extra.market },
        });
      }
      const lotA = `${extra.sku}-A`;
      const lotExists = await prisma.lot.findFirst({ where: { lotNumber: lotA } });
      if (!lotExists) {
        await prisma.lot.create({
          data: {
            variantId: variant.id,
            lotNumber: lotA,
            expirationDate: daysFromNow(90),
            movements: {
              create: {
                type: "GIRIS",
                quantityKg: Number(extra.unitFactor) * 20,
                note: "Üretimden ilk giriş",
              },
            },
          },
        });
      }
      added += 1;
    }
  }
  console.log(added > 0 ? `Seeded ${added} extra cins variant(s).` : "Extra cins variants already present.");
}

async function main() {
  await seedLeads();
  await seedCatalog();
  await seedAccountTypes();
  await seedLeadActivities();
  await seedInventory();
  await seedExtraCins();
  await seedM13CatalogDepth();
  await seedM14Content();
  await seedDealerDemoData();
  await seedPaymentSettingsDemo();
  await seedShippingDemoVariety();
  await seedShipmentDemoData();
  await seedLedgerDemoData();
  await seedOrderDemoData();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
