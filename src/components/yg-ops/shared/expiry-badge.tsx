import { cn } from "@/lib/utils";
import { daysUntil, formatYgDate, sktToneFromDays, type SktTone } from "@/lib/yg-ops/format";

const toneVar: Record<SktTone, string> = {
  ok: "var(--yg-skt-ok)",
  warn: "var(--yg-skt-warn)",
  soon: "var(--yg-skt-soon)",
  critical: "var(--yg-skt-critical)",
};

const toneLabel: Record<SktTone, string> = {
  ok: "SKT uygun",
  warn: "SKT yaklaştı",
  soon: "SKT yakında",
  critical: "SKT geçti",
};

export function ExpiryBadge({
  expirationDate,
  className,
}: {
  expirationDate: Date | string | number;
  className?: string;
}) {
  const days = daysUntil(expirationDate);
  const tone = sktToneFromDays(days);
  const remainingLabel =
    days <= 0 ? "0 gün" : days === 1 ? "1 gün" : `${days} gün`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--yg-radius-pill)] px-2.5 py-1 text-[length:var(--yg-text-12)] font-medium",
        className,
      )}
      style={{
        color: toneVar[tone],
        background: `color-mix(in srgb, ${toneVar[tone]} 16%, transparent)`,
      }}
      title={`${toneLabel[tone]} · ${formatYgDate(expirationDate)}`}
    >
      <span aria-hidden className="size-1.5 rounded-full" style={{ background: toneVar[tone] }} />
      {formatYgDate(expirationDate)}
      <span className="text-[var(--yg-text-muted)]">·</span>
      <span>{remainingLabel}</span>
    </span>
  );
}
