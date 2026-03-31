"use client";

import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  tone: "emerald" | "red" | "amber" | "slate";
};

export function StatCard({ title, value, icon, tone }: StatCardProps) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-50 border-emerald-100"
      : tone === "red"
        ? "bg-rose-50 border-rose-100"
        : tone === "amber"
          ? "bg-amber-50 border-amber-100"
          : "bg-slate-50 border-slate-200";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div className="rounded-xl bg-white/80 p-2 text-slate-700 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}
