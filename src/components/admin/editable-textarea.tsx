"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const textareaClass =
  "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm leading-relaxed text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus-visible:border-[#1B5E3A] focus-visible:ring-4 focus-visible:ring-[#1B5E3A]/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500";

export function EditableTextarea({
  value,
  placeholder,
  onSave,
  deferSave,
  controlledValue,
  onControlledChange,
}: {
  value: string;
  placeholder?: string;
  onSave: (value: string) => Promise<void>;
  /** Sticky bar owns save — no local Kaydet. */
  deferSave?: boolean;
  controlledValue?: string;
  onControlledChange?: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isPending, startTransition] = useTransition();

  if (deferSave) {
    const current = controlledValue ?? value;
    return (
      <textarea
        value={current}
        onChange={(event) => onControlledChange?.(event.target.value)}
        rows={5}
        placeholder={placeholder}
        className={textareaClass}
      />
    );
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className="group flex w-full items-start justify-between gap-2 rounded-lg px-1 py-1 text-left transition-colors hover:bg-stone-100 dark:hover:bg-zinc-800"
      >
        {value ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700 dark:text-zinc-300">
            {value}
          </p>
        ) : (
          <p className="text-sm italic text-stone-400">
            {placeholder ?? "Açıklama eklenmemiş. Düzenlemek için tıklayın"}
          </p>
        )}
        <Pencil className="mt-0.5 size-3.5 shrink-0 text-stone-300 opacity-0 transition-opacity group-hover:opacity-100" />
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
        className={textareaClass}
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
