import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="pb-20 sm:pb-6">
      <h1 className="mb-4 text-xl font-bold">Siparişlerim</h1>
      <EmptyState
        icon={ClipboardList}
        title="Henüz sipariş yok"
        description="Sipariş akışı bağlandığında geçmişiniz burada listelenir."
        action={
          <Link
            href="/bayi/siparis"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] bg-[var(--panel-accent-action)] px-4 font-semibold text-white"
          >
            Sipariş ver
          </Link>
        }
      />
    </div>
  );
}
