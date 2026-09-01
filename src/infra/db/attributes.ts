import { prisma } from "@/infra/db/client";
import type { AttributeType } from "@/generated/prisma";
import { slugifyTr } from "@/domain/catalog/slug";
import {
  PACKAGING_ATTRIBUTE_KEY,
  PACKAGING_OPTIONS,
  isProductFacingAttribute,
  type PackagingOption,
} from "@/lib/format/packaging";
import { formatAttributeDisplay } from "@/lib/format/attribute-value";

export { isProductFacingAttribute, formatAttributeDisplay };

export async function listAttributeDefinitions() {
  return prisma.attributeDefinition.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { options: { orderBy: { sortOrder: "asc" } } },
  });
}

/**
 * Ensures AttributeDefinition `ambalaj` exists, then returns its options.
 * Falls back to PACKAGING_OPTIONS if the row cannot be created.
 */
export async function listPackagingOptions(): Promise<PackagingOption[]> {
  await ensurePackagingAttribute();
  const def = await prisma.attributeDefinition.findUnique({
    where: { key: PACKAGING_ATTRIBUTE_KEY },
    include: { options: { orderBy: { sortOrder: "asc" } } },
  });
  if (!def?.options.length) return [...PACKAGING_OPTIONS];
  return def.options.map((o) => ({ value: o.value, label: o.label }));
}

export async function assertValidPackagingType(value: string): Promise<string> {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Ambalaj türü gerekli");
  const options = await listPackagingOptions();
  if (!options.some((o) => o.value === trimmed)) {
    throw new Error(`Geçersiz ambalaj türü: ${trimmed}`);
  }
  return trimmed;
}

export async function ensurePackagingAttribute() {
  const existing = await prisma.attributeDefinition.findUnique({
    where: { key: PACKAGING_ATTRIBUTE_KEY },
    include: { options: true },
  });
  if (existing) {
    if (existing.options.length === 0) {
      await prisma.attributeOption.createMany({
        data: PACKAGING_OPTIONS.map((o, i) => ({
          attributeId: existing.id,
          value: o.value,
          label: o.label,
          sortOrder: i,
        })),
      });
    }
    return existing.id;
  }

  const created = await prisma.attributeDefinition.create({
    data: {
      key: PACKAGING_ATTRIBUTE_KEY,
      name: "Ambalaj",
      type: "SELECT",
      filterable: false,
      sortOrder: -10,
      options: {
        create: PACKAGING_OPTIONS.map((o, i) => ({
          value: o.value,
          label: o.label,
          sortOrder: i,
        })),
      },
    },
  });
  return created.id;
}

export async function createAttributeDefinition(input: {
  name: string;
  key?: string;
  type: AttributeType;
  unit?: string | null;
  filterable?: boolean;
  options?: { value: string; label: string }[];
}) {
  const key = input.key?.trim() || slugifyTr(input.name);
  if (key === PACKAGING_ATTRIBUTE_KEY) {
    throw new Error("Ambalaj sistemi niteliği zaten tanımlı; seçenekleri düzenleyin");
  }
  return prisma.attributeDefinition.create({
    data: {
      name: input.name.trim(),
      key,
      type: input.type,
      unit: input.unit ?? null,
      filterable: input.filterable ?? true,
      options: input.options?.length
        ? {
            create: input.options.map((o, i) => ({
              value: o.value,
              label: o.label,
              sortOrder: i,
            })),
          }
        : undefined,
    },
    include: { options: true },
  });
}

