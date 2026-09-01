import type { ReturnRequestStatus } from "@/domain/return/state-machine";

export type NotificationDraft = {
  title: string;
  body: string;
  link: string;
};

const STATUS_LABEL_TR: Record<ReturnRequestStatus, string> = {
  OLUSTURULDU: "Oluşturuldu",
  INCELENIYOR: "İnceleniyor",
  ONAYLANDI: "Onaylandı",
  REDDEDILDI: "Reddedildi",
  URUN_TESLIM_ALINDI: "Ürün teslim alındı",
  KONTROL_EDILDI: "Kontrol edildi",
  FATURALANDI: "Faturalandı",
  KAPANDI: "Kapandı",
  IPTAL: "İptal edildi",
};

export function returnRequestStatusLabel(status: ReturnRequestStatus): string {
  return STATUS_LABEL_TR[status];
}

export function returnRequestCreatedNotifications(input: {
  returnNo: string;
  dealerName: string;
  itemCount: number;
}): { staff: NotificationDraft; dealer: NotificationDraft } {
  return {
    staff: {
      title: "Yeni iade talebi",
      body: `${input.dealerName}: ${input.returnNo} numaralı talepte ${input.itemCount} kalem.`,
      link: `/panel/iadeler`,
    },
    dealer: {
      title: "İade talebiniz alındı",
      body: `${input.returnNo} numaralı iade talebiniz alındı, inceleniyor.`,
      link: `/bayi/iade`,
    },
  };
}

export function returnRequestStatusChangedNotification(input: {
  returnNo: string;
  status: ReturnRequestStatus;
}): NotificationDraft {
  const label = returnRequestStatusLabel(input.status);
  return {
    title: `İade talebi: ${label}`,
    body: `${input.returnNo} numaralı iade talebinizin durumu "${label}" olarak güncellendi.`,
    link: `/bayi/iade`,
  };
}
