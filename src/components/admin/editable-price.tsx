"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { money } from "@/domain/money";
import { formatMoney } from "@/lib/format/money";

export function EditablePrice({
  priceKurus,
  onSave,
}: {
  priceKurus: number;
  onSave: (priceKurus: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState((priceKurus / 100).toString());
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="tabular-nums text-body-sm font-medium text-neutral-900 hover:text-brand-700 hover:underline"
      >
        {formatMoney(money(priceKurus))}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Input
        type="number"
        step="0.01"
        min="0"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="h-8 w-24 text-right"
        autoFocus
      />
      <Button
        size="icon-sm"
        variant="ghost"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const kurus = Math.round(Number(value) * 100);
            if (!Number.isFinite(kurus) || kurus <= 0) {
              toast.error("Geçerli bir fiyat girin");
              return;
            }
            try {
              await onSave(kurus);
              setEditing(false);
              toast.success("Fiyat güncellendi");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Fiyat güncellenemedi");
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
