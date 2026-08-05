import { prisma } from "@/infra/db/client";
import { LEAD_STAGES, LEAD_STAGE_LABELS, LEAD_CHANNEL_LABELS } from "@/domain/leads";

export { LEAD_STAGES, LEAD_STAGE_LABELS, LEAD_CHANNEL_LABELS };

export async function getLeads() {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { activities: { orderBy: { createdAt: "desc" } } },
  });
}

export async function addLeadActivity(
  leadId: string,
  type: "ARAMA" | "NOT" | "TEKLIF" | "TESLIMAT" | "DURUM_DEGISIKLIGI",
  note: string,
) {
  return prisma.leadActivity.create({ data: { leadId, type, note } });
}

export async function getLeadDashboardData() {
  const leads = await getLeads();

  const totalLeads = leads.length;
  const openLeads = leads.filter(
    (lead) => lead.stage !== "KAZANILDI" && lead.stage !== "KAYBEDILDI",
  );
  const wonLeads = leads.filter((lead) => lead.stage === "KAZANILDI");
  const openVolumeKg = openLeads.reduce(
    (sum, lead) => sum + Number(lead.estimatedMonthlyKg ?? 0),
    0,
  );

  const stageCounts = LEAD_STAGES.map((stage) => ({
    stage,
    label: LEAD_STAGE_LABELS[stage],
    count: leads.filter((lead) => lead.stage === stage).length,
  }));

  const channelCounts = Object.entries(LEAD_CHANNEL_LABELS).map(([channel, label]) => ({
    channel,
    label,
    count: leads.filter((lead) => lead.channel === channel).length,
  }));

  return {
    totalLeads,
    openLeadsCount: openLeads.length,
    wonLeadsCount: wonLeads.length,
    openVolumeKg,
    stageCounts,
    channelCounts,
  };
}
