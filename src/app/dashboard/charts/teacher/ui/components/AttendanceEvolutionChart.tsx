"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import type { AttendanceTimeSeriesChartItem } from "../../domain/types";
import { ChartCard } from "@/components/ui/chart-card";
import { EmptyChartState } from "@/components/ui/empty-chart-state";

type AttendanceEvolutionChartProps = {
  data: AttendanceTimeSeriesChartItem[];
  isLoading: boolean;
};

export function AttendanceEvolutionChart({
  data,
  isLoading,
}: AttendanceEvolutionChartProps) {
  return (
    <ChartCard title="Evolução da presença">
      {isLoading ? (
        <EmptyChartState message="Carregando gráfico..." />
      ) : data.length === 0 ? (
        <EmptyChartState message="Sem dados para exibir." />
      ) : (
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={{ stroke: "#cbd5e1" }}
              />

              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                width={40}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={{ stroke: "#cbd5e1" }}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                }}
                labelFormatter={(label, payload) => {
                  const first = Array.isArray(payload) ? payload[0] : undefined;
                  const row = first?.payload as
                    | { fullLabel?: string }
                    | undefined;

                  return row?.fullLabel ?? String(label ?? "—");
                }}
                formatter={(v: any) => [`${v}%`, "Presença"]}
              />

              <Line
                type="monotone"
                dataKey="rate"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
