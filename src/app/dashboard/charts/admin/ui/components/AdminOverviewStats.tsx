"use client";

import { Activity, BadgeCheck, ClipboardList, XCircle } from "lucide-react";
import type { AdminOverviewCardData } from "../../domain/types";
import { StatCard } from "./StatCard";

type AdminOverviewStatsProps = {
  overview: AdminOverviewCardData;
};

export function AdminOverviewStats({ overview }: AdminOverviewStatsProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        title="Frequência geral"
        value={`${overview.attendanceRate}%`}
        icon={<Activity className="h-5 w-5" />}
        tone="emerald"
      />

      <StatCard
        title="Total de registros"
        value={overview.totalRecords}
        icon={<ClipboardList className="h-5 w-5" />}
        tone="slate"
      />

      <StatCard
        title="Faltas"
        value={overview.absent}
        icon={<XCircle className="h-5 w-5" />}
        tone="red"
      />

      <StatCard
        title="Justificadas"
        value={overview.justified}
        icon={<BadgeCheck className="h-5 w-5" />}
        tone="amber"
      />
    </section>
  );
}
