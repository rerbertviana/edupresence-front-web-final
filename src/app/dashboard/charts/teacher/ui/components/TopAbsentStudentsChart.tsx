"use client";

import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";

import type { AbsentRankingItem } from "../../domain/types";
import { ChartCard } from "@/components/ui/chart-card";
import { EmptyChartState } from "@/components/ui/empty-chart-state";

type TopAbsentStudentsChartProps = {
  data: AbsentRankingItem[];
  totalAbsences: number;
  isLoading: boolean;
};

export function TopAbsentStudentsChart({
  data,
  totalAbsences,
  isLoading,
}: TopAbsentStudentsChartProps) {
  return (
    <ChartCard title="Alunos com mais faltas">
      {isLoading ? (
        <EmptyChartState message="Carregando gráfico..." />
      ) : data.length === 0 ? (
        <EmptyChartState message="Sem dados de faltas." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="absent"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                  }}
                  formatter={(v: any) => [v, "Faltas"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">
                Total de faltas
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {totalAbsences}
              </p>
            </div>

            <div className="space-y-3">
              {data.map((item) => {
                const percentage =
                  totalAbsences > 0
                    ? Math.round((item.absent / totalAbsences) * 100)
                    : 0;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.absent} faltas
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-sm font-semibold text-slate-700">
                      {percentage}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
