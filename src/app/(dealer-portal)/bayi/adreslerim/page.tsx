import { MapPin } from "lucide-react";
import { DealerStubPage } from "@/components/dealer/dealer-stub-page";

export default function Page() {
  return (
    <DealerStubPage
      icon={MapPin}
      title="Adreslerim"
      description="Teslimat adresleriniz ve şube konumlarınız burada yönetilecek."
    />
  );
}
