import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type YgButtonVariant = "primary" | "ghost" | "danger-ghost";

const variantClass: Record<YgButtonVariant, string> = {
  primary:
    "bg-[var(--yg-primary)] text-[var(--yg-text-inverse)] hover:bg-[var(--yg-primary-hover)] active:bg-[var(--yg-primary-pressed)]",
  ghost:
    "bg-transparent text-[var(--yg-text-secondary)] hover:bg-[var(--yg-panel-2)] hover:text-[var(--yg-text)]",
  "danger-ghost":
    "bg-transparent text-[var(--yg-danger)] hover:bg-[var(--yg-danger-subtle)]",
};

export function YgButton({
  variant = "ghost",
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: YgButtonVariant;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex h-[var(--yg-control-h)] min-h-[44px] items-center justify-center gap-2 rounded-[var(--yg-radius-md)] px-4 text-[length:var(--yg-text-14)] font-medium transition-colors duration-[var(--yg-duration)] ease-[var(--yg-ease)] disabled:pointer-events-none disabled:opacity-40",
        variantClass[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
