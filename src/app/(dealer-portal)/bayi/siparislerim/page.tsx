import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { DealerStubPage } from "@/components/dealer/dealer-stub-page";

export default function Page() {
  return (
    <DealerStubPage
      icon={ClipboardList}
      title="Siparişlerim"
      description="Sipariş akışı bağlandığında geçmişiniz ve teslimat durumu burada listelenir."
      action={
        <Link
          href="/bayi/siparis"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--primary-solid)] px-4 font-semibold text-white shadow-[var(--shadow-sm)] transition-[transform,background-color] duration-200 hover:scale-[1.01] hover:bg-[var(--primary-hover)]"
        >
          Sipariş ver <ArrowRight className="size-4" aria-hidden />
        </Link>
      }
    />
  );
}
