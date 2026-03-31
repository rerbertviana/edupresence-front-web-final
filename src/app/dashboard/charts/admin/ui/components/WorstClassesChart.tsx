"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";

import type { LowestAttendanceClassChartItem } from "../../domain/types";
import { ChartCard } from "@/components/ui/chart-card";
import { EmptyChartState } from "@/components/ui/empty-chart-state";
import { CustomWorstClassTick } from "./CustomWorstClassTick";

type WorstClassesChartProps = {
  data: LowestAttendanceClassChartItem[];
  isLoading: boolean;
  height: number;
};

export function WorstClassesChart({
  data,
  isLoading,
  height,
}: WorstClassesChartProps) {
  return (
    <ChartCard
      title="Ranking das piores turmas"
      className="xl:col-span-5 flex flex-col min-h-[520px]"
    >
      {isLoading ? (
        <EmptyChartState
          message="Carregando ranking..."
          className="flex-1 min-h-[420px]"
        />
      ) : data.length === 0 ? (
        <EmptyChartState
          message="Sem dados para exibir."
          className="flex-1 min-h-[420px]"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="w-full" style={{ height: `${height}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 10, right: 24, left: 0, bottom: 10 }}
                barCategoryGap={
                  data.length <= 2 ? 28 : data.length <= 4 ? 20 : 14
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={160}
                  axisLine={false}
                  tickLine={false}
                  tick={<CustomWorstClassTick />}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                  }}
                  labelFormatter={(label, payload) => {
                    const first = Array.isArray(payload)
                      ? payload[0]
                      : undefined;
                    const row = first?.payload as
                      | { fullName?: string }
                      | undefined;

                    return row?.fullName ?? String(label ?? "—");
                  }}
                  formatter={(value: any) => [`${value}%`, "Frequência"]}
                />
                <Bar
                  dataKey="rate"
                  radius={[0, 10, 10, 0]}
                  maxBarSize={
                    data.length <= 2 ? 40 : data.length <= 4 ? 34 : 28
                  }
                >
                  <LabelList
                    dataKey="rate"
                    position="right"
                    formatter={(v: any) => `${v}%`}
                    style={{
                      fill: "#334155",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  />
                  {data.map((item) => (
                    <Cell key={item.id} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
