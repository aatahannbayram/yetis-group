import { Reveal } from "@/components/store/reveal";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * Restrained by design: color is earned, not decorative. Almost every card
 * is quiet neutral; "danger" is reserved for a real alert (a left stripe,
 * not a full tinted wash); "feature" is a solid fill used on exactly one
 * card per screen, the single most important action.
 */
export type DealerCardTone = "neutral" | "danger" | "feature";

const CARD_SHELL: Record<DealerCardTone, string> = {
  neutral: "border-[var(--panel-border)] bg-white",
  danger: "border-[var(--panel-border)] border-l-[3px] border-l-[var(--danger-solid)] bg-white",
  feature:
    "border-transparent bg-[linear-gradient(135deg,var(--brand-800),var(--brand-600))] text-white",
};

const ICON_TONE: Record<DealerCardTone, string> = {
  neutral: "text-[var(--text-secondary)]",
  danger: "text-[var(--danger-solid)]",
  feature: "text-white",
};

const ICON_BG: Record<DealerCardTone, string> = {
  neutral: "bg-[var(--surface-3)]",
  danger: "bg-[var(--danger-subtle)]",
  feature: "bg-white/15",
};

/** Shared card shell for the dealer portal: quiet by default, hover lift, one accent per meaning. */
export function DealerCard({
  icon: Icon,
  tone = "neutral",
  delay = 0,
  className,
  children,
}: {
  icon: LucideIcon;
  tone?: DealerCardTone;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal delay={delay}>
      <section
        className={cn(
          "group relative overflow-hidden rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] sm:p-5",
          CARD_SHELL[tone],
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105",
              ICON_BG[tone],
              ICON_TONE[tone],
            )}
          >
            <Icon className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </section>
    </Reveal>
  );
}
