"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

import {
  CalendarDays,
  Clock3,
  BookOpen,
  X,
  Loader2,
  CheckCheck,
} from "lucide-react";

import type { PendingAttendanceDTO } from "@/hooks/usePendingAttendances";
import { formatDateBR, formatTimeBR, formatDateTimeBR } from "./helpers";

type AttendanceStatus = "PRESENT" | "ABSENT";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pendingAttendances: PendingAttendanceDTO[];
};

export function PendingAttendancesPanel({
  open,
  onOpenChange,
  pendingAttendances,
}: Props) {
  const queryClient = useQueryClient();

  const [queue, setQueue] = useState<PendingAttendanceDTO[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQueue(pendingAttendances);
  }, [open, pendingAttendances]);

  const hasItems = queue.length > 0;
  const canBulkAccept = queue.length > 1;

  const headerCountLabel = useMemo(() => {
    return `Solicitações pendentes (${queue.length})`;
  }, [queue.length]);

  async function invalidateRelatedQueries() {
    await queryClient.invalidateQueries({ queryKey: ["pending-attendances"] });

    await queryClient.invalidateQueries({
      predicate: (q) =>
        Array.isArray(q.queryKey) && q.queryKey[0] === "attendances",
    });

    await queryClient.invalidateQueries({
      predicate: (q) =>
        Array.isArray(q.queryKey) && q.queryKey[0] === "lessons",
    });
  }

  const mutation = useMutation({
    mutationFn: async (payload: {
      attendanceId: number;
      status: AttendanceStatus;
    }) => {
      const { attendanceId, status } = payload;
      await api.put(`/attendances/${attendanceId}`, { status });
    },

    onMutate: async ({ attendanceId }) => {
      await queryClient.cancelQueries({ queryKey: ["pending-attendances"] });

      const previous =
        queryClient.getQueryData<PendingAttendanceDTO[]>([
          "pending-attendances",
        ]) ?? [];

      queryClient.setQueryData<PendingAttendanceDTO[]>(
        ["pending-attendances"],
        (old) => (old ?? []).filter((a) => a.id !== attendanceId),
      );

      setQueue((prev) => prev.filter((a) => a.id !== attendanceId));

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["pending-attendances"], ctx.previous);
        setQueue(ctx.previous);
      }
    },

    onSettled: async () => {
      await invalidateRelatedQueries();
    },
  });

  const isBusy = mutation.isPending || bulkLoading;

  function handleClose() {
    onOpenChange(false);
  }

  function handleDecision(attendanceId: number, status: AttendanceStatus) {
    if (isBusy) return;
    mutation.mutate({ attendanceId, status });
  }

  async function handleAcceptAll() {
    if (!queue.length || isBusy) return;

    setBulkLoading(true);
    const snapshot = queue;

    try {
      await queryClient.cancelQueries({ queryKey: ["pending-attendances"] });

      setQueue([]);
      queryClient.setQueryData(["pending-attendances"], []);

      await Promise.allSettled(
        snapshot.map((a) =>
          api.put(`/attendances/${a.id}`, { status: "PRESENT" }),
        ),
      );
    } finally {
      setBulkLoading(false);
      await invalidateRelatedQueries();
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[79]" onClick={handleClose} />

      <div
        className={cn(
          "fixed z-[80]",
          "top-[76px] md:top-[84px]",

          "left-1/2 -translate-x-1/2 w-[92%] max-w-[360px]",

          "md:left-auto md:translate-x-0 md:right-6 md:w-[420px]",
        )}
      >
        <div
          className={cn(
            "flex flex-col overflow-hidden",
            "rounded-xl border border-slate-800",
            "bg-slate-900/95 backdrop-blur-md shadow-2xl",
            "max-h-[70vh]",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="text-sm font-semibold text-white">
              {headerCountLabel}
            </div>

            <button
              onClick={handleClose}
              className="h-7 w-7 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
            >
              <X className="h-4 w-4 text-slate-300" />
            </button>
          </div>

          {canBulkAccept && (
            <div className="px-4 py-3 border-b border-slate-800">
              <button
                onClick={handleAcceptAll}
                disabled={isBusy}
                className={cn(
                  "w-full h-9 rounded-md",
                  "bg-emerald-500 hover:bg-emerald-600",
                  "text-sm font-semibold text-white",
                  "flex items-center justify-center gap-2",
                )}
              >
                {bulkLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Aceitando...
                  </>
                ) : (
                  <>
                    <CheckCheck className="h-4 w-4" />
                    Aceitar todas
                  </>
                )}
              </button>
            </div>
          )}

          <div className="overflow-y-auto">
            {!hasItems && (
              <div className="p-4 text-xs text-slate-400">
                Nenhuma solicitação pendente.
              </div>
            )}

            {queue.map((item) => (
              <div
                key={item.id}
                className="px-4 py-3 border-b border-slate-800 space-y-2"
              >
                <p className="text-sm font-semibold text-white">
                  {item.student?.user?.fullName ?? "Aluno"}
                </p>

                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    {formatDateBR(item.lesson?.date)} ·{" "}
                    {formatTimeBR(item.lesson?.startTime)} –{" "}
                    {formatTimeBR(item.lesson?.endTime)}
                  </div>

                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    {item.lesson?.classSubject?.subject?.name ?? "—"} —{" "}
                    {item.lesson?.classSubject?.class?.course?.name ?? "—"}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatDateTimeBR(item.recordTime)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleDecision(item.id, "ABSENT")}
                    className="h-8 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                  >
                    Recusar
                  </button>

                  <button
                    onClick={() => handleDecision(item.id, "PRESENT")}
                    className="h-8 rounded-md bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold text-white"
                  >
                    Aceitar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-2 text-[11px] text-slate-400">
            As alterações são aplicadas imediatamente.
          </div>
        </div>
      </div>
    </>
  );
}
