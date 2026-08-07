import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { requireDealerPortal } from "@/features/dealer/portal-context";
import { SITE } from "@/lib/site";

export default async function BayiDestekPage() {
  await requireDealerPortal();

  const phoneHref = SITE.phone.replace(/\s/g, "");
  const waDigits = phoneHref.replace(/^\+/, "").replace(/\D/g, "");

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      <header className="border-b border-[var(--panel-border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--panel-ink)]">Destek</h1>
        <p className="mt-1 text-sm text-[var(--panel-ink-muted)]">
          Sipariş, cari, teslimat veya firma bilgisi için ekibimize yazın
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <a
          href={`tel:${phoneHref}`}
          className="rounded-xl border border-[var(--panel-border)] bg-white p-4 transition-colors hover:border-[var(--primary-solid)]/40"
        >
          <Phone className="size-5 text-[var(--primary-text)]" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-[var(--panel-ink)]">Telefon</p>
          <p className="mt-1 text-sm tabular-nums text-[var(--panel-ink-muted)]">
            {SITE.phoneDisplay}
          </p>
        </a>
        <a
          href={`mailto:${SITE.email}?subject=Bayi%20destek`}
          className="rounded-xl border border-[var(--panel-border)] bg-white p-4 transition-colors hover:border-[var(--primary-solid)]/40"
        >
          <Mail className="size-5 text-[var(--primary-text)]" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-[var(--panel-ink)]">E-posta</p>
          <p className="mt-1 break-all text-sm text-[var(--panel-ink-muted)]">{SITE.email}</p>
        </a>
        <a
          href={`https://wa.me/${waDigits}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-[var(--panel-border)] bg-white p-4 transition-colors hover:border-[var(--primary-solid)]/40"
        >
          <MessageCircle className="size-5 text-[var(--primary-text)]" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-[var(--panel-ink)]">WhatsApp</p>
          <p className="mt-1 text-sm text-[var(--panel-ink-muted)]">Hızlı mesaj</p>
        </a>
      </div>

      <section className="rounded-xl border border-[var(--panel-border)] bg-white p-4">
        <h2 className="text-sm font-semibold text-[var(--panel-ink)]">Sık konular</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--panel-ink-muted)]">
          <li>
            <Link href="/bayi/siparislerim" className="font-medium text-[var(--primary-text)] hover:underline">
              Sipariş durumu
            </Link>{" "}
            : geçmiş ve açık siparişler
          </li>
          <li>
            <Link href="/bayi/cari" className="font-medium text-[var(--primary-text)] hover:underline">
              Cari bakiye
            </Link>{" "}
            : limit ve hareketler
          </li>
          <li>
            <Link href="/bayi/teslimat" className="font-medium text-[var(--primary-text)] hover:underline">
              Teslimat
            </Link>{" "}
            : yoldaki sevkiyatlar
          </li>
          <li>
            <Link href="/iletisim" className="font-medium text-[var(--primary-text)] hover:underline">
              Genel iletişim formu
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
