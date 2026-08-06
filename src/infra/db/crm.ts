import { prisma } from "@/infra/db/client";
import {
  LEAD_SOURCE_LABELS,
  computeSourceConversion,
  type ContactLeadInput,
} from "@/domain/leads";

export async function createInboundLead(
  input: ContactLeadInput & { customFieldPairs?: { fieldId: string; valueText: string }[] },
) {
  const email = input.email?.trim() ? input.email.trim() : null;
  const note = input.note?.trim() ? input.note.trim() : null;

  return prisma.$transaction(async (tx) => {
    const lead = await tx.lead.create({
      data: {
        companyName: input.companyName.trim(),
        contactName: input.contactName.trim(),
        phone: input.phone.trim(),
        email,
        city: input.city.trim(),
        channel: input.channel,
        source: input.source,
        note,
        interestedCategoryId: input.interestedCategoryId || null,
        kvkkConsentAt: new Date(),
        stage: "YENI",
      },
    });

    await tx.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "FORM",
        note: `Form kaydı · ${LEAD_SOURCE_LABELS[input.source] ?? input.source}`,
      },
    });

    if (input.customFieldPairs?.length) {
      await tx.leadFieldValue.createMany({
        data: input.customFieldPairs.map((pair) => ({
          leadId: lead.id,
          fieldId: pair.fieldId,
          valueText: pair.valueText,
        })),
      });
    }

    return lead;
  });
}

export async function getLeadConversionBySource() {
  const leads = await prisma.lead.findMany({
    select: { source: true, stage: true, createdAt: true, updatedAt: true },
  });
  return computeSourceConversion(leads, LEAD_SOURCE_LABELS);
}

export async function createLeadTask(input: {
  leadId: string;
  title: string;
  dueAt?: Date | null;
  assigneeId?: string | null;
}) {
  const task = await prisma.leadTask.create({
    data: {
      leadId: input.leadId,
      title: input.title.trim(),
      dueAt: input.dueAt ?? null,
      assigneeId: input.assigneeId ?? null,
    },
  });
  await prisma.leadActivity.create({
    data: {
      leadId: input.leadId,
      type: "GOREV",
      note: `Görev: ${task.title}${task.dueAt ? ` · vadeli ${task.dueAt.toISOString().slice(0, 10)}` : ""}`,
    },
  });
  return task;
}

export async function completeLeadTask(taskId: string) {
  const task = await prisma.leadTask.update({
    where: { id: taskId },
    data: { doneAt: new Date() },
  });
  await prisma.leadActivity.create({
    data: {
      leadId: task.leadId,
      type: "HATIRLATMA",
      note: `Görev tamamlandı: ${task.title}`,
    },
  });
  return task;
}
