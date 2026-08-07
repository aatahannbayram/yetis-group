"use client";

import { useMemo, useState, useTransition } from "react";
import { CircleAlert, CircleCheck, MessageCircleMore, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/format/date";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";
import { WHATSAPP_TEMPLATES, type WhatsAppTemplateName } from "@/domain/whatsapp/templates";
import { sendTestWhatsAppAction } from "@/app/(panel)/panel/whatsapp/actions";

const fieldClass =
  "h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none transition-shadow focus-visible:border-[var(--primary-solid)] focus-visible:ring-4 focus-visible:ring-[var(--primary-solid)]/15";

const STATUS_TONE: Record<string, StatusTone> = {
  QUEUED: "info",
  SENT: "success",
  FAILED: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  QUEUED: "Kuyrukta",
  SENT: "Gönderildi",
  FAILED: "Başarısız",
};

export type OutboxRow = {
  id: string;
  dealerName: string | null;
  toPhone: string;
  templateName: string;
  status: string;
  attempts: number;
  providerResponse: string | null;
  costKurus: number | null;
  createdAt: string;
};

export function WhatsAppOutbox({
  outbox,
  dealers,
}: {
  outbox: OutboxRow[];
  dealers: { id: string; unvan: string; phone: string | null }[];
}) {
  const [dealerId, setDealerId] = useState("");
  const [templateName, setTemplateName] = useState<WhatsAppTemplateName>("SIPARIS_ALINDI");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dealersWithPhone = useMemo(() => dealers.filter((d) => d.phone), [dealers]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!dealerId) {
      setError("Bayi seçin.");
      return;
    }
    const formData = new FormData();
    formData.set("dealerId", dealerId);
    formData.set("templateName", templateName);

    startTransition(async () => {
      try {
        await sendTestWhatsAppAction(formData);
        setSuccess("Mesaj mock provider ile kuyruğa alındı ve gönderildi.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gönderilemedi.");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
      >
        <div className="space-y-1.5">
          <p className="text-[length:var(--text-caption)] font-medium text-[var(--text-muted)]">
            Mock provider - test mesajı
          </p>
          <p className="text-[length:var(--text-caption)] text-[var(--text-muted)]">
            Gerçek Meta API&apos;ye bağlanmaz; şablon + değişkenler outbox&apos;a yazılır ve konsola loglanır.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)]">Bayi</label>
          <select
            value={dealerId}
            onChange={(e) => setDealerId(e.target.value)}
            className={fieldClass}
          >
            <option value="">Bayi seçin…</option>
            {dealersWithPhone.map((d) => (
              <option key={d.id} value={d.id}>
                {d.unvan}
              </option>
            ))}
          </select>
          {dealersWithPhone.length === 0 ? (
            <p className="text-[length:var(--text-caption)] text-[var(--warning-text)]">
              Telefon numarası tanımlı bayi yok.
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)]">Şablon</label>
          <select
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value as WhatsAppTemplateName)}
            className={fieldClass}
          >
            {Object.entries(WHATSAPP_TEMPLATES).map(([key, def]) => (
              <option key={key} value={key}>
                {def.label} (v{def.version})
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <p className="flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--danger-subtle)] px-3 py-2 text-[length:var(--text-caption)] text-[var(--danger-text)]">
            <CircleAlert className="size-3.5 shrink-0" />
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--success-subtle)] px-3 py-2 text-[length:var(--text-caption)] text-[var(--success-text)]">
            <CircleCheck className="size-3.5 shrink-0" />
            {success}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending} className="h-11 w-full gap-1.5 rounded-full">
          <Send className="size-4" aria-hidden />
          {isPending ? "Gönderiliyor…" : "Test mesajı gönder"}
        </Button>
      </form>

      <div className="space-y-3">
        <h2 className="text-body-lg font-semibold text-[var(--text-primary)]">Outbox</h2>
        {outbox.length > 0 ? (
          <div className="divide-y divide-[var(--border)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
            {outbox.map((m) => (
              <div key={m.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-[var(--text-primary)]">
                    {m.dealerName ?? m.toPhone}
                  </p>
                  <p className="truncate text-[length:var(--text-caption)] text-[var(--text-muted)]">
                    {WHATSAPP_TEMPLATES[m.templateName as WhatsAppTemplateName]?.label ?? m.templateName}
                    {" · "}
                    {formatDateTime(new Date(m.createdAt))}
                  </p>
                  {m.providerResponse ? (
                    <p className="mt-0.5 truncate font-mono text-[length:var(--text-caption)] text-[var(--text-muted)]">
                      {m.providerResponse}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge
                    label={STATUS_LABEL[m.status] ?? m.status}
                    tone={STATUS_TONE[m.status] ?? "neutral"}
                  />
                  <span className="text-[length:var(--text-caption)] text-[var(--text-muted)]">
                    {m.attempts} deneme
                    {m.costKurus != null ? ` · ${formatMoney(money(m.costKurus))}` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={MessageCircleMore}
            title="Outbox boş"
            description="Gönderilen mesajlar burada listelenir."
          />
        )}
      </div>
    </div>
  );
}
