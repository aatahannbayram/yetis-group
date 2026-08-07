"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function InlineEdit({
  value,
  onSave,
  className,
  inputClassName,
  type = "text",
  align = "left",
  disabled,
  "aria-label": ariaLabel,
}: {
  value: string;
  onSave: (next: string) => void | Promise<void>;
  className?: string;
  inputClassName?: string;
  type?: "text" | "number";
  align?: "left" | "right";
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function commit() {
    setEditing(false);
    if (draft === value) return;
    await onSave(draft);
  }

  if (disabled) {
    return (
      <span
        className={cn(
          "block truncate",
          align === "right" && "text-right tabular-nums",
          className,
        )}
        title={value}
      >
        {value}
      </span>
    );
  }

  if (!editing) {
    return (
      <button
        type="button"
        className={cn(
          "block w-full truncate rounded px-1 py-0.5 text-left hover:bg-neutral-100",
          align === "right" && "text-right tabular-nums",
          className,
        )}
        title={value}
        aria-label={ariaLabel ?? "Düzenle"}
        onClick={() => setEditing(true)}
      >
        {value || "-"}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      type={type}
      value={draft}
      aria-label={ariaLabel ?? "Düzenle"}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => void commit()}
      onKeyDown={(e) => {
        if (e.key === "Enter") void commit();
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      className={cn(
        "h-7 w-full rounded border border-[var(--panel-border)] bg-white px-1.5 text-[length:var(--panel-font-size)] outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        align === "right" && "text-right tabular-nums",
        inputClassName,
      )}
    />
  );
}
