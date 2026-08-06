import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

export default function Page() {
  return (
    <div className="pb-20 sm:pb-6">
      <h1 className="mb-4 text-xl font-bold">Belgelerim</h1>
      <EmptyState
        icon={FileText}
        title="Belge yok"
        description="Faturalar ve irsaliyeler burada toplanacak."
      />
    </div>
  );
}
