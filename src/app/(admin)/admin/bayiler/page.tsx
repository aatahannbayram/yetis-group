import { Users2 } from "lucide-react";
import { ComingSoonPage } from "@/components/admin/coming-soon";

export default function AdminDealersPage() {
  return (
    <ComingSoonPage
      title="Bayiler"
      icon={Users2}
      description="Onaylı bayi hesapları, kullanıcı ve rol yönetimi M2 kapsamında eklenecek. Şimdilik aday takibi için Bayi Adayları'nı kullanın."
      badge="M2"
    />
  );
}
