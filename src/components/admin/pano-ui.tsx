"use client";

import Link from "next/link";
import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  ClipboardList,
  Package,
  ShoppingCart,
  Target,
  Truck,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { btnInkClassName } from "@/components/ui/button";
import { CheeseWheelMark } from "@/components/store/cheese-wheel-mark";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";

export type PanoIconName =
  | "cart"
  | "target"
  | "truck"
  | "alert"
  | "wallet"
  | "clipboard"
  | "users"
  | "userPlus"
  | "package";

const PANO_ICONS: Record<PanoIconName, LucideIcon> = {
  cart: ShoppingCart,
  target: Target,
  truck: Truck,
  alert: AlertTriangle,
  wallet: Wallet,
  clipboard: ClipboardList,
  users: Users,
  userPlus: UserPlus,
  package: Package,
};

function resolveIcon(name: PanoIconName): LucideIcon {
  return PANO_ICONS[name] ?? Package;
}

/** Chart strokes follow theme tokens so light and dark stay readable. */
const MUTED = "var(--text-muted)";
const GRID = "var(--border)";
const ACCENT = "var(--primary-solid)";
const ACCENT_MID = "var(--brand-500)";
const WARN = "var(--warning-solid)";
const DANGER = "var(--danger-solid)";
const CURSOR = "color-mix(in srgb, var(--text-primary) 6%, transparent)";

export function PanoShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative -mx-3 -my-4 overflow-hidden px-3 py-4 sm:-mx-4 sm:-my-5 sm:px-4 sm:py-5 md:-m-6 md:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(80%_60%_at_0%_0%,color-mix(in_srgb,var(--brand-500)_18%,transparent),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-[1120px] space-y-7 pb-6">{children}</div>
    </div>
  );
}

export function PanoHeader({
  title,
  dateLabel,
  description,
  actions,
}: {
  title: string;
  dateLabel: string;
  description: string;
  actions: React.ReactNode;
}) {
  return (
    <header className="relative flex flex-col gap-5 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <CheeseWheelMark className="pointer-events-none absolute -right-6 -top-4 hidden w-36 text-[var(--brand-700)] opacity-[0.08] sm:block dark:text-[var(--brand-400)] dark:opacity-[0.14]" />
      <div className="relative min-w-0">
        <p className="text-[12px] font-medium tabular-nums text-[var(--text-muted)]">
          {dateLabel}
        </p>
        <h1 className="mt-1 text-[1.75rem] font-semibold tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2rem]">
          {title}
        </h1>
        <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[var(--text-secondary)]">
          {description}
        </p>
      </div>
      <div className="relative flex flex-wrap gap-2">{actions}</div>
    </header>
  );
}

export function PanoAction({
  href,
  children,
  variant = "ghost",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-semibold",
        variant === "primary"
          ? btnInkClassName
          : "bg-[var(--surface)] text-[var(--text-primary)] ring-1 ring-[var(--border)] transition-colors hover:bg-[var(--surface-2)]",
      )}
    >
      {children}
    </Link>
  );
}

export function PanoKpiRow({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-label="Özet metrikler"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
    >
      {children}
    </section>
  );
}

export function PanoKpi({
  label,
  value,
  hint,
  href,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  tone?: "neutral" | "ok" | "warn" | "danger" | "info";
}) {
  const valueColor =
    tone === "warn"
      ? "text-[var(--warning-text)]"
      : tone === "danger"
        ? "text-[var(--danger-text)]"
        : tone === "ok" || tone === "info"
          ? "text-[var(--primary-text)]"
          : "text-[var(--text-primary)]";

  const toneWash =
    tone === "warn"
      ? "bg-[var(--warning-subtle)]"
      : tone === "danger"
        ? "bg-[var(--danger-subtle)]"
        : tone === "ok" || tone === "info"
          ? "bg-[var(--primary-subtle)]"
          : "bg-[var(--surface)]";

  const inner = (
    <div
      className={cn(
        "group flex h-full min-h-[108px] flex-col justify-between rounded-2xl border border-[var(--border)] p-4 shadow-[var(--shadow-sm)] transition-[box-shadow,transform,border-color] duration-150 hover:-translate-y-px hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)] sm:p-5",
        toneWash,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-medium text-[var(--text-muted)]">{label}</p>
        {href ? (
          <ArrowUpRight
            className="size-3.5 text-[var(--text-disabled)] opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          />
        ) : null}
      </div>
      <div>
        <p className={cn("text-[1.75rem] font-semibold tracking-[-0.04em] tabular-nums", valueColor)}>
          {value}
        </p>
        <p className="mt-1 min-h-[1rem] text-[12px] text-[var(--text-muted)]">
          {hint ?? "\u00a0"}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]/40"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

export function PanoPanel({
  title,
  subtitle,
  aside,
  children,
  className,
  accent = false,
}: {
  title: string;
  subtitle?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <section
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6",
        className,
      )}
    >
      {accent ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(120%_80%_at_0%_0%,color-mix(in_srgb,var(--brand-500)_16%,transparent),transparent_72%)]"
        />
      ) : null}
      <header className="relative mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{subtitle}</p>
          ) : null}
        </div>
        {aside}
      </header>
      <div className="relative min-h-0 flex-1">{children}</div>
    </section>
  );
}

