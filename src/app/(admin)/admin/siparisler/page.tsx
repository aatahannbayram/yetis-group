import { ClipboardList } from "lucide-react";
import { ComingSoonPage } from "@/components/admin/coming-soon";

export default function AdminOrdersPage() {
  return (
    <ComingSoonPage
      title="Siparişler"
      icon={ClipboardList}
      description="Sipariş akışı, durum makinesi (draft → submitted → ... → delivered) ve kredi limiti kontrolü M4 kapsamında eklenecek."
      badge="M4"
      relatedLink={{ href: "/admin/bayi-adaylari", label: "Bayi Adaylarını Gör" }}
    />
  );
}
