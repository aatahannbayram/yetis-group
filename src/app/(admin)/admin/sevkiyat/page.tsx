import { Truck } from "lucide-react";
import { ComingSoonPage } from "@/components/admin/coming-soon";

export default function AdminShipmentsPage() {
  return (
    <ComingSoonPage
      title="Sevkiyat"
      icon={Truck}
      description="FEFO sevkiyat önerisi, irsaliye ve SKT kontrolü M8 kapsamında eklenecek."
      badge="M8"
    />
  );
}
