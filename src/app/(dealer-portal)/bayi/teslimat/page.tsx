import { Truck } from "lucide-react";
import { DealerStubPage } from "@/components/dealer/dealer-stub-page";

export default function Page() {
  return (
    <DealerStubPage
      icon={Truck}
      title="Teslimatım"
      description="Yoldaki siparişleriniz ve tahmini varış saatleri burada canlı olarak izlenecek."
      tip="Soğuk zincir gerektiren ürünler için teslimat bölgenize göre gün kısıtı uygulanır."
    />
  );
}
