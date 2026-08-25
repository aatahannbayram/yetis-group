import { prisma } from "@/infra/db/client";
import {
  getProductsForDealerCatalog,
  getProductsForDealerOrderList,
  getProductForDealerCatalogDetail,
} from "@/infra/db/products";
import { getShippableStockByVariant } from "@/infra/db/inventory";
import { money, type Money } from "@/domain/money";
import type { Kg } from "@/domain/weight";
import type { AttributeType } from "@/generated/prisma";

export type DealerCatalogVariant = {
  id: string;
  sku: string;
  packagingType: string;
  packSize: string | null;
  unitFactor: string;
  moq: number;
  vatRateBasisPoints: number;
  priceKurus: number;
  unitPrice: Money;
  stockKg: number;
};

export type DealerCatalogAttributeValue = {
  valueText: string | null;
  valueNumber: string | null;
  valueBoolean: boolean | null;
  selectedOptions: { option: { label: string } }[];
  attribute: { key: string; name: string; type: AttributeType; unit: string | null };
};

export type DealerCatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  categoryName: string;
  categorySlug: string;
  requiresColdChain: boolean;
  storageCondition: string | null;
  shelfLifeDays: number | null;
  usageTips: string;
  producer: { name: string; region: string | null; story: string };
  media: { id: string; url: string; kind: "IMAGE" | "VIDEO" }[];
  certificates: string[];
  attributeValues: DealerCatalogAttributeValue[];
  variants: DealerCatalogVariant[];
};

/** Sipariş listesi: detay alanları yok, küçük payload. */
export type DealerOrderListProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  categoryName: string;
  categorySlug: string;
  variants: DealerCatalogVariant[];
};

function mapVariantRows(
  product: {
    variants: Array<{
      id: string;
      sku: string;
      packagingType: string;
      packSize: string | null;
      unitFactor: { toString(): string };
      moq: number | null;
      vatRateBasisPoints: number;
      pricePerUnitKurus: number;
    }>;
  },
  overrides: Map<string, number>,
  stockByVariant: Map<string, Kg>,
): DealerCatalogVariant[] {
  return product.variants.map((v) => {
    const priceKurus = overrides.get(v.id) ?? v.pricePerUnitKurus;
    const stock = stockByVariant.get(v.id);
    return {
      id: v.id,
      sku: v.sku,
      packagingType: v.packagingType,
      packSize: v.packSize,
      unitFactor: v.unitFactor.toString(),
      moq: v.moq ?? 1,
      vatRateBasisPoints: v.vatRateBasisPoints,
      priceKurus,
      unitPrice: money(priceKurus),
      stockKg: stock ? stock.toNumber() : 0,
    };
  });
}

function mapFullProduct(
  product: Awaited<ReturnType<typeof getProductsForDealerCatalog>>[number],
  overrides: Map<string, number>,
  stockByVariant: Map<string, Kg>,
): DealerCatalogProduct {
  const variants = mapVariantRows(product, overrides, stockByVariant);
  const certificates =
    product.attributeValues
      .find((v) => v.attribute.key === "sertifika")
      ?.selectedOptions.map((s) => s.option.label) ?? [];
  const attributeValues: DealerCatalogAttributeValue[] = product.attributeValues
    .filter((v) => v.attribute.key !== "sertifika")
    .map((v) => ({
      valueText: v.valueText,
      valueNumber: v.valueNumber ? v.valueNumber.toString() : null,
      valueBoolean: v.valueBoolean,
      selectedOptions: v.selectedOptions.map((s) => ({ option: { label: s.option.label } })),
      attribute: {
        key: v.attribute.key,
        name: v.attribute.name,
        type: v.attribute.type,
        unit: v.attribute.unit,
      },
    }));
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    imageUrl: product.imageUrl,
    categoryName: product.primaryCategory.name,
    categorySlug: product.primaryCategory.slug,
    requiresColdChain: product.requiresColdChain,
    storageCondition: product.storageCondition,
    shelfLifeDays: product.shelfLifeDays,
    usageTips: product.usageTips,
    producer: {
      name: product.producer.name,
      region: product.producer.region,
      story: product.producer.story,
    },
    media: product.media.map((m) => ({ id: m.id, url: m.url, kind: m.kind })),
    certificates,
    attributeValues,
    variants,
  };
}

function mapListProduct(
  product: Awaited<ReturnType<typeof getProductsForDealerOrderList>>[number],
  overrides: Map<string, number>,
  stockByVariant: Map<string, Kg>,
): DealerOrderListProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl: product.imageUrl,
    categoryName: product.primaryCategory.name,
    categorySlug: product.primaryCategory.slug,
    variants: mapVariantRows(product, overrides, stockByVariant),
  };
}

async function priceOverridesForDealer(dealerId: string) {
  const dealer = await prisma.dealer.findUnique({
    where: { id: dealerId },
    select: { priceListId: true },
  });
  if (!dealer?.priceListId) return new Map<string, number>();
  const items = await prisma.priceListItem.findMany({
    where: { priceListId: dealer.priceListId },
    select: { variantId: true, priceKurus: true },
  });
  return new Map(items.map((i) => [i.variantId, i.priceKurus]));
}

/** Active catalog with every variant, dealer list price, and shippable stock kg. */
export async function getDealerCatalog(dealerId: string): Promise<DealerCatalogProduct[]> {
  const [products, overrides, stockByVariant] = await Promise.all([
    getProductsForDealerCatalog(),
    priceOverridesForDealer(dealerId),
    getShippableStockByVariant(),
  ]);

  return products
    .map((product) => mapFullProduct(product, overrides, stockByVariant))
    .filter((p) => p.variants.length > 0);
}

/** Sipariş satır listesi: hafif select, aynı fiyat/stok birleştirmesi. */
export async function getDealerOrderList(dealerId: string): Promise<DealerOrderListProduct[]> {
  const [products, overrides, stockByVariant] = await Promise.all([
    getProductsForDealerOrderList(),
    priceOverridesForDealer(dealerId),
    getShippableStockByVariant(),
  ]);

  return products
    .map((product) => mapListProduct(product, overrides, stockByVariant))
    .filter((p) => p.variants.length > 0);
}

/** Tek ürün detayı (sheet): tam nitelik/medya yükü. */
export async function getDealerCatalogProductById(
  dealerId: string,
  productId: string,
): Promise<DealerCatalogProduct | null> {
  const [product, overrides, stockByVariant] = await Promise.all([
    getProductForDealerCatalogDetail(productId),
    priceOverridesForDealer(dealerId),
    getShippableStockByVariant(),
  ]);
  if (!product) return null;
  const mapped = mapFullProduct(product, overrides, stockByVariant);
  return mapped.variants.length > 0 ? mapped : null;
}
