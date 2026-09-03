"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SELECT nitelikleri native <input type="radio"> yerine checkbox olarak
 * render eder: tıklayınca varsayılan toggle'ı iptal edip elle tek-seçim +
 * tekrar tıklayınca seçimi kaldırma davranışını uygular. Radio'da seçili
 * seçeneği kaldırmanın native bir yolu yok, bu yüzden bu sarmalayıcı gerekli.
 */
export function AttributeOptionPicker({
  type,
  name,
  groupLabel,
  options,
  defaultSelectedIds,
}: {
  type: "SELECT" | "MULTI_SELECT";
  name: string;
  groupLabel: string;
  options: { id: string; label: string }[];
  defaultSelectedIds: string[];
}) {
  const selected = new Set(defaultSelectedIds);

  function handleSelectClick(e: React.MouseEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    e.preventDefault();
    const nextChecked = !input.checked;
    const group = input.closest('[data-attribute-group="true"]');
    group?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((el) => {
      if (el !== input) el.checked = false;
    });
    input.checked = nextChecked;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  return (
    <div
      data-attribute-group="true"
      className="mt-3 flex flex-wrap gap-2"
      role="group"
      aria-label={groupLabel}
    >
      {options.map((opt) => (
        <label
          key={opt.id}
          className={cn(
            "group inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 text-sm text-stone-700 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
            type === "SELECT"
              ? "has-[:checked]:border-[#1B5E3A] has-[:checked]:bg-[#1B5E3A] has-[:checked]:text-white"
              : "has-[:checked]:border-green-600 has-[:checked]:bg-green-50 has-[:checked]:text-green-700 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[#1B5E3A]/20 dark:has-[:checked]:border-green-600 dark:has-[:checked]:bg-green-950/40 dark:has-[:checked]:text-green-400",
          )}
        >
          <input
            type="checkbox"
            name={name}
            value={opt.id}
            defaultChecked={selected.has(opt.id)}
            onClick={type === "SELECT" ? handleSelectClick : undefined}
            className="sr-only"
          />
          {type === "MULTI_SELECT" ? (
            <Check
              className="size-3.5 opacity-0 group-has-[:checked]:opacity-100"
              aria-hidden
            />
          ) : null}
          {opt.label}
        </label>
      ))}
    </div>
  );
}
