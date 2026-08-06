import { EmptyState } from "@/components/ui/empty-state";
import { Building2 } from "lucide-react";

export default function Page() {
  return (
    <div className="pb-20 sm:pb-6">
      <h1 className="mb-4 text-xl font-bold">Firmam</h1>
      <EmptyState
        icon={Building2}
        title="Firma bilgileri"
        description="Unvan, vergi ve teslimat adresleri burada düzenlenecek."
      />
    </div>
  );
}
