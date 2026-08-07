import { Sparkles } from "lucide-react";
import { DealerStubPage } from "@/components/dealer/dealer-stub-page";

export default function Page() {
  return (
    <DealerStubPage
      icon={Sparkles}
      title="Fırsatlar ve öneriler"
      description="SKT ve kampanya teklifleri, size özel ürün önerileriyle birlikte burada listelenecek."
    />
  );
}
