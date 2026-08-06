"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditableTextarea({
  value,
  placeholder,
  onSave,
}: {
  value: string;
  placeholder?: string;
  onSave: (value: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className="group flex w-full items-start justify-between gap-2 rounded-xl px-1 py-1 text-left transition-colors hover:bg-muted/60"
      >
        {value ? (
          <p className="whitespace-pre-wrap text-body-sm leading-relaxed text-neutral-700">{value}</p>
        ) : (
          <p className="text-body-sm italic text-neutral-400">
            {placeholder ?? "Açıklama eklenmemiş. Düzenlemek için tıklayın"}
          </p>
        )}
        <Pencil className="mt-0.5 size-3.5 shrink-0 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={5}
        autoFocus
        placeholder={placeholder}
        className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-body-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      />
      <div className="flex justify-end gap-1.5">
        <Button size="sm" variant="ghost" disabled={isPending} onClick={() => setEditing(false)}>
          <X className="size-3.5" />
          Vazgeç
        </Button>
        <Button
          size="sm"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await onSave(draft);
              setEditing(false);
            })
          }
        >
          <Check className="size-3.5" />
          Kaydet
        </Button>
      </div>
    </div>
  );
}
