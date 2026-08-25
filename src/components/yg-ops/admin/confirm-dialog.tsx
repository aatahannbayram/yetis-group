"use client";

import { YgButton } from "@/components/yg-ops/shared/button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
      <button
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-[var(--yg-overlay)]"
        onClick={onCancel}
      />
      <div
        className="relative w-full max-w-md rounded-[var(--yg-radius-lg)] bg-[var(--yg-panel)] p-5"
        style={{ boxShadow: "var(--yg-shadow-md)" }}
      >
        <h2 className="text-[length:var(--yg-text-20)] font-semibold text-[var(--yg-text)]">{title}</h2>
        <p className="mt-2 text-[length:var(--yg-text-14)] text-[var(--yg-text-muted)]">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <YgButton variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </YgButton>
          <YgButton variant={danger ? "danger-ghost" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </YgButton>
        </div>
      </div>
    </div>
  );
}
