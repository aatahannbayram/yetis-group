import { FileText } from "lucide-react";
import { DealerStubPage } from "@/components/dealer/dealer-stub-page";

export default function Page() {
  return (
    <DealerStubPage
      icon={FileText}
      title="Belgelerim"
      description="Faturalar ve irsaliyeler burada toplanacak."
    />
  );
}
