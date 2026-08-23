"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CircleAlert, MapPin, Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateDealerProfileAction } from "@/app/(dealer-portal)/bayi/firmam/actions";

export type DealerAddressFieldsProps = {
  unvan: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  district: string | null;
  addressLine: string | null;
  deliveryAddressLine: string | null;
  deliveryZoneCode: string | null;
};

const fieldClass =
  "h-10 w-full rounded-lg border border-[var(--panel-border)] bg-[var(--panel-surface)] px-3 text-sm outline-none focus-visible:border-[var(--primary-solid)] focus-visible:ring-4 focus-visible:ring-[var(--primary-solid)]/15";

export function DealerAddressFields(props: DealerAddressFieldsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [phone, setPhone] = useState(props.phone ?? "");
  const [city, setCity] = useState(props.city ?? "");
  const [district, setDistrict] = useState(props.district ?? "");
  const [addressLine, setAddressLine] = useState(props.addressLine ?? "");
  const [deliveryAddressLine, setDeliveryAddressLine] = useState(props.deliveryAddressLine ?? "");

  function cancel() {
    setPhone(props.phone ?? "");
    setCity(props.city ?? "");
    setDistrict(props.district ?? "");
    setAddressLine(props.addressLine ?? "");
    setDeliveryAddressLine(props.deliveryAddressLine ?? "");
    setError(null);
    setEditing(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        await updateDealerProfileAction(formData);
        setEditing(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kaydedilemedi.");
      }
    });
  }

  const billing = [props.addressLine, props.district, props.city].filter(Boolean).join(", ");
  const delivery =
    props.deliveryAddressLine?.trim() ||
    [props.addressLine, props.district, props.city].filter(Boolean).join(", ");

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5"
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-3.5" aria-hidden />
            Adresleri düzenle
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <AddressCard
            title="Fatura adresi"
            lines={[props.unvan, billing || null, props.phone ? `Tel: ${props.phone}` : null]}
          />
          <AddressCard
            title="Teslimat adresi"
            lines={[
              delivery || null,
              props.deliveryZoneCode ? `Bölge kodu: ${props.deliveryZoneCode}` : null,
              props.city ? `Şehir: ${props.city}` : null,
            ]}
            tip="Soğuk zincir günleri bölge koduna göre kısıtlanır. Bölge kodunu satış ekibi değiştirir."
          />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-4">
      <input type="hidden" name="email" value={props.email ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
            Telefon
          </span>
          <Input
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05xx xxx xx xx"
            className={fieldClass}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
            Şehir
          </span>
          <Input
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="İstanbul"
            className={fieldClass}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
            İlçe
          </span>
          <Input
            name="district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="Kadıköy"
            className={fieldClass}
          />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
            Fatura adresi
          </span>
          <textarea
            name="addressLine"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            placeholder="Mahalle, sokak, no"
            rows={3}
            className="w-full resize-y rounded-lg border border-[var(--panel-border)] bg-[var(--panel-surface)] px-3 py-2 text-sm outline-none focus-visible:border-[var(--primary-solid)] focus-visible:ring-4 focus-visible:ring-[var(--primary-solid)]/15"
          />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-[11px] font-medium tracking-wide text-[var(--panel-ink-muted)] uppercase">
            Teslimat adresi
          </span>
          <textarea
            name="deliveryAddressLine"
            value={deliveryAddressLine}
            onChange={(e) => setDeliveryAddressLine(e.target.value)}
            placeholder="Faturadan farklıysa yazın. Boş bırakılırsa fatura adresi kullanılır."
            rows={3}
            className="w-full resize-y rounded-lg border border-[var(--panel-border)] bg-[var(--panel-surface)] px-3 py-2 text-sm outline-none focus-visible:border-[var(--primary-solid)] focus-visible:ring-4 focus-visible:ring-[var(--primary-solid)]/15"
          />
        </label>
      </div>

      <p className="text-xs text-[var(--panel-ink-muted)]">
        Teslimat bölgesi ve unvan burada değişmez. Yeni şube için destek ekibine yazın.
      </p>

      {error ? (
        <p className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          <CircleAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={isPending} onClick={cancel} className="h-9 gap-1.5">
          <X className="size-3.5" aria-hidden />
          Vazgeç
        </Button>
        <Button type="submit" disabled={isPending} className="h-9">
          {isPending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}

function AddressCard({
  title,
  lines,
  tip,
}: {
  title: string;
  lines: Array<string | null>;
  tip?: string;
}) {
  const filled = lines.filter(Boolean) as string[];
  return (
    <article className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-4">
      <div className="flex items-center gap-2">
        <MapPin className="size-4 text-[var(--primary-text)]" aria-hidden />
        <h2 className="text-sm font-semibold text-[var(--panel-ink)]">{title}</h2>
      </div>
      {filled.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--panel-ink-muted)]">Kayıtlı adres yok.</p>
      ) : (
        <ul className="mt-3 space-y-1 text-sm text-[var(--panel-ink)]">
          {filled.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      {tip ? <p className="mt-3 text-xs text-[var(--panel-ink-muted)]">{tip}</p> : null}
    </article>
  );
}
