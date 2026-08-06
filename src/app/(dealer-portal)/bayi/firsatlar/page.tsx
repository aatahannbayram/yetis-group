import { EmptyState } from "@/components/ui/empty-state";
import { Sparkles } from "lucide-react";

export default function Page() {
  return (
    <div className="pb-20 sm:pb-6">
      <h1 className="mb-4 text-xl font-bold">Fırsatlar</h1>
      <EmptyState
        icon={Sparkles}
        title="Size özel fırsatlar"
        description="SKT ve kampanya teklifleri burada listelenecek."
      />
    </div>
  );
}
