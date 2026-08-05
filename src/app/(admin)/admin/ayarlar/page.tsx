import { Settings } from "lucide-react";
import { ComingSoonPage } from "@/components/admin/coming-soon";

export default function AdminSettingsPage() {
  return (
    <ComingSoonPage
      title="Ayarlar"
      icon={Settings}
      description="Hesap, bildirim ve entegrasyon ayarları ilerleyen milestone'larda eklenecek."
    />
  );
}
