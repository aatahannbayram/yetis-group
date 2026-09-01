import type { SampleRequestStatus } from "@/domain/sample/state-machine";

export type NotificationDraft = {
  title: string;
  body: string;
  link: string;
};

const STATUS_LABEL_TR: Record<SampleRequestStatus, string> = {
  TALEP_EDILDI: "Talep edildi",
  INCELENIYOR: "İnceleniyor",
  ONAYLANDI: "Onaylandı",
  REDDEDILDI: "Reddedildi",
  HAZIRLANIYOR: "Hazırlanıyor",
  SEVK_EDILDI: "Sevk edildi",
  TESLIM_EDILDI: "Teslim edildi",
  IPTAL: "İptal edildi",
};

export function sampleRequestStatusLabel(status: SampleRequestStatus): string {
  return STATUS_LABEL_TR[status];
}

export function sampleRequestCreatedNotifications(input: {
  requestId: string;
  requestNo: string;
  dealerName: string;
  itemCount: number;
}): { staff: NotificationDraft; dealer: NotificationDraft } {
  return {
    staff: {
      title: "Yeni numune talebi",
      body: `${input.dealerName}: ${input.requestNo} numaralı talepte ${input.itemCount} ürün.`,
      link: `/panel/numuneler`,
    },
    dealer: {
      title: "Numune talebiniz alındı",
      body: `${input.requestNo} numaralı numune talebiniz alındı, inceleniyor.`,
      link: `/bayi/numune`,
    },
  };
}

export function sampleRequestStatusChangedNotification(input: {
  requestNo: string;
  status: SampleRequestStatus;
}): NotificationDraft {
  const label = sampleRequestStatusLabel(input.status);
  return {
    title: `Numune talebi: ${label}`,
    body: `${input.requestNo} numaralı numune talebinizin durumu "${label}" olarak güncellendi.`,
    link: `/bayi/numune`,
  };
}
