import { Wallet } from "lucide-react";
import { ComingSoonPage } from "@/components/admin/coming-soon";

export default function AdminLedgerPage() {
  return (
    <ComingSoonPage
      title="Cari"
      icon={Wallet}
      description="Append-only cari ledger, vade takibi ve mutabakat M7 kapsamında eklenecek."
      badge="M7"
      relatedLink={{ href: "/admin/bayiler", label: "Bayileri Gör" }}
    />
  );
}
