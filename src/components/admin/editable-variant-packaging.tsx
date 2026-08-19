"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PACKAGING_OPTIONS, packLabel } from "@/lib/format/packaging";
import type { PackagingType } from "@/generated/prisma";

const fieldClass =
  "h-8 rounded-lg border border-stone-200 bg-white px-2 text-xs outline-none focus-visible:border-[#1B5E3A] focus-visible:ring-4 focus-visible:ring-[#1B5E3A]/15 dark:border-zinc-800 dark:bg-zinc-950";

export function EditableVariantPackaging({
  packSize,
  packagingType,
  unitFactor,
  onSave,
}: {
  packSize: string | null;
  packagingType: string;
  unitFactor: string;
  onSave: (input: { packagingType: PackagingType; packSize: string; unitFactor: number }) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [size, setSize] = useState(packSize ?? "");
  const [type, setType] = useState(packagingType);
  const [factor, setFactor] = useState(unitFactor);
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setSize(packSize ?? "");
          setType(packagingType);
          setFactor(unitFactor);
          setEditing(true);
        }}
        className="text-left text-stone-700 hover:text-brand-700 hover:underline dark:text-zinc-300"
        title="Paket bilgilerini düzenle"
      >
        {packLabel(packSize, packagingType)}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Input
        value={size}
        onChange={(event) => setSize(event.target.value)}
        placeholder="Paket boyutu"
        className={`${fieldClass} w-28`}
        autoFocus
      />
      <select
        value={type}
        onChange={(event) => setType(event.target.value)}
        className={`${fieldClass} w-24`}
      >
        {PACKAGING_OPTIONS.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <Input
        type="number"
        step="0.001"
        min="0.001"
        value={factor}
        onChange={(event) => setFactor(event.target.value)}
        title="Birim katsayısı (kg)"
        className={`${fieldClass} w-16`}
      />
      <Button
        size="icon-sm"
        variant="ghost"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const unitFactorNum = Number(factor.replace(",", "."));
            if (!Number.isFinite(unitFactorNum) || unitFactorNum <= 0) {
              toast.error("Geçerli bir birim katsayısı girin");
              return;
            }
            try {
              await onSave({
                packagingType: type as PackagingType,
                packSize: size,
                unitFactor: unitFactorNum,
              });
              setEditing(false);
              toast.success("Paket güncellendi");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Paket güncellenemedi");
            }
          })
        }
      >
        <Check />
      </Button>
      <Button size="icon-sm" variant="ghost" disabled={isPending} onClick={() => setEditing(false)}>
        <X />
      </Button>
    </div>
  );
}
