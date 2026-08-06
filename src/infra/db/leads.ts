import { prisma } from "@/infra/db/client";
import {
  LEAD_STAGES,
  LEAD_STAGE_LABELS,
  LEAD_CHANNEL_LABELS,
  LEAD_SOURCE_LABELS,
  assertLeadTransition,
  planPromoteLeadToDealer,
  computeSourceConversion,
  type LeadStage,
} from "@/domain/leads";

export { LEAD_STAGES, LEAD_STAGE_LABELS, LEAD_CHANNEL_LABELS };

export async function getLeads() {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      activities: { orderBy: { createdAt: "desc" } },
      convertedDealer: true,
      assignee: { select: { id: true, name: true, email: true } },
      interestedCategory: { select: { id: true, name: true, slug: true } },
      fieldValues: { include: { field: true } },
      tasks: { orderBy: [{ doneAt: "asc" }, { dueAt: "asc" }] },
    },
  });
}

export async function getOpenLeadsCount() {
  return prisma.lead.count({ where: { stage: { notIn: ["KAZANILDI", "KAYBEDILDI"] } } });
}

export async function addLeadActivity(
  leadId: string,
  type:
    | "ARAMA"
    | "NOT"
    | "TEKLIF"
    | "TESLIMAT"
    | "DURUM_DEGISIKLIGI"
    | "EMAIL"
    | "WHATSAPP"
    | "FORM"
    | "GOREV"
    | "HATIRLATMA",
  note: string,
) {
  return prisma.leadActivity.create({ data: { leadId, type, note } });
}

export async function transitionLeadStage(input: {
  leadId: string;
  toStage: LeadStage;
  lostReason?: string | null;
  actorId?: string | null;
  reason?: string | null;
}) {
  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: input.leadId } });
  const from = lead.stage as LeadStage;
  const guard = assertLeadTransition({
    from,
    to: input.toStage,
    lostReason: input.lostReason,
  });
  if (!guard.ok) throw guard.error;

  if (from === input.toStage) {
    return lead;
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.lead.update({
      where: { id: input.leadId },
      data: {
        stage: input.toStage,
        lostReason: input.toStage === "KAYBEDILDI" ? guard.lostReason : lead.lostReason,
      },
    });

    await tx.leadStageAudit.create({
      data: {
        leadId: input.leadId,
        fromStage: from,
        toStage: input.toStage,
        reason: input.reason ?? guard.lostReason ?? null,
        actorId: input.actorId ?? null,
      },
    });

    await tx.leadActivity.create({
      data: {
        leadId: input.leadId,
        type: "DURUM_DEGISIKLIGI",
        note: `${LEAD_STAGE_LABELS[from]} → ${LEAD_STAGE_LABELS[input.toStage]}${
          input.reason ? `: ${input.reason}` : ""
        }`,
      },
    });

    if (guard.promoteToDealer) {
      await promoteLeadToDealerTx(tx, input.leadId, input.actorId ?? null);
    }

    return updated;
  });
}

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function promoteLeadToDealerTx(tx: Tx, leadId: string, actorId: string | null) {
  const lead = await tx.lead.findUniqueOrThrow({ where: { id: leadId } });
  const plan = planPromoteLeadToDealer({
    leadId: lead.id,
    companyName: lead.companyName,
    channel: lead.channel,
    alreadyConvertedDealerId: lead.convertedDealerId,
    stage: lead.stage as LeadStage,
  });

  if (plan.action === "noop" || plan.action === "activate") {
    if (plan.action === "activate") {
      await tx.dealer.update({
        where: { id: plan.dealerId },
        data: { status: "AKTIF" },
      });
    }
    return plan.dealerId;
  }

  const dealer = await tx.dealer.create({
    data: {
      unvan: plan.unvan,
      dealerType: plan.dealerType,
      status: plan.status,
    },
  });

  await tx.lead.update({
    where: { id: leadId },
    data: { convertedDealerId: dealer.id },
  });

  if (actorId) {
    await tx.leadStageAudit.create({
      data: {
        leadId,
        fromStage: "KAZANILDI",
        toStage: "KAZANILDI",
        reason: `Dealer terfi: ${dealer.id}`,
        actorId,
      },
    });
  }

  return dealer.id;
}

export async function promoteLeadToDealer(leadId: string, actorId?: string | null) {
  return prisma.$transaction((tx) => promoteLeadToDealerTx(tx, leadId, actorId ?? null));
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

  const sourceConversion = computeSourceConversion(
    leads.map((l) => ({ source: l.source, stage: l.stage })),
    LEAD_SOURCE_LABELS,
  );

  return {
    totalLeads,
    openLeadsCount: openLeads.length,
    wonLeadsCount: wonLeads.length,
    openVolumeKg,
    stageCounts,
    channelCounts,
    sourceConversion,
  };
}