export async function updateAttributeDefinition(input: {
  id: string;
  name: string;
  type: AttributeType;
  options?: { value: string; label: string }[];
}) {
  const name = input.name.trim();
  if (!name) throw new Error("Ad gerekli");

  return prisma.$transaction(async (tx) => {
    const current = await tx.attributeDefinition.findUniqueOrThrow({
      where: { id: input.id },
      include: { options: true },
    });

    if (current.key === PACKAGING_ATTRIBUTE_KEY && input.type !== "SELECT") {
      throw new Error("Ambalaj niteliği yalnızca tek seçenek (SELECT) olabilir");
    }
    if (current.key === PACKAGING_ATTRIBUTE_KEY && input.type !== current.type) {
      throw new Error("Ambalaj niteliğinin tipi değiştirilemez");
    }

    await tx.attributeDefinition.update({
      where: { id: input.id },
      data: { name, type: input.type },
    });

    const isSelect = input.type === "SELECT" || input.type === "MULTI_SELECT";
    if (!isSelect) {
      await tx.attributeOption.deleteMany({ where: { attributeId: input.id } });
    } else {
      const options = input.options ?? [];
      const byLabel = new Map(
        current.options.map((o) => [o.label.toLocaleLowerCase("tr-TR"), o]),
      );
      const resolved = options.map((o) => {
        const match = byLabel.get(o.label.toLocaleLowerCase("tr-TR"));
        return {
          value: match?.value ?? o.value,
          label: o.label,
        };
      });
      const keepValues = resolved.map((o) => o.value);
      await tx.attributeOption.deleteMany({
        where: {
          attributeId: input.id,
          ...(keepValues.length ? { value: { notIn: keepValues } } : {}),
        },
      });
      for (let i = 0; i < resolved.length; i++) {
        const o = resolved[i]!;
        await tx.attributeOption.upsert({
          where: {
            attributeId_value: { attributeId: input.id, value: o.value },
          },
          create: {
            attributeId: input.id,
            value: o.value,
            label: o.label,
            sortOrder: i,
          },
          update: { label: o.label, sortOrder: i },
        });
      }
    }

    return tx.attributeDefinition.findUniqueOrThrow({
      where: { id: input.id },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    });
  });
}

export async function deleteAttributeDefinition(id: string, opts?: { force?: boolean }) {
  const attr = await prisma.attributeDefinition.findUnique({ where: { id } });
  if (!attr) throw new Error("Nitelik bulunamadı");
  if (attr.key === PACKAGING_ATTRIBUTE_KEY) {
    throw new Error("Ambalaj sistemi niteliği silinemez; seçenekleri düzenleyebilirsiniz");
  }

  if (!opts?.force) {
    const [valueCount, categoryLinkCount] = await Promise.all([
      prisma.productAttributeValue.count({ where: { attributeId: id } }),
      prisma.categoryAttribute.count({ where: { attributeId: id } }),
    ]);
    const usageCount = valueCount + categoryLinkCount;
    if (usageCount > 0) {
      throw new Error(
        `Bu nitelik ${usageCount} yerde kullanılıyor (ürün değeri veya kategori bağlantısı). Silerseniz bu veriler de silinir.`,
      );
    }
  }

  return prisma.attributeDefinition.delete({ where: { id } });
}

export async function getProductAttributeValues(productId: string) {
  return prisma.productAttributeValue.findMany({
    where: { productId },
    include: {
      attribute: true,
      selectedOptions: { include: { option: true } },
    },
    orderBy: { attribute: { sortOrder: "asc" } },
  });
}

export async function upsertProductAttributeValue(input: {
  productId: string;
  attributeId: string;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
  optionIds?: string[];
}) {
  const attr = await prisma.attributeDefinition.findUnique({
    where: { id: input.attributeId },
  });
  if (attr?.key === PACKAGING_ATTRIBUTE_KEY) {
    throw new Error("Ambalaj ürün niteliği olarak atanmaz; cins formundan seçin");
  }

  const existing = await prisma.productAttributeValue.findUnique({
    where: {
      productId_attributeId: {
        productId: input.productId,
        attributeId: input.attributeId,
      },
    },
  });

  const value = existing
    ? await prisma.productAttributeValue.update({
        where: { id: existing.id },
        data: {
          valueText: input.valueText ?? null,
          valueNumber: input.valueNumber ?? null,
          valueBoolean: input.valueBoolean ?? null,
        },
      })
    : await prisma.productAttributeValue.create({
        data: {
          productId: input.productId,
          attributeId: input.attributeId,
          valueText: input.valueText ?? null,
          valueNumber: input.valueNumber ?? null,
          valueBoolean: input.valueBoolean ?? null,
        },
      });

  if (input.optionIds) {
    await prisma.productAttributeSelectedOption.deleteMany({ where: { valueId: value.id } });
    if (input.optionIds.length) {
      await prisma.productAttributeSelectedOption.createMany({
        data: input.optionIds.map((optionId) => ({ valueId: value.id, optionId })),
      });
    }
  }

  return value;
}

