import { MessageCircleMore } from "lucide-react";
import { ComingSoonPage } from "@/components/admin/coming-soon";

export default function AdminWhatsAppPage() {
  return (
    <ComingSoonPage
      title="WhatsApp"
      icon={MessageCircleMore}
      description="WhatsApp Business Cloud API outbox, şablonlar ve bildirimler M9 kapsamında eklenecek."
      badge="M9"
    />
  );
}
