"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BRAND_GREEN, BRAND_GREEN_LIGHT } from "@/components/admin/lead-charts";

type DayPoint = {
  date: string;
  count: number;
  dayLabel: string;
  dayNum: string;
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value?: number; payload?: DayPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-caption text-muted-foreground">
        {row ? `${row.dayLabel} ${row.dayNum}` : ""}
      </p>
      <p className="mt-0.5 text-body-sm font-semibold tabular-nums text-foreground">
        {payload[0]?.value ?? 0} aday
      </p>
    </div>
  );
}

/** 14-day CRM inflow: soft area + accent stroke */
export function LeadsTrendChart({ data }: { data: DayPoint[] }) {
  const fillId = useId();
  const total = data.reduce((s, d) => s + d.count, 0);
  const peak = Math.max(...data.map((d) => d.count), 0);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-caption font-semibold tracking-wide text-muted-foreground uppercase">
            Son 14 gün
          </p>
          <p className="mt-1 tabular-nums text-h2 leading-h2 font-bold text-foreground">
            {total}
            <span className="ml-2 text-body-sm font-medium text-muted-foreground">yeni aday</span>
          </p>
        </div>
        <div className="flex gap-4 text-caption">
          <div>
            <p className="text-muted-foreground">Zirve</p>
            <p className="font-semibold tabular-nums text-foreground">{peak}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Ort. / gün</p>
            <p className="font-semibold tabular-nums text-foreground">
              {(total / Math.max(data.length, 1)).toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#30a369" stopOpacity={0.35} />
                <stop offset="70%" stopColor="#30a369" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#30a369" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 8" stroke="#e6e1d6" vertical={false} />
            <XAxis
              dataKey="dayLabel"
              tick={{ fill: "#6b6255", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={12}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#6b6255", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              name="Aday"
              stroke="#00693e"
              strokeWidth={2.5}
              fill={`url(#${fillId})`}
              activeDot={{ r: 5, fill: "#00693e", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Horizontal stacked bars for dealer status mix */
export function DealerStatusChart({
  data,
}: {
  data: { key: string; label: string; count: number; color: string }[];
}) {
  const total = Math.max(1, data.reduce((s, d) => s + d.count, 0));

  return (
    <div className="space-y-4">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {data.map((row) => {
          if (row.count === 0) return null;
          return (
            <div
              key={row.key}
              className="h-full transition-all"
              style={{ width: `${(row.count / total) * 100}%`, backgroundColor: row.color }}
              title={`${row.label}: ${row.count}`}
            />
          );
        })}
      </div>
      <ul className="space-y-2.5">
        {data.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-body-sm text-foreground">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: row.color }}
                aria-hidden
              />
              {row.label}
            </span>
            <span className="text-body-sm font-semibold tabular-nums text-foreground">
              {row.count}
              <span className="ml-1.5 text-caption font-normal text-muted-foreground">
                %{Math.round((row.count / total) * 100)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Compact outcome bars: won vs lost */
export function OutcomeBars({
  won,
  lost,
}: {
  won: number;
  lost: number;
}) {
  if (won + lost === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-body-sm text-muted-foreground">
        Henüz kapanmış fırsat yok
      </div>
    );
  }

  const max = Math.max(won, lost, 1);
  const rows = [
    { label: "Kazanıldı", value: won, color: BRAND_GREEN },
    { label: "Kaybedildi", value: lost, color: "#c4bdb0" },
  ];

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
        >
          <XAxis type="number" hide domain={[0, max]} />
          <YAxis
            type="category"
            dataKey="label"
            width={78}
            tick={{ fill: "#6b6255", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(28, 25, 23, 0.06)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgb(63 63 70)",
              background: "rgb(24 24 27)",
              color: "rgb(250 250 250)",
              fontSize: 12,
            }}
            itemStyle={{ color: "rgb(250 250 250)" }}
            labelStyle={{ color: "rgb(161 161 170)" }}
          />
          <Bar dataKey="value" name="Adet" radius={[0, 10, 10, 0]} maxBarSize={22}>
            {rows.map((row) => (
              <Cell key={row.label} fill={row.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export { BRAND_GREEN_LIGHT };
