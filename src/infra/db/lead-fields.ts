import { prisma } from "@/infra/db/client";
import { slugifyTr } from "@/domain/catalog/slug";
import type { LeadFieldType } from "@/generated/prisma";

export async function listActiveFormFields() {
  return prisma.leadFieldDefinition.findMany({
    where: { active: true, formVisible: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });
}

export async function listLeadFieldDefinitions() {
  return prisma.leadFieldDefinition.findMany({
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });
}

export async function createLeadFieldDefinition(input: {
  label: string;
  type: LeadFieldType;
  options?: string[];
  required?: boolean;
  formVisible?: boolean;
}) {
  const key = slugifyTr(input.label).replace(/-/g, "_") || `alan_${Date.now()}`;
  return prisma.leadFieldDefinition.create({
    data: {
      key,
      label: input.label.trim(),
      type: input.type,
      options: input.options ?? [],
      required: input.required ?? false,
      formVisible: input.formVisible ?? true,
      updatedAt: new Date(),
    },
  });
}

export async function setLeadFieldActive(id: string, active: boolean) {
  return prisma.leadFieldDefinition.update({
    where: { id },
    data: { active, updatedAt: new Date() },
  });
}

export async function ensureDefaultLeadFields() {
  const count = await prisma.leadFieldDefinition.count();
  if (count > 0) return;
  await prisma.leadFieldDefinition.createMany({
    data: [
      {
        key: "vergi_no",
        label: "Vergi no",
        type: "TEXT",
        options: [],
        required: false,
        formVisible: true,
        sortOrder: 1,
        updatedAt: new Date(),
      },
      {
        key: "tahmini_sube",
        label: "Tahmini şube / nokta sayısı",
        type: "NUMBER",
        options: [],
        required: false,
        formVisible: true,
        sortOrder: 2,
        updatedAt: new Date(),
      },
      {
        key: "ilgilenen_urun",
        label: "İlgilendiği ürün grubu",
        type: "SELECT",
        options: ["Peynir", "Yoğurt / süt", "Tereyağı", "Karışık"],
        required: false,
        formVisible: true,
        sortOrder: 3,
        updatedAt: new Date(),
      },
    ],
  });
}
