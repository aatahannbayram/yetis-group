import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { WhatsAppOutbox, type OutboxRow } from "@/components/admin/whatsapp-outbox";
import { listOutboxMessages, listDealerPhoneOptions } from "@/infra/db/whatsapp";
import { env } from "@/lib/env";

export default async function PanelWhatsAppPage() {
  const [outbox, dealers] = await Promise.all([listOutboxMessages(50), listDealerPhoneOptions()]);

  const rows: OutboxRow[] = outbox.map((m) => ({
    id: m.id,
    dealerName: m.dealer?.unvan ?? null,
    toPhone: m.toPhone,
    templateName: m.templateName,
    status: m.status,
    attempts: m.attempts,
    providerResponse: m.providerResponse,
    costKurus: m.costKurus,
    createdAt: m.createdAt.toISOString(),
  }));

  const queuedCount = rows.filter((r) => r.status === "QUEUED").length;
  const sentCount = rows.filter((r) => r.status === "SENT").length;
  const failedCount = rows.filter((r) => r.status === "FAILED").length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="WhatsApp"
        count={rows.length}
        description={
          env.WHATSAPP_PROVIDER === "meta"
            ? "Meta Cloud API bağlı. Şablon mesajları outbox üzerinden gönderilir."
            : "Geliştirme modu: mock provider ile şablon mesajları outbox'a yazılır, gerçek gönderim yapılmaz."
        }
      />

      <section aria-label="Özet" className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Kuyrukta" value={queuedCount} tone={queuedCount > 0 ? "info" : "neutral"} />
        <StatCard label="Gönderildi" value={sentCount} tone="success" />
        <StatCard label="Başarısız" value={failedCount} tone={failedCount > 0 ? "danger" : "neutral"} />
      </section>

      <WhatsAppOutbox outbox={rows} dealers={dealers} />
    </div>
  );
}
