import { prisma } from "@/infra/db/client";

export async function listCampaigns() {
  return prisma.campaign.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createCampaign(input: {
  name: string;
  note?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}) {
  const name = input.name.trim();
  if (!name) throw new Error("Kampanya adı gerekli");
  return prisma.campaign.create({
    data: {
      name,
      note: input.note?.trim() ?? "",
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
    },
  });
}

export async function updateCampaign(
  id: string,
  input: {
    name?: string;
    note?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    active?: boolean;
  },
) {
  return prisma.campaign.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.note !== undefined ? { note: input.note.trim() } : {}),
      ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
      ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    },
  });
}

export async function deleteCampaign(id: string) {
  return prisma.campaign.delete({ where: { id } });
}
