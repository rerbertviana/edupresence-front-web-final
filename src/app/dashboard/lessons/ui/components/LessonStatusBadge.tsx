"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { LessonStatus } from "../../domain/types";
import { DoorClosed, DoorOpen } from "lucide-react";

type Props = { status: LessonStatus };

export function LessonStatusBadge({ status }: Props) {
  const base =
    "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold whitespace-nowrap";

  if (status === "OPEN") {
    return (
      <span
        className={cn(
          base,
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        )}
      >
        <DoorOpen className="h-3.5 w-3.5" />
        Aberta
      </span>
    );
  }

  if (status === "CLOSED") {
    return (
      <span className={cn(base, "bg-slate-50 text-slate-700 border-slate-200")}>
        <DoorClosed className="h-3.5 w-3.5" />
        Fechada
      </span>
    );
  }

  return (
    <span className={cn(base, "bg-gray-50 text-gray-700 border-gray-200")}>
      —
    </span>
  );
}
