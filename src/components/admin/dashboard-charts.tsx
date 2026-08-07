"use client";

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
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format/money";
import { money } from "@/domain/money";

const MUTED = "#6b6255";
const GRID = "#ebe6dc";
const GREEN = "#00693e";
const GREEN_MID = "#30a369";
const GREEN_SOFT = "#45c980";
const INFO = "#1f5fb8";
const WARN = "#b4650a";
const DANGER = "#c02626";
const NEUTRAL = "#8a8172";

export function ChartPanel({
  title,
  subtitle,
  aside,
  children,
  className,
  accent,
}: {
  title: string;
  subtitle?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Soft top wash */
  accent?: "green" | "warm" | "cool" | "none";
}) {
  return (
    <section
      className={cn(
        "group/panel relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-[box-shadow,border-color] duration-[var(--motion-hover)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]",
        className,
      )}
    >
      {accent && accent !== "none" ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-24 opacity-90",
            accent === "green" &&
              "bg-[radial-gradient(120%_80%_at_0%_0%,color-mix(in_srgb,var(--brand-500)_18%,transparent),transparent_70%)]",
            accent === "warm" &&
              "bg-[radial-gradient(120%_80%_at_100%_0%,color-mix(in_srgb,var(--warning-solid)_14%,transparent),transparent_70%)]",
            accent === "cool" &&
              "bg-[radial-gradient(120%_80%_at_0%_0%,color-mix(in_srgb,var(--info-solid)_14%,transparent),transparent_70%)]",
          )}
        />
      ) : null}
      <header className="relative mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-[length:var(--text-caption)] text-[var(--text-muted)]">
              {subtitle}
            </p>
          ) : null}
        </div>
        {aside}
      </header>
      <div className="relative min-h-0 flex-1">{children}</div>
    </section>
  );
}

