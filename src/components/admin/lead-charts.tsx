"use client";

import { useId } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BRAND_GREEN = "#008a43";
const BRAND_GREEN_LIGHT = "#a3edc3";
const CHANNEL_COLORS = ["#00693e", "#008a43", "#30a369", "#6fdda0"];

/** Diagonal-stripe texture for de-emphasized/lost data - a muted alternative
 * to a flat gray fill, matching the Sphere UI reference's hatch-pattern bars. */
function HatchPatternDefs({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
        <rect width="6" height="6" fill="var(--neutral-100)" />
        <line x1="0" y1="0" x2="0" y2="6" stroke="var(--neutral-300)" strokeWidth="2" />
      </pattern>
    </defs>
  );
}

function PeakLabel({
  x,
  y,
  width,
  value,
  total,
}: {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  value?: unknown;
  total: number;
}) {
  if (x === undefined || y === undefined || width === undefined || value == null) return null;
  const numX = Number(x);
  const numY = Number(y);
  const numWidth = Number(width);
  const numValue = Number(value);
  const percent = total > 0 ? Math.round((numValue / total) * 100) : 0;
  const cx = numX + numWidth / 2;
  return (
    <g transform={`translate(${cx}, ${numY - 14})`}>
      <rect x={-20} y={-12} width={40} height={22} rx={11} fill={BRAND_GREEN} />
      <text x={0} y={4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#ffffff">
        {percent}%
      </text>
    </g>
  );
}

export function StageFunnelChart({
  data,
}: {
  data: { stage: string; label: string; count: number }[];
}) {
  const hatchId = useId();
  const gradientId = useId();
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 28, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00693e" />
              <stop offset="100%" stopColor="#30a369" />
            </linearGradient>
          </defs>
          <HatchPatternDefs id={hatchId} />
          <CartesianGrid strokeDasharray="4 6" stroke="#e6e1d6" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#6b6255", fontSize: 11 }}
            axisLine={{ stroke: "#e6e1d6" }}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#6b6255", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ fill: "rgba(28, 25, 23, 0.06)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgb(63 63 70)",
              background: "rgb(24 24 27)",
              color: "rgb(250 250 250)",
              boxShadow: "0 8px 24px rgb(24 24 27 / 0.35)",
              fontSize: 12,
            }}
            itemStyle={{ color: "rgb(250 250 250)" }}
            labelStyle={{ color: "rgb(161 161 170)" }}
          />
          <Bar dataKey="count" name="Bayi Adayı" radius={[20, 20, 20, 20]} maxBarSize={28}>
            {data.map((entry) => {
              const isPeak = entry.count === maxCount && entry.count > 0;
              return (
                <Cell
                  key={entry.stage}
                  fill={
                    entry.stage === "KAYBEDILDI"
                      ? `url(#${hatchId})`
                      : isPeak
                        ? `url(#${gradientId})`
                        : BRAND_GREEN_LIGHT
                  }
                />
              );
            })}
            <LabelList
              dataKey="count"
              content={(props) => {
                const entry = data[props.index ?? -1];
                if (!entry || entry.count !== maxCount || entry.count === 0) return null;
                return <PeakLabel {...props} total={total} />;
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChannelDistributionChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  const filtered = data.filter((d) => d.count > 0);

  if (filtered.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-body-sm text-neutral-400">
        Henüz veri yok
      </div>
    );
  }

  const total = filtered.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <div className="flex items-center gap-5">
      <ul className="flex flex-1 flex-col gap-2.5">
        {filtered.map((entry, index) => (
          <li
            key={entry.label}
            className="flex items-center justify-between gap-3 border-b border-border pb-2"
          >
            <span className="flex items-center gap-2 text-body-sm text-foreground">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CHANNEL_COLORS[index % CHANNEL_COLORS.length] }}
                aria-hidden
              />
              {entry.label}
            </span>
            <span className="tabular-nums text-body-sm font-semibold text-foreground">
              {entry.count}
            </span>
          </li>
        ))}
      </ul>
      <div className="relative size-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filtered}
              dataKey="count"
              nameKey="label"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={4}
              cornerRadius={8}
              strokeWidth={0}
            >
              {filtered.map((entry, index) => (
                <Cell key={entry.label} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgb(63 63 70)",
                background: "rgb(24 24 27)",
                color: "rgb(250 250 250)",
                boxShadow: "0 8px 24px rgb(24 24 27 / 0.35)",
                fontSize: 12,
              }}
              itemStyle={{ color: "rgb(250 250 250)" }}
              labelStyle={{ color: "rgb(161 161 170)" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular-nums text-h3 leading-h3 font-bold text-foreground">
            {total}
          </span>
          <span className="text-caption text-muted-foreground">Toplam</span>
        </div>
      </div>
    </div>
  );
}

export { BRAND_GREEN, BRAND_GREEN_LIGHT };
