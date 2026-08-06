import { ComingSoonPage } from "@/components/admin/coming-soon";

export default function PanelWhatsAppPage() {
  return (
    <ComingSoonPage
      title="WhatsApp"
      description="Şablonlar, outbox ve gelen mesajlar burada yönetilecek."
      relatedLink={{ href: "/panel/bayi-adaylari", label: "Bayi adaylarına git" }}
    />
  );
}
