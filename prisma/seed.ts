import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type PackagingType } from "../src/generated/prisma";

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

const products = [
  {
    sku: "YG-BP17-TNK",
    name: "Beyaz Peynir 17 kg Teneke",
    slug: "beyaz-peynir-17kg-teneke",
    category: "Beyaz Peynir",
    description:
      "Geleneksel tam yağlı inek sütü beyaz peynir, 17 kg'lık teneke ambalajda. Şarküteri ve toptan satış için standart Yetiş Grup ambalajı.",
    unitLabel: "17 kg teneke",
    kgPerUnit: "17.000",
    pricePerUnitKurus: 340000,
    imageUrl: "/products/beyaz-peynir.jpg",
  },
  {
    sku: "YG-KS01-VAK",
    name: "Kaşar Peyniri 1 kg Vakum",
    slug: "kasar-peyniri-1kg-vakum",
    category: "Kaşar",
    description: "Olgunlaştırılmış tam yağlı kaşar peyniri, 1 kg vakumlu paket.",
    unitLabel: "1 kg vakum",
    kgPerUnit: "1.000",
    pricePerUnitKurus: 38000,
    imageUrl: "/products/kasar.jpg",
  },
  {
    sku: "YG-KS025-DLM",
    name: "Dilimli Kaşar 250 g Paket",
    slug: "dilimli-kasar-250g",
    category: "Kaşar",
    description: "Hazır dilimli kaşar peyniri, 250 g'lık raf ve HORECA paketi.",
    unitLabel: "250 g paket",
    kgPerUnit: "0.250",
    pricePerUnitKurus: 11000,
    imageUrl: "/products/kasar.jpg",
  },
  {
    sku: "YG-TL08-VAK",
    name: "Tulum Peyniri 800 g Vakum",
    slug: "tulum-peyniri-800g",
    category: "Tulum",
    description: "Geleneksel tulum peyniri, 800 g vakumlu paket.",
    unitLabel: "800 g vakum",
    kgPerUnit: "0.800",
    pricePerUnitKurus: 32000,
    imageUrl: "/products/tulum.jpg",
  },
  {
    sku: "YG-LR01-STD",
    name: "Lor Peyniri 1 kg",
    slug: "lor-peyniri-1kg",
    category: "Lor",
    description: "Taze lor peyniri, 1 kg'lık ambalaj.",
    unitLabel: "1 kg",
    kgPerUnit: "1.000",
    pricePerUnitKurus: 18000,
    imageUrl: "/products/lor.jpg",
  },
  {
    sku: "YG-TY01-KOV",
    name: "Tereyağı 1 kg Kova",
    slug: "tereyagi-1kg-kova",
    category: "Tereyağı",
    description: "Sade tereyağı, 1 kg'lık kova ambalaj.",
    unitLabel: "1 kg kova",
    kgPerUnit: "1.000",
    pricePerUnitKurus: 45000,
    imageUrl: "/products/tereyagi.jpg",
  },
  {
    sku: "YG-YG05-KOV",
    name: "Yoğurt 5 kg Kova",
    slug: "yogurt-5kg-kova",
    category: "Yoğurt",
    description: "Tam yağlı süzme yoğurt, 5 kg'lık toptan kova.",
    unitLabel: "5 kg kova",
    kgPerUnit: "5.000",
    pricePerUnitKurus: 25000,
    imageUrl: "/products/yogurt.jpg",
  },
  {
    sku: "YG-ST01-LTR",
    name: "Süt 1 L",
    slug: "sut-1l",
    category: "Süt",
    description: "Pastörize tam yağlı süt, 1 litrelik ambalaj.",
    unitLabel: "1 L",
    kgPerUnit: "1.000",
    pricePerUnitKurus: 3500,
    imageUrl: "/products/sut.jpg",
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

  function packagingOf(unitLabel: string): PackagingType {
    const u = unitLabel.toLocaleLowerCase("tr-TR");
    if (u.includes("teneke")) return "TENEKE";
    if (u.includes("vakum")) return "VAKUM";
    if (u.includes("kutu")) return "KUTU";
    return "KOLI";
  }

  const createdVariants: { slug: string; variantId: string; price: number }[] = [];

  for (const p of products) {
    const categoryId = categoryByName.get(p.category);
    if (!categoryId) throw new Error(`Missing category ${p.category}`);
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
          create: {
            sku: p.sku,
            packagingType: packagingOf(p.unitLabel),
            packSize: p.unitLabel,
            unitFactor: p.kgPerUnit,
            pricePerUnitKurus: p.pricePerUnitKurus,
          },
        },
      },
      include: { variants: true },
    });
    createdVariants.push({
      slug: p.slug,
      variantId: product.variants[0]!.id,
      price: p.pricePerUnitKurus,
    });
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
    const overrides = priceListOverrides[row.slug];
    await prisma.priceListItem.create({
      data: { priceListId: standart.id, variantId: row.variantId, priceKurus: row.price },
    });
    if (overrides) {
      await prisma.priceListItem.create({
        data: { priceListId: horeca.id, variantId: row.variantId, priceKurus: overrides.horeca },
      });
      await prisma.priceListItem.create({
        data: { priceListId: market.id, variantId: row.variantId, priceKurus: overrides.market },
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
    if (existing) continue;
    await prisma.attributeDefinition.create({
      data: {
        key: a.key,
        name: a.name,
        type: a.type,
        filterable: a.type !== "TEXT",
        sortOrder: i,
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

async function main() {
  await seedLeads();
  await seedCatalog();
  await seedAccountTypes();
  await seedLeadActivities();
  await seedInventory();
  await seedM13CatalogDepth();
  await seedM14Content();
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
