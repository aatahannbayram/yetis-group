import { prisma } from "@/infra/db/client";
import type { AttributeType } from "@/generated/prisma";
import { slugifyTr } from "@/domain/catalog/slug";

export async function listAttributeDefinitions() {
  return prisma.attributeDefinition.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { options: { orderBy: { sortOrder: "asc" } } },
  });
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
    await tx.attributeDefinition.update({
      where: { id: input.id },
      data: { name, type: input.type },
    });

    const isSelect = input.type === "SELECT" || input.type === "MULTI_SELECT";
    if (!isSelect) {
      await tx.attributeOption.deleteMany({ where: { attributeId: input.id } });
    } else {
      const options = input.options ?? [];
      const keepValues = options.map((o) => o.value);
      await tx.attributeOption.deleteMany({
        where: {
          attributeId: input.id,
          ...(keepValues.length ? { value: { notIn: keepValues } } : {}),
        },
      });
      for (let i = 0; i < options.length; i++) {
        const o = options[i]!;
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

export async function deleteAttributeDefinition(id: string) {
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

export function formatAttributeDisplay(value: {
  valueText: string | null;
  valueNumber: { toString(): string } | null;
  valueBoolean: boolean | null;
  selectedOptions: { option: { label: string } }[];
  attribute: { type: AttributeType; unit: string | null };
}): string {
  const { attribute } = value;
  if (attribute.type === "BOOLEAN") {
    return value.valueBoolean ? "Evet" : "Hayır";
  }
  if (attribute.type === "NUMBER") {
    const n = value.valueNumber?.toString() ?? "";
    return attribute.unit ? `${n} ${attribute.unit}` : n;
  }
  if (attribute.type === "SELECT" || attribute.type === "MULTI_SELECT") {
    return value.selectedOptions.map((s) => s.option.label).join(", ");
  }
  return value.valueText ?? "";
}