function Tip({
  active,
  label,
  rows,
}: {
  active?: boolean;
  label?: string;
  rows: { name: string; value: string; color?: string }[];
}) {
  if (!active || rows.length === 0) return null;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 px-3 py-2 text-[var(--text-primary)] shadow-[var(--shadow-md)] backdrop-blur-sm">
      {label ? <p className="text-[11px] text-[var(--text-muted)]">{label}</p> : null}
      <ul className="mt-0.5 space-y-0.5">
        {rows.map((r) => (
          <li key={r.name} className="text-[13px] font-semibold tabular-nums">
            <span className="font-medium text-[var(--text-secondary)]">{r.name} </span>
            {r.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

export type DayPoint = {
  date: string;
  count: number;
  dayLabel: string;
  dayNum: string;
};

export function PanoLeadTrend({ data, weekOverWeek }: { data: DayPoint[]; weekOverWeek: number }) {
  const fillId = useId();
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="text-[2.5rem] font-semibold tracking-[-0.05em] tabular-nums text-[var(--text-primary)]">
          {total}
        </p>
        <div className="pb-1">
          <p className="text-[13px] font-medium text-[var(--text-secondary)]">yeni aday · 14 gün</p>
          <p
            className={cn(
              "text-[12px] tabular-nums",
              weekOverWeek >= 0 ? "text-[var(--success-text)]" : "text-[var(--danger-text)]",
            )}
          >
            {weekOverWeek >= 0 ? "+" : ""}
            {weekOverWeek}% önceki haftaya
          </p>
        </div>
      </div>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT_MID} stopOpacity={0.38} />
                <stop offset="100%" stopColor={ACCENT_MID} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 6" stroke={GRID} vertical={false} />
            <XAxis
              dataKey="dayLabel"
              tick={{ fill: MUTED, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: MUTED, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              content={({ active, payload }) => {
                const row = payload?.[0]?.payload as DayPoint | undefined;
                return (
                  <Tip
                    active={active}
                    label={row ? `${row.dayLabel} ${row.dayNum}` : undefined}
                    rows={
                      payload?.[0]
                        ? [{ name: "Aday", value: String(payload[0].value ?? 0) }]
                        : []
                    }
                  />
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={ACCENT}
              strokeWidth={2.4}
              fill={`url(#${fillId})`}
              activeDot={{ r: 4.5, fill: ACCENT, stroke: "var(--surface)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export type StagePoint = { stage: string; label: string; count: number };

export function PanoPipeline({ data }: { data: StagePoint[] }) {
  const open = data.filter((d) => d.stage !== "KAZANILDI" && d.stage !== "KAYBEDILDI");
  const total = open.reduce((s, d) => s + d.count, 0);
  const max = Math.max(...open.map((d) => d.count), 1);

  if (total === 0) {
    return (
      <p className="flex h-44 items-center justify-center text-[13px] text-[var(--text-muted)]">
        Açık pipeline yok
      </p>
    );
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={open} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
          <XAxis type="number" hide domain={[0, max]} />
          <YAxis
            type="category"
            dataKey="label"
            width={88}
            tick={{ fill: MUTED, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: CURSOR }}
            content={({ active, payload }) => (
              <Tip
                active={active}
                rows={
                  payload?.[0]
                    ? [
                        {
                          name: String(payload[0].payload?.label ?? ""),
                          value: `${payload[0].value ?? 0}`,
                        },
                      ]
                    : []
                }
              />
            )}
          />
          <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={14}>
            {open.map((row, i) => (
              <Cell
                key={row.stage}
                fill={ACCENT}
                fillOpacity={Math.max(0.4, 1 - i * 0.09)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type ReceivablePoint = {
  name: string;
  balanceKurus: number;
  overLimit: boolean;
};

export function PanoReceivables({ data }: { data: ReceivablePoint[] }) {
  const rows = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        short: d.name.length > 16 ? `${d.name.slice(0, 14)}…` : d.name,
        value: d.balanceKurus / 100,
      })),
    [data],
  );

  if (rows.length === 0) {
    return (
      <p className="flex h-44 items-center justify-center text-[13px] text-[var(--text-muted)]">
        Açık alacak yok
      </p>
    );
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="short"
            width={96}
            tick={{ fill: MUTED, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: CURSOR }}
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as ReceivablePoint | undefined;
              return (
                <Tip
                  active={active}
                  rows={
                    row
                      ? [{ name: row.name, value: formatMoney(money(row.balanceKurus)) }]
                      : []
                  }
                />
              );
            }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={14}>
            {rows.map((row) => (
              <Cell key={row.name} fill={row.overLimit ? DANGER : WARN} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type StockSlice = { key: string; label: string; value: number; color: string };

export function PanoDonut({
  data,
  centerLabel,
}: {
  data: StockSlice[];
  centerLabel: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <p className="flex h-44 items-center justify-center text-[13px] text-[var(--text-muted)]">
        Veri yok
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative mx-auto h-[148px] w-[148px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="70%"
              outerRadius="96%"
              paddingAngle={3}
              cornerRadius={4}
              stroke="var(--surface)"
              strokeWidth={3}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[1.35rem] font-semibold tracking-tight tabular-nums text-[var(--text-primary)]">
            {total}
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">{centerLabel}</p>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2.5">
        {data.map((d) => (
          <li key={d.key} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span className="size-2 rounded-full" style={{ background: d.color }} aria-hidden />
              {d.label}
            </span>
            <span className="font-semibold tabular-nums text-[var(--text-primary)]">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PanoChannel({
  data,
}: {
  data: { channel: string; label: string; count: number }[];
}) {
  const rows = data.filter((d) => d.count > 0);
  if (rows.length === 0) {
    return (
      <p className="flex h-40 items-center justify-center text-[13px] text-[var(--text-muted)]">
        Kanal verisi yok
      </p>
    );
  }
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 0, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 6" stroke={GRID} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: MUTED, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: MUTED, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip
            cursor={{ fill: CURSOR }}
            content={({ active, payload }) => (
              <Tip
                active={active}
                rows={
                  payload?.[0]
                    ? [
                        {
                          name: String(payload[0].payload?.label ?? ""),
                          value: String(payload[0].value ?? 0),
                        },
                      ]
                    : []
                }
              />
            )}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={32}>
            {rows.map((row, i) => (
              <Cell
                key={row.channel}
                fill={ACCENT}
                fillOpacity={Math.max(0.45, 1 - i * 0.14)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PanoActionList({
  items,
}: {
  items: {
    id: string;
    title: string;
    detail: string;
    href: string;
    cta: string;
    tone: "default" | "warn" | "danger" | "info";
    icon: PanoIconName;
  }[];
}) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-[13px] text-[var(--text-muted)]">
        Şu an bekleyen öncelik yok.
      </p>
    );
  }

  return (
    <ul className="-mx-1">
      {items.map((item) => {
        const Icon = resolveIcon(item.icon);
        return (
          <li key={item.id}>
            <Link
              href={item.href}
              aria-label={`${item.title}. ${item.cta}`}
              className="group flex items-center gap-3 rounded-xl px-1.5 py-3 transition-colors hover:bg-[var(--surface-2)]"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
                <Icon
                  className={cn(
                    "size-4",
                    item.tone === "danger" && "text-[var(--danger-text)]",
                    item.tone === "warn" && "text-[var(--warning-text)]",
                    (item.tone === "info" || item.tone === "default") &&
                      "text-[var(--text-secondary)]",
                  )}
                  aria-hidden
                />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
                    {item.title}
                  </p>
                  <span className="hidden shrink-0 text-[12px] font-medium text-[var(--text-muted)] group-hover:text-[var(--primary-text)] sm:inline">
                    {item.cta}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-[var(--text-muted)]">
                  {item.detail}
                </p>
              </div>

              <ChevronRight
                className="size-4 shrink-0 text-[var(--text-disabled)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--text-muted)]"
                aria-hidden
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function PanoQuickNav({
  links,
}: {
  links: { href: string; label: string; icon: PanoIconName }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => {
        const Icon = resolveIcon(link.icon);
        return (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 text-[13px] font-medium text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
          >
            <Icon className="size-3.5 text-[var(--primary-text)]" aria-hidden />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}