import type { OrderStatus } from "@/domain/order/state-machine";

export type NotificationDraft = {
  title: string;
  body: string;
  link: string;
};

const STATUS_LABEL_TR: Record<OrderStatus, string> = {
  DRAFT: "Taslak",
  SUBMITTED: "Alındı",
  UNDER_REVIEW: "İnceleniyor",
  CONFIRMED: "Onaylandı",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Yolda",
  DELIVERED: "Teslim edildi",
  REJECTED: "Reddedildi",
  CANCELLED: "İptal edildi",
};

/**
 * Order statuses meaningful enough to email, not just notify in-app.
 * Keeps inboxes from getting noisy on every micro-transition (e.g. UNDER_REVIEW).
 */
const EMAIL_WORTHY_STATUSES: ReadonlySet<OrderStatus> = new Set([
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "REJECTED",
  "CANCELLED",
]);

export function orderStatusLabel(status: OrderStatus): string {
  return STATUS_LABEL_TR[status];
}

export function isOrderStatusEmailWorthy(status: OrderStatus): boolean {
  return EMAIL_WORTHY_STATUSES.has(status);
}

export function orderCreatedNotifications(input: {
  orderId: string;
  dealerName: string;
  totalLabel: string;
}): { staff: NotificationDraft; dealer: NotificationDraft } {
  const shortId = input.orderId.slice(-6).toUpperCase();
  return {
    staff: {
      title: "Yeni sipariş",
      body: `${input.dealerName}: ${input.totalLabel} tutarında sipariş verdi.`,
      link: `/panel/siparisler`,
    },
    dealer: {
      title: "Siparişiniz alındı",
      body: `#${shortId} numaralı siparişiniz (${input.totalLabel}) alındı, inceleniyor.`,
      link: `/bayi/siparislerim`,
    },
  };
}

export function orderStatusChangedNotification(input: {
  orderId: string;
  status: OrderStatus;
}): NotificationDraft {
  const shortId = input.orderId.slice(-6).toUpperCase();
  const label = orderStatusLabel(input.status);
  return {
    title: `Sipariş durumu: ${label}`,
    body: `#${shortId} numaralı siparişinizin durumu "${label}" olarak güncellendi.`,
    link: `/bayi/siparislerim`,
  };
}
