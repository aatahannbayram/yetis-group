import { Wallet } from "lucide-react";
import { DealerStubPage } from "@/components/dealer/dealer-stub-page";

export default function Page() {
  return (
    <DealerStubPage
      icon={Wallet}
      title="Cari hesabım"
      description="Bakiye, vade ve hareketler burada görünecek."
      tip="Ana sayfadaki kredi limiti şeridi anlık durumu gösterir."
    />
  );
}
