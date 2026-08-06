import { EmptyState } from "@/components/ui/empty-state";
import { Wallet } from "lucide-react";

export default function Page() {
  return (
    <div className="pb-20 sm:pb-6">
      <h1 className="mb-4 text-xl font-bold">Cari hesabım</h1>
      <EmptyState
        icon={Wallet}
        title="Cari özeti"
        description="Bakiye, vade ve hareketler burada görünecek."
        tip="Ana sayfadaki kredi limiti şeridi anlık durumu gösterir."
      />
    </div>
  );
}
