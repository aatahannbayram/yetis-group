import { randomUUID } from "node:crypto";
import { prisma } from "@/infra/db/client";
import {
  renderWhatsAppTemplate,
  type WhatsAppTemplateName,
  type WhatsAppTemplateVariables,
} from "@/domain/whatsapp/templates";
import { sendMockWhatsAppMessage } from "@/infra/whatsapp/mock-provider";

export async function listDealerPhoneOptions() {
  return prisma.dealer.findMany({
    orderBy: { unvan: "asc" },
    select: { id: true, unvan: true, phone: true },
  });
}

export async function listOutboxMessages(limit = 50) {
  return prisma.whatsAppOutboxMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { dealer: { select: { id: true, unvan: true } } },
  });
}

/**
 * Queues an outbox row then sends via the mock provider. Idempotency key is
 * generated per call; attempts/status/providerResponse/cost are always set
 * (CLAUDE.md outbox contract).
 */
export async function queueAndSendWhatsAppMessage<T extends WhatsAppTemplateName>(input: {
  dealerId?: string | null;
  toPhone: string;
  templateName: T;
  variables: WhatsAppTemplateVariables[T];
}) {
  const body = renderWhatsAppTemplate(input.templateName, input.variables);

  const message = await prisma.whatsAppOutboxMessage.create({
    data: {
      dealerId: input.dealerId ?? null,
      toPhone: input.toPhone,
      templateName: input.templateName,
      variables: input.variables,
      status: "QUEUED",
      attempts: 0,
      idempotencyKey: randomUUID(),
    },
  });

  const result = await sendMockWhatsAppMessage({ toPhone: input.toPhone, body });

  return prisma.whatsAppOutboxMessage.update({
    where: { id: message.id },
    data: {
      status: result.ok ? "SENT" : "FAILED",
      attempts: 1,
      providerResponse: result.ok ? result.providerMessageId : result.error,
      costKurus: result.ok ? 0 : null,
    },
    include: { dealer: { select: { id: true, unvan: true } } },
  });
}
