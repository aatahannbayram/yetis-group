import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { DealerStubPage } from "@/components/dealer/dealer-stub-page";

export default function Page() {
  return (
    <DealerStubPage
      icon={MessageCircle}
      title="Destek"
      description="Sipariş, cari hesap veya teslimatla ilgili bir sorunuz mu var? Ekibimize ulaşın."
      action={
        <Link
          href="/iletisim"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--primary-solid)] px-4 font-semibold text-white shadow-[var(--shadow-sm)] transition-[transform,background-color] duration-200 hover:scale-[1.01] hover:bg-[var(--primary-hover)]"
        >
          İletişime geç <ArrowRight className="size-4" aria-hidden />
        </Link>
      }
    />
  );
}
