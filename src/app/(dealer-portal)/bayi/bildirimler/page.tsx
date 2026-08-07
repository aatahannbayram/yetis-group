import { Bell } from "lucide-react";
import { DealerStubPage } from "@/components/dealer/dealer-stub-page";

export default function Page() {
  return (
    <DealerStubPage
      icon={Bell}
      title="Bildirimler"
      description="Sipariş, teslimat ve cari hesap bildirimleriniz burada listelenecek."
      tip="Kritik bildirimler (limit aşımı, SKT fırsatı) WhatsApp üzerinden de iletilir."
    />
  );
}
