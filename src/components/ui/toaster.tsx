"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          "--normal-bg": "var(--surface)",
          "--normal-border": "var(--border)",
          "--normal-text": "var(--text-primary)",
          "--success-bg": "var(--success-subtle)",
          "--success-border": "var(--success-border)",
          "--success-text": "var(--success-text)",
          "--error-bg": "var(--danger-subtle)",
          "--error-border": "var(--danger-border)",
          "--error-text": "var(--danger-text)",
          "--warning-bg": "var(--warning-subtle)",
          "--warning-border": "var(--warning-border)",
          "--warning-text": "var(--warning-text)",
          "--border-radius": "var(--radius-md)",
          fontFamily: "var(--font-sans)",
        } as React.CSSProperties,
      }}
    />
  );
}
