/**
 * Registered, versioned WhatsApp templates. Business-initiated messages must
 * use an approved template (CLAUDE.md: WhatsApp gerçekleri). No free text here.
 */
export type WhatsAppTemplateName = "SIPARIS_ALINDI" | "TAHSILAT_HATIRLATMA";

export type WhatsAppTemplateVariables = {
  SIPARIS_ALINDI: { dealerName: string; orderId: string; totalLabel: string };
  TAHSILAT_HATIRLATMA: { dealerName: string; amountLabel: string };
};

type TemplateDef<T extends WhatsAppTemplateName> = {
  label: string;
  version: number;
  body: (vars: WhatsAppTemplateVariables[T]) => string;
};

export const WHATSAPP_TEMPLATES: { [K in WhatsAppTemplateName]: TemplateDef<K> } = {
  SIPARIS_ALINDI: {
    label: "Sipariş alındı",
    version: 1,
    body: (v) => `Merhaba ${v.dealerName}, #${v.orderId} numaralı siparişiniz alındı. Tutar: ${v.totalLabel}.`,
  },
  TAHSILAT_HATIRLATMA: {
    label: "Tahsilat hatırlatma",
    version: 1,
    body: (v) => `Merhaba ${v.dealerName}, ${v.amountLabel} tutarındaki açık bakiyeniz için hatırlatma.`,
  },
};

export function renderWhatsAppTemplate<T extends WhatsAppTemplateName>(
  templateName: T,
  variables: WhatsAppTemplateVariables[T],
): string {
  return WHATSAPP_TEMPLATES[templateName].body(variables);
}
