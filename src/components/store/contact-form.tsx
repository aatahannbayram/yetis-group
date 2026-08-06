"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitContactLeadAction, type ContactFormState } from "@/app/(store)/iletisim/actions";
import { LEAD_CHANNEL_LABELS } from "@/domain/leads";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

type FieldDef = {
  id: string;
  key: string;
  label: string;
  type: string;
  options: unknown;
  required: boolean;
};

const initial: ContactFormState = { ok: false, message: "" };

const inputClass = cn(
  "h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-[15px] font-medium text-neutral-950 outline-none",
  "placeholder:font-normal placeholder:text-neutral-500",
  "transition-[border,box-shadow,background]",
  "focus:border-[var(--mkt-accent)] focus:ring-2 focus:ring-[var(--mkt-accent)]/30",
);

const selectClass = cn(inputClass, "appearance-none pr-10");

export function ContactForm({
  categories,
  fields,
  defaultSource = "ILETISIM_FORMU",
  defaultChannel = "HORECA",
  submitLabel = "Talebi gönder",
}: {
  categories: { id: string; name: string }[];
  fields: FieldDef[];
  defaultSource?: "ILETISIM_FORMU" | "BAYILIK_BASVURUSU" | "NUMUNE_TALEBI";
  defaultChannel?: string;
  submitLabel?: string;
}) {
  const [state, action, pending] = useActionState(submitContactLeadAction, initial);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-[var(--brand-200)] bg-[var(--brand-50)] px-6 py-10 text-center sm:px-8">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-white text-[var(--mkt-green-text)] shadow-sm">
          <CheckCircle2 className="size-6" aria-hidden />
        </span>
        <p className="mt-4 text-[13px] font-semibold tracking-wide text-[var(--mkt-green-text)] uppercase">
          Talebiniz alındı
        </p>
        <p className="mt-3 text-[1.35rem] font-semibold tracking-[-0.02em] text-neutral-950">
          Teşekkürler — satış ekibimiz dönüş yapacak.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">{state.message}</p>
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          <Link
            href="/auth?tab=uye"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--mkt-accent)] px-6 text-[15px] font-semibold text-[var(--mkt-accent-ink)]"
          >
            Bayi üyeliği oluştur
          </Link>
          <Link
            href="/urunler"
            className="inline-flex h-12 items-center justify-center rounded-full border border-neutral-300 bg-white px-6 text-[15px] font-semibold text-neutral-950"
          >
            Kataloğa dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="source" value={defaultSource} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Firma / işletme" error={state.fieldErrors?.companyName} required>
          <input
            name="companyName"
            required
            className={inputClass}
            placeholder="Örn. Yeşil Market Ltd."
            autoComplete="organization"
            aria-invalid={!!state.fieldErrors?.companyName}
          />
        </Field>
        <Field label="Yetkili adı" error={state.fieldErrors?.contactName} required>
          <input
            name="contactName"
            required
            className={inputClass}
            placeholder="Ad Soyad"
            autoComplete="name"
            aria-invalid={!!state.fieldErrors?.contactName}
          />
        </Field>
        <Field label="Telefon" error={state.fieldErrors?.phone} required>
          <input
            name="phone"
            type="tel"
            required
            className={inputClass}
            placeholder="05xx xxx xx xx"
            autoComplete="tel"
            aria-invalid={!!state.fieldErrors?.phone}
          />
        </Field>
        <Field label="E-posta" error={state.fieldErrors?.email}>
          <input
            name="email"
            type="email"
            className={inputClass}
            placeholder="isletme@ornek.com"
            autoComplete="email"
            aria-invalid={!!state.fieldErrors?.email}
          />
        </Field>
        <Field label="Şehir" error={state.fieldErrors?.city} required>
          <input
            name="city"
            required
            className={inputClass}
            placeholder="İstanbul"
            autoComplete="address-level2"
            aria-invalid={!!state.fieldErrors?.city}
          />
        </Field>
        <Field label="Kanal" error={state.fieldErrors?.channel} required>
          <select
            name="channel"
            required
            defaultValue={defaultChannel}
            className={selectClass}
            aria-invalid={!!state.fieldErrors?.channel}
          >
            {Object.entries(LEAD_CHANNEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="İlgilendiği kategori">
        <select name="interestedCategoryId" className={selectClass} defaultValue="">
          <option value="">Seçiniz (opsiyonel)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      {fields.map((field) => {
        const options = Array.isArray(field.options) ? (field.options as string[]) : [];
        const name = `cf_${field.key}`;
        return (
          <Field
            key={field.id}
            label={field.label}
            error={state.fieldErrors?.[name]}
            required={field.required}
          >
            {field.type === "SELECT" ? (
              <select
                name={name}
                required={field.required}
                className={selectClass}
                defaultValue=""
                aria-invalid={!!state.fieldErrors?.[name]}
              >
                <option value="">Seçiniz</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={name}
                type={field.type === "NUMBER" ? "number" : field.type === "DATE" ? "date" : "text"}
                required={field.required}
                className={inputClass}
                aria-invalid={!!state.fieldErrors?.[name]}
              />
            )}
          </Field>
        );
      })}

      <Field label="Mesajınız">
        <textarea
          name="note"
          rows={4}
          className={cn(inputClass, "h-auto min-h-[7rem] resize-y py-3.5")}
          placeholder="İhtiyacınızı kısaca yazın…"
        />
      </Field>

      <label className="flex items-start gap-3 rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-4 text-[14px] leading-relaxed text-neutral-800">
        <input
          type="checkbox"
          name="kvkkConsent"
          required
          className="mt-0.5 size-4 shrink-0 rounded accent-[var(--mkt-accent)]"
        />
        <span>
          <Link
            href="/yasal/kvkk-aydinlatma"
            className="font-semibold text-[var(--mkt-green-text)] hover:underline"
          >
            KVKK Aydınlatma Metni
          </Link>
          ’ni okudum; iletişim amacıyla kişisel verilerimin işlenmesine açık rıza veriyorum.
          {state.fieldErrors?.kvkkConsent ? (
            <span className="mt-1.5 block text-[13px] font-medium text-red-700">
              {state.fieldErrors.kvkkConsent}
            </span>
          ) : null}
        </span>
      </label>

      {state.message && !state.ok ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-800"
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl",
          "bg-neutral-950 text-[15px] font-semibold text-white",
          "transition-colors hover:bg-neutral-800 disabled:opacity-60",
        )}
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {pending ? "Gönderiliyor…" : submitLabel}
      </button>

      <p className="text-center text-[13px] leading-relaxed text-neutral-600">
        Gönderim sonrası satış ekibi sizinle iletişime geçer. Acil durumlar için{" "}
        <a href={`tel:${SITE.phone}`} className="font-semibold text-neutral-950 underline-offset-2 hover:underline">
          telefon
        </a>{" "}
        veya WhatsApp kullanın.
      </p>
    </form>
  );
}

function Field({
  label,
  children,
  error,
  required,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-[14px] font-semibold text-neutral-900">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      {children}
      {error ? (
        <span className="block text-[13px] font-medium text-red-700">{error}</span>
      ) : null}
    </label>
  );
}
