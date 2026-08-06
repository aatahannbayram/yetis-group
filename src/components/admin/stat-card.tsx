import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CountUp } from "@/components/admin/count-up";

export function CardLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-brand-50 hover:text-brand-700"
      aria-label="Detaya git"
    >
      <ArrowUpRight className="size-4" aria-hidden />
    </Link>
  );
}

export function StatCard({
  label,
  value,
  suffix,
  href,
  warn,
  featured,
}: {
  label: string;
  value: number;
  suffix?: string;
  href: string;
  warn?: boolean;
  featured?: boolean;
}) {
  if (featured) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-brand-800 to-brand-600 p-5 text-white shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-body-sm font-medium text-white/80">{label}</p>
          <Link
            href={href}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            aria-label="Detaya git"
          >
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
        <p className="mt-4 tabular-nums text-h1 leading-h1 font-bold text-white">
          <CountUp value={value} suffix={suffix} />
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-body-sm font-medium text-muted-foreground">{label}</p>
        <CardLink href={href} />
      </div>
      <p
        className={`mt-4 tabular-nums text-h1 leading-h1 font-bold ${
          warn ? "text-warning-fg" : "text-foreground"
        }`}
      >
        <CountUp value={value} suffix={suffix} />
      </p>
    </div>
  );
}

export function PillButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={
        variant === "primary"
          ? `inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-700 px-4 py-2.5 text-body-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-800 sm:w-auto ${className ?? ""}`
          : `inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-body-sm font-semibold text-foreground transition-colors hover:bg-muted sm:w-auto ${className ?? ""}`
      }
    >
      {children}
    </Link>
  );
}
