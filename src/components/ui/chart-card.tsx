"use client";

import type { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function ChartCard({ title, children, className = "" }: ChartCardProps) {
  return (
    <section className={`rounded-2xl border border-slate-200 p-4 ${className}`}>
      <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}
