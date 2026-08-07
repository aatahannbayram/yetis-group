import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { MessageCircleMore, Mail, ChartColumn, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { env } from "@/lib/env";

type IntegrationCard = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  status: { label: string; tone: StatusTone };
  detail: string;
  link?: { href: string; label: string };
};

export default function EntegrasyonlarPage() {
  const whatsappConfigured =
    env.WHATSAPP_PROVIDER === "meta" &&
    Boolean(env.WHATSAPP_META_TOKEN && env.WHATSAPP_META_PHONE_NUMBER_ID);
  const emailConfigured = Boolean(env.RESEND_API_KEY);
  const analyticsConfigured = Boolean(
    env.NEXT_PUBLIC_GTM_ID || env.NEXT_PUBLIC_GA4_ID || env.NEXT_PUBLIC_META_PIXEL_ID,
  );

  const cards: IntegrationCard[] = [
    {
      id: "whatsapp",
      icon: MessageCircleMore,
      title: "WhatsApp Business Cloud API",
      description: "Sipariş ve durum bildirimleri için onaylı template mesajları.",
      status:
        env.WHATSAPP_PROVIDER === "meta"
          ? whatsappConfigured
            ? { label: "Bağlı", tone: "success" }
            : { label: "Eksik alan", tone: "danger" }
          : { label: "Mock (geliştirme)", tone: "warning" },
      detail:
        env.WHATSAPP_PROVIDER === "meta"
          ? whatsappConfigured
            ? "Meta API üzerinden gerçek mesaj gönderiliyor."
            : "WHATSAPP_META_TOKEN veya WHATSAPP_META_PHONE_NUMBER_ID eksik."
          : "Mesajlar mock provider ile outbox'a yazılıyor, gerçek gönderim yok.",
      link: { href: "/panel/whatsapp", label: "Outbox'a git" },
    },
    {
      id: "email",
      icon: Mail,
      title: "E-posta (Resend)",
      description: "Sipariş, proforma ve cari bildirimleri için giden e-posta.",
      status: emailConfigured
        ? { label: "Bağlı", tone: "success" }
        : { label: "Dev modu", tone: "warning" },
      detail: emailConfigured
        ? `Gönderen: ${env.EMAIL_FROM}`
        : "RESEND_API_KEY tanımlı değil; e-postalar konsola loglanır.",
    },
    {
      id: "analytics",
      icon: ChartColumn,
      title: "Analytics",
      description: "GA4, Google Tag Manager ve Meta Pixel.",
      status: analyticsConfigured
        ? { label: "Bağlı", tone: "success" }
        : { label: "Yapılandırılmadı", tone: "neutral" },
      detail: analyticsConfigured
        ? [
            env.NEXT_PUBLIC_GA4_ID ? "GA4" : null,
            env.NEXT_PUBLIC_GTM_ID ? "GTM" : null,
            env.NEXT_PUBLIC_META_PIXEL_ID ? "Meta Pixel" : null,
          ]
            .filter(Boolean)
            .join(" · ")
        : "Ölçüm kimliği tanımlanınca çerez rızası sonrası devreye girer.",
      link: { href: "/panel/analytics", label: "Analytics paneline git" },
    },
    {
      id: "e-fatura",
      icon: FileText,
      title: "e-Fatura",
      description: "Resmi e-Fatura entegrasyonu; şu an proforma fatura ile çalışılıyor.",
      status: { label: "Yakında", tone: "neutral" },
      detail: "Proforma faturalar e-Fatura değildir; sözleşme/teyit belgesi olarak kullanılır.",
      link: { href: "/panel/faturalar", label: "Faturalara git" },
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Entegrasyonlar"
        description="Dış sistem bağlantılarının salt okunur durumu. Değerler ortam değişkenlerinden okunur."
        count={cards.length}
      />

      <section className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface-3)] text-[var(--primary-text)]">
                  <card.icon className="size-4" aria-hidden />
                </span>
                <h2 className="font-semibold text-[var(--text-primary)]">{card.title}</h2>
              </div>
              <StatusBadge label={card.status.label} tone={card.status.tone} />
            </div>
            <p className="text-[length:var(--text-caption)] text-[var(--text-muted)]">
              {card.description}
            </p>
            <p className="text-[length:var(--text-caption)] text-[var(--text-secondary)]">
              {card.detail}
            </p>
            {card.link ? (
              <Link
                href={card.link.href}
                className="mt-auto inline-flex w-fit items-center text-[length:var(--text-caption)] font-medium text-[var(--primary-text)] hover:underline"
              >
                {card.link.label}
              </Link>
            ) : null}
          </div>
        ))}
      </section>
    </div>
  );
}