function SoftTooltip({
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
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]/95 px-3 py-2 shadow-[var(--shadow-md)] backdrop-blur-sm">
      {label ? (
        <p className="text-[length:var(--text-caption)] text-[var(--text-muted)]">{label}</p>
      ) : null}
      <ul className="mt-1 space-y-0.5">
        {rows.map((r) => (
          <li
            key={r.name}
            className="flex items-center gap-2 text-[length:var(--text-body)] font-semibold tabular-nums text-[var(--text-primary)]"
          >
            {r.color ? (
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: r.color }}
                aria-hidden
              />
            ) : null}
            <span className="font-medium text-[var(--text-secondary)]">{r.name}</span>
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

export function DashboardLeadTrend({
  data,
  weekOverWeek,
}: {
  data: DayPoint[];
  weekOverWeek: number;
}) {
  const fillId = useId();
  const strokeId = useId();
  const total = data.reduce((s, d) => s + d.count, 0);
  const peak = Math.max(...data.map((d) => d.count), 0);
  const wowLabel =
    weekOverWeek === 0
      ? "Haftalık değişim yok"
      : weekOverWeek > 0
        ? `+${weekOverWeek}% önceki 7 güne göre`
        : `${weekOverWeek}% önceki 7 güne göre`;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap items-end gap-6">
        <div>
          <p className="text-[2.25rem] font-semibold tracking-[-0.03em] tabular-nums text-[var(--text-primary)]">
            {total}
            <span className="ml-2 text-[length:var(--text-body)] font-medium text-[var(--text-muted)]">
              yeni aday
            </span>
          </p>
          <p className="mt-1 text-[length:var(--text-caption)] text-[var(--text-muted)]">
            {wowLabel}
          </p>
        </div>
        <div className="ml-auto flex gap-5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-[length:var(--text-caption)]">
          <div>
            <p className="text-[var(--text-muted)]">Zirve</p>
            <p className="font-semibold tabular-nums text-[var(--text-primary)]">{peak}</p>
          </div>
          <div className="w-px bg-[var(--border)]" aria-hidden />
          <div>
            <p className="text-[var(--text-muted)]">Ort. / gün</p>
            <p className="font-semibold tabular-nums text-[var(--text-primary)]">
              {(total / Math.max(data.length, 1)).toFixed(1)}
            </p>
          </div>
        </div>
      </div>
      <div className="h-[228px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GREEN_MID} stopOpacity={0.42} />
                <stop offset="45%" stopColor={GREEN_SOFT} stopOpacity={0.12} />
                <stop offset="100%" stopColor={GREEN_MID} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={GREEN} />
                <stop offset="100%" stopColor={GREEN_MID} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 8" stroke={GRID} vertical={false} />
            <XAxis
              dataKey="dayLabel"
              tick={{ fill: MUTED, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={10}
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
                  <SoftTooltip
                    active={active}
                    label={row ? `${row.dayLabel} ${row.dayNum}` : undefined}
                    rows={
                      payload?.[0]
                        ? [{ name: "Aday", value: String(payload[0].value ?? 0), color: GREEN }]
                        : []
                    }
                  />
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={`url(#${strokeId})`}
              strokeWidth={2.75}
              fill={`url(#${fillId})`}
              activeDot={{ r: 5, fill: GREEN, stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export type StagePoint = { stage: string; label: string; count: number };

export function DashboardPipelineBars({ data }: { data: StagePoint[] }) {
  const open = data.filter((d) => d.stage !== "KAZANILDI" && d.stage !== "KAYBEDILDI");
  const max = Math.max(...open.map((d) => d.count), 1);
  const total = open.reduce((s, d) => s + d.count, 0);
  const palette = [GREEN, GREEN_MID, GREEN_SOFT, "#0f7a8a", INFO, WARN, NEUTRAL];

  if (total === 0) {
    return (
      <p className="flex h-48 items-center justify-center text-[length:var(--text-body)] text-[var(--text-muted)]">
        Açık pipeline boş
      </p>
    );
  }

  return (
    <div className="h-[268px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={open}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 8" stroke={GRID} horizontal={false} />
          <XAxis type="number" hide domain={[0, max]} />
          <YAxis
            type="category"
            dataKey="label"
            width={92}
            tick={{ fill: MUTED, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-2)" }}
            content={({ active, payload }) => (
              <SoftTooltip
                active={active}
                rows={
                  payload?.[0]
                    ? [
                        {
                          name: String(payload[0].payload?.label ?? ""),
                          value: `${payload[0].value ?? 0} aday`,
                          color: GREEN_MID,
                        },
                      ]
                    : []
                }
              />
            )}
          />
          <Bar dataKey="count" radius={[0, 10, 10, 0]} maxBarSize={15}>
            {open.map((row, i) => (
              <Cell key={row.stage} fill={palette[i % palette.length]} />
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

export function DashboardReceivables({ data }: { data: ReceivablePoint[] }) {
  const rows = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        short: d.name.length > 18 ? `${d.name.slice(0, 16)}…` : d.name,
        value: d.balanceKurus / 100,
      })),
    [data],
  );

  if (rows.length === 0) {
    return (
      <p className="flex h-48 items-center justify-center text-[length:var(--text-body)] text-[var(--text-muted)]">
        Açık alacak yok
      </p>
    );
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 8" stroke={GRID} horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="short"
            width={100}
            tick={{ fill: MUTED, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-2)" }}
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload as ReceivablePoint | undefined;
              return (
                <SoftTooltip
                  active={active}
                  rows={
                    row
                      ? [
                          {
                            name: row.name,
                            value: formatMoney(money(row.balanceKurus)),
                            color: row.overLimit ? DANGER : WARN,
                          },
                        ]
                      : []
                  }
                />
              );
            }}
          />
          <Bar dataKey="value" radius={[0, 10, 10, 0]} maxBarSize={16}>
            {rows.map((row) => (
              <Cell key={row.name} fill={row.overLimit ? DANGER : WARN} fillOpacity={0.88} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type StockSlice = { key: string; label: string; value: number; color: string };

export function DashboardStockDonut({ data }: { data: StockSlice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <p className="flex h-48 items-center justify-center text-[length:var(--text-body)] text-[var(--text-muted)]">
        Lot kaydı yok
      </p>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative mx-auto h-[176px] w-full max-w-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="64%"
              outerRadius="90%"
              paddingAngle={3}
              cornerRadius={4}
              stroke="var(--surface)"
              strokeWidth={3}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => (
                <SoftTooltip
                  active={active}
                  rows={
                    payload?.[0]
                      ? [
                          {
                            name: String(payload[0].name),
                            value: `${payload[0].value ?? 0} lot`,
                            color: String(payload[0].payload?.color ?? NEUTRAL),
                          },
                        ]
                      : []
                  }
                />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[1.6rem] font-semibold tracking-tight tabular-nums text-[var(--text-primary)]">
            {total}
          </p>
          <p className="text-[length:var(--text-caption)] text-[var(--text-muted)]">lot</p>
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {data.map((d) => (
          <li
            key={d.key}
            className="flex items-center justify-between gap-2 text-[length:var(--text-body)]"
          >
            <span className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: d.color }}
                aria-hidden
              />
              {d.label}
            </span>
            <span className="font-semibold tabular-nums text-[var(--text-primary)]">
              {d.value}
              <span className="ml-1.5 text-[length:var(--text-caption)] font-normal text-[var(--text-muted)]">
                %{Math.round((d.value / total) * 100)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DashboardOutcomeDonut({ won, lost }: { won: number; lost: number }) {
  const data = [
    { key: "won", label: "Kazanıldı", value: won, color: GREEN_MID },
    { key: "lost", label: "Kaybedildi", value: lost, color: NEUTRAL },
  ].filter((d) => d.value > 0);
  const closed = won + lost;
  const rate = closed > 0 ? Math.round((won / closed) * 100) : 0;

  if (closed === 0) {
    return (
      <p className="flex h-40 items-center justify-center text-[length:var(--text-body)] text-[var(--text-muted)]">
        Kapanmış fırsat yok
      </p>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative mx-auto h-[168px] w-full max-w-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="66%"
              outerRadius="92%"
              paddingAngle={3}
              cornerRadius={4}
              stroke="var(--surface)"
              strokeWidth={3}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => (
                <SoftTooltip
                  active={active}
                  rows={
                    payload?.[0]
                      ? [
                          {
                            name: String(payload[0].name),
                            value: String(payload[0].value ?? 0),
                            color: String(payload[0].payload?.color ?? NEUTRAL),
                          },
                        ]
                      : []
                  }
                />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[1.5rem] font-semibold tracking-tight tabular-nums text-[var(--text-primary)]">
            %{rate}
          </p>
          <p className="text-[length:var(--text-caption)] text-[var(--text-muted)]">kazanma</p>
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-5 text-[length:var(--text-caption)]">
        <span className="inline-flex items-center gap-1.5 tabular-nums text-[var(--success-text)]">
          <span className="size-1.5 rounded-full bg-[var(--success-solid)]" aria-hidden />
          {won} kazanıldı
        </span>
        <span className="inline-flex items-center gap-1.5 tabular-nums text-[var(--text-muted)]">
          <span className="size-1.5 rounded-full bg-[var(--neutral-solid)]" aria-hidden />
          {lost} kaybedildi
        </span>
      </div>
    </div>
  );
}

export function DashboardChannelBars({
  data,
}: {
  data: { channel: string; label: string; count: number }[];
}) {
  const rows = data.filter((d) => d.count > 0);
  const colors = [GREEN, GREEN_MID, INFO, WARN, "#0f7a8a", NEUTRAL];

  if (rows.length === 0) {
    return (
      <p className="flex h-40 items-center justify-center text-[length:var(--text-body)] text-[var(--text-muted)]">
        Kanal verisi yok
      </p>
    );
  }

  return (
    <div className="h-[208px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 8" stroke={GRID} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: MUTED, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-12}
            textAnchor="end"
            height={48}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: MUTED, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-2)" }}
            content={({ active, payload }) => (
              <SoftTooltip
                active={active}
                rows={
                  payload?.[0]
                    ? [
                        {
                          name: String(payload[0].payload?.label ?? ""),
                          value: `${payload[0].value ?? 0}`,
                          color: GREEN,
                        },
                      ]
                    : []
                }
              />
            )}
          />
          <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={34}>
            {rows.map((row, i) => (
              <Cell key={row.channel} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
