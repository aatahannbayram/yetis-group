"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { prisma } from "@/infra/db/client";
import { queueAndSendWhatsAppMessage } from "@/infra/db/whatsapp";
import type { WhatsAppTemplateName } from "@/domain/whatsapp/templates";
import { calculateBalance } from "@/domain/ledger";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

const TEMPLATE_NAMES: WhatsAppTemplateName[] = ["SIPARIS_ALINDI", "TAHSILAT_HATIRLATMA"];

export async function sendTestWhatsAppAction(formData: FormData) {
  await requireStaff();
  const dealerId = String(formData.get("dealerId") ?? "");
  const templateName = String(formData.get("templateName") ?? "") as WhatsAppTemplateName;

  if (!dealerId) throw new Error("Bayi seçimi gerekli");
  if (!TEMPLATE_NAMES.includes(templateName)) throw new Error("Şablon seçimi gerekli");

  const dealer = await prisma.dealer.findUniqueOrThrow({ where: { id: dealerId } });
  if (!dealer.phone) throw new Error("Bayinin telefon numarası tanımlı değil");

  if (templateName === "SIPARIS_ALINDI") {
    const order = await prisma.order.findFirst({
      where: { dealerId },
      orderBy: { createdAt: "desc" },
    });
    if (!order) throw new Error("Bu bayinin siparişi yok");
    await queueAndSendWhatsAppMessage({
      dealerId,
      toPhone: dealer.phone,
      templateName,
      variables: {
        dealerName: dealer.unvan,
        orderId: order.id.slice(-6),
        totalLabel: formatMoney(money(order.totalKurus)),
      },
    });
  } else {
    const entries = await prisma.ledgerEntry.findMany({ where: { dealerId } });
    const balance = calculateBalance(entries);
    if (balance <= 0) throw new Error("Bu bayinin açık borcu yok");
    await queueAndSendWhatsAppMessage({
      dealerId,
      toPhone: dealer.phone,
      templateName,
      variables: {
        dealerName: dealer.unvan,
        amountLabel: formatMoney(money(balance)),
      },
    });
  }

  revalidatePath("/panel/whatsapp");
}
