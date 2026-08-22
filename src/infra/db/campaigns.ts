import { prisma } from "@/infra/db/client";
import { isPublishedAnnouncement, safeSiteHref, type SiteAnnouncement } from "@/domain/campaigns/live";
import type { CampaignKind } from "@/generated/prisma";

export type { SiteAnnouncement };

export async function listCampaigns() {
  return prisma.campaign.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
}

export async function listPublishedAnnouncements(now: Date = new Date()): Promise<SiteAnnouncement[]> {
  const rows = await prisma.campaign.findMany({
    where: { active: true, kind: "DUYURU" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 8,
  });
  return rows
    .filter((row) =>
      isPublishedAnnouncement(
        {
          active: row.active,
          kind: row.kind,
          startDate: row.startDate,
          endDate: row.endDate,
        },
        now,
      ),
    )
    .map((row) => ({
      id: row.id,
      name: row.name,
      note: row.note,
      href: safeSiteHref(row.href),
      ctaLabel: row.ctaLabel?.trim() || "İncele",
      imageUrl: row.imageUrl,
    }));
}

export async function createCampaign(input: {
  name: string;
  note?: string;
  kind?: CampaignKind;
  href?: string | null;
  ctaLabel?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  startDate?: Date | null;
  endDate?: Date | null;
}) {
  const name = input.name.trim();
  if (!name) throw new Error("Kampanya adı gerekli");
  return prisma.campaign.create({
    data: {
      name,
      note: input.note?.trim() ?? "",
      kind: input.kind ?? "DUYURU",
      href: input.href?.trim() || null,
      ctaLabel: input.ctaLabel?.trim() || null,
      imageUrl: input.imageUrl?.trim() || null,
      sortOrder: input.sortOrder ?? 0,
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
    kind?: CampaignKind;
    href?: string | null;
    ctaLabel?: string | null;
    imageUrl?: string | null;
    sortOrder?: number;
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
      ...(input.kind !== undefined ? { kind: input.kind } : {}),
      ...(input.href !== undefined ? { href: input.href?.trim() || null } : {}),
      ...(input.ctaLabel !== undefined ? { ctaLabel: input.ctaLabel?.trim() || null } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl?.trim() || null } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
      ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    },
  });
}

export async function deleteCampaign(id: string) {
  return prisma.campaign.delete({ where: { id } });
}
