"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

function clampInt(n: number, min: number, max?: number) {
  let x = Math.round(n);
  if (!Number.isFinite(x)) x = min;
  if (x < min) x = min;
  if (max != null && Number.isFinite(max)) x = Math.min(x, max);
  return x;
}

type QtyInputProps = {
  value: number;
  min?: number;
  max?: number;
  onCommit: (next: number) => void;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  ariaLabel?: string;
  size?: "sm" | "md";
};

/**
 * Integer stepper that lets the user type a full number (empty draft, then 12)
 * instead of clamping on every keystroke.
 */
export function QtyInput({
  value,
  min = 1,
  max,
  onCommit,
  disabled,
  className,
  inputClassName,
  ariaLabel = "Adet",
  size = "md",
}: QtyInputProps) {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  function commit(raw: string) {
    const parsed = Number(raw.replace(",", "."));
    const next = clampInt(parsed, min, max);
    setDraft(String(next));
    if (next !== value) onCommit(next);
  }

  const btn =
    size === "sm"
      ? "flex size-7 items-center justify-center"
      : "flex size-9 items-center justify-center";
  const icon = size === "sm" ? "size-3" : "size-3.5";
  const field = size === "sm" ? "h-7 w-11 text-xs" : "h-9 w-14 text-sm";

  return (
    <div
      className={cn(
        "inline-flex items-center overflow-hidden rounded-full border border-[var(--panel-border)]",
        disabled && "opacity-50",
        className,
      )}
    >
      <button
        type="button"
        className={cn(btn, "text-[var(--panel-ink-muted)] transition-colors hover:bg-[var(--surface-3)]")}
        disabled={disabled || value <= min}
        onClick={() => onCommit(clampInt(value - 1, min, max))}
        aria-label="Azalt"
      >
        <Minus className={icon} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        aria-label={ariaLabel}
        value={focused ? draft : String(value)}
        onFocus={() => {
          setFocused(true);
          setDraft(String(value));
        }}
        onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ""))}
        onBlur={() => {
          setFocused(false);
          commit(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className={cn(
          field,
          "border-x border-[var(--panel-border)] bg-transparent text-center text-[var(--panel-ink)] tabular-nums outline-none",
          inputClassName,
        )}
      />
      <button
        type="button"
        className={cn(
          btn,
          "text-[var(--panel-ink-muted)] transition-colors hover:bg-[var(--surface-3)] disabled:opacity-30",
        )}
        disabled={disabled || (max != null && value >= max)}
        onClick={() => onCommit(clampInt(value + 1, min, max))}
        aria-label="Artır"
      >
        <Plus className={icon} />
      </button>
    </div>
  );
}
