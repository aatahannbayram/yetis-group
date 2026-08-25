"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MOCK_WEEKLY_VOLUME } from "@/lib/yg-ops/mock-data";

export function WeeklyVolumeChart() {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={MOCK_WEEKLY_VOLUME} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--yg-text-muted)", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={36}
            tick={{ fill: "var(--yg-text-muted)", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "var(--yg-primary-subtle)" }}
            contentStyle={{
              background: "var(--yg-panel)",
              border: "1px solid var(--yg-border)",
              borderRadius: 12,
              boxShadow: "var(--yg-shadow-md)",
              color: "var(--yg-text)",
              fontSize: 13,
            }}
            formatter={(value) => [`${String(value)} kg`, "Sevk"]}
          />
          <Bar dataKey="kg" fill="var(--yg-primary)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
