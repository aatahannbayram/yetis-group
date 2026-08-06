"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitContactLeadAction, type ContactFormState } from "@/app/(store)/iletisim/actions";
import { LEAD_CHANNEL_LABELS } from "@/domain/leads";

type FieldDef = {
  id: string;
  key: string;
  label: string;
  type: string;
  options: unknown;
  required: boolean;
};

const initial: ContactFormState = { ok: false, message: "" };

export function ContactForm({
  categories,
  fields,
  defaultSource = "ILETISIM_FORMU",
}: {
  categories: { id: string; name: string }[];
  fields: FieldDef[];
  defaultSource?: "ILETISIM_FORMU" | "BAYILIK_BASVURUSU" | "NUMUNE_TALEBI";
}) {
  const [state, action, pending] = useActionState(submitContactLeadAction, initial);

  if (state.ok) {
    return (
      <div className="rounded-[1.25rem] bg-mkt-card-muted p-6">
        <p className="text-[1.1rem] font-medium text-mkt-ink">Teşekkürler</p>
        <p className="mkt-body mt-2">{state.message}</p>
        <Link href="/urunler" className="mkt-label mt-4 inline-flex text-mkt-green-text hover:underline">
          Kataloğa dön
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="source" value={defaultSource} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Firma / işletme" error={state.fieldErrors?.companyName}>
          <input
            name="companyName"
            required
            className="mkt-pill h-11 w-full border border-[color:var(--mkt-border)] bg-white px-4"
          />
        </Field>
        <Field label="Yetkili adı" error={state.fieldErrors?.contactName}>
          <input
            name="contactName"
            required
            className="mkt-pill h-11 w-full border border-[color:var(--mkt-border)] bg-white px-4"
          />
        </Field>
        <Field label="Telefon" error={state.fieldErrors?.phone}>
          <input
            name="phone"
            type="tel"
            required
            className="mkt-pill h-11 w-full border border-[color:var(--mkt-border)] bg-white px-4"
          />
        </Field>
        <Field label="E-posta" error={state.fieldErrors?.email}>
          <input
            name="email"
            type="email"
            className="mkt-pill h-11 w-full border border-[color:var(--mkt-border)] bg-white px-4"
          />
        </Field>
        <Field label="Şehir" error={state.fieldErrors?.city}>
          <input
            name="city"
            required
            className="mkt-pill h-11 w-full border border-[color:var(--mkt-border)] bg-white px-4"
          />
        </Field>
        <Field label="Kanal" error={state.fieldErrors?.channel}>
          <select
            name="channel"
            required
            defaultValue="HORECA"
            className="mkt-pill h-11 w-full border border-[color:var(--mkt-border)] bg-white px-4"
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
        <select
          name="interestedCategoryId"
          className="mkt-pill h-11 w-full border border-[color:var(--mkt-border)] bg-white px-4"
          defaultValue=""
        >
          <option value="">Seçiniz (opsiyonel)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      {fields.map((field) => {
        const options = Array.isArray(field.options)
          ? (field.options as string[])
          : [];
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
                className="mkt-pill h-11 w-full border border-[color:var(--mkt-border)] bg-white px-4"
                defaultValue=""
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
                className="mkt-pill h-11 w-full border border-[color:var(--mkt-border)] bg-white px-4"
              />
            )}
          </Field>
        );
      })}

      <Field label="Notunuz">
        <textarea
          name="note"
          rows={4}
          className="w-full rounded-[1rem] border border-[color:var(--mkt-border)] bg-white px-4 py-3 text-[14px]"
        />
      </Field>

      <label className="flex items-start gap-3 text-[13px] text-mkt-ink">
        <input type="checkbox" name="kvkkConsent" className="mt-1 size-4" />
        <span>
          <Link href="/yasal/kvkk-aydinlatma" className="text-mkt-green-text hover:underline">
            KVKK Aydınlatma Metni
          </Link>
          ’ni okudum; iletişim amacıyla kişisel verilerimin işlenmesine açık rıza veriyorum.
          {state.fieldErrors?.kvkkConsent ? (
            <span className="mt-1 block text-[12px] text-red-700">{state.fieldErrors.kvkkConsent}</span>
          ) : null}
        </span>
      </label>

      {state.message && !state.ok ? (
        <p className="text-[13px] text-red-700">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mkt-pill inline-flex h-12 items-center justify-center bg-mkt-accent px-6 text-[15px] font-medium text-mkt-accent-ink disabled:opacity-60"
      >
        {pending ? "Gönderiliyor…" : "Gönder"}
      </button>
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
    <label className="block space-y-1.5">
      <span className="mkt-label text-mkt-ink-muted">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
      {error ? <span className="block text-[12px] text-red-700">{error}</span> : null}
    </label>
  );
}
