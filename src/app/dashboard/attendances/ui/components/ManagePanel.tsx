"use client";

import React from "react";
import { cn } from "@/lib/utils";

import { AlertCircle, BadgeCheck, BadgeX, CheckCircle2 } from "lucide-react";

import type {
  AttendanceDTO,
  AttendanceStatus,
  LessonDTO,
} from "../../domain/types";
import { formatDateBR, formatTimeBR } from "../../helpers/helpers";

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "green" | "red" | "yellow";
}) {
  const base = "rounded-lg border p-2";
  const toneClass =
    tone === "green"
      ? "bg-emerald-50 border-emerald-200"
      : tone === "red"
        ? "bg-red-50 border-red-200"
        : tone === "yellow"
          ? "bg-amber-50 border-amber-200"
          : "bg-white border-gray-200";

  const labelClass =
    tone === "green"
      ? "text-emerald-700"
      : tone === "red"
        ? "text-red-700"
        : tone === "yellow"
          ? "text-amber-700"
          : "text-gray-500";

  return (
    <div
      tabIndex={0}
      role="status"
      aria-label={`${label}: ${value}`}
      className={cn(base, toneClass, "outline-none")}
    >
      <p className={cn("text-[11px]", labelClass)}>{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function attendanceBadge(status: AttendanceStatus) {
  const base =
    "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold whitespace-nowrap";

  if (status === "PRESENT") {
    return (
      <span
        className={cn(
          base,
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        )}
      >
        <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
        Presente
      </span>
    );
  }

  if (status === "ABSENT") {
    return (
      <span className={cn(base, "bg-red-50 text-red-700 border-red-200")}>
        <BadgeX className="h-3.5 w-3.5" aria-hidden="true" />
        Falta
      </span>
    );
  }

  if (status === "JUSTIFIED") {
    return (
      <span className={cn(base, "bg-amber-50 text-amber-700 border-amber-200")}>
        <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
        Justificada
      </span>
    );
  }

  return (
    <span className={cn(base, "bg-gray-50 text-gray-700 border-gray-200")}>
      Pendente
    </span>
  );
}

type Props = {
  compact?: boolean;
  titleRef?: React.Ref<HTMLHeadingElement>;

  selectedLesson: LessonDTO | null;
  selectedLessonId: number | null;

  isLoadingAttendances: boolean;
  isErrorAttendances: boolean;

  attendanceSearch: string;
  setAttendanceSearch: (v: string) => void;

  filteredAttendances: AttendanceDTO[];
  stats: { total: number; present: number; absent: number; justified: number };

  canEditAttendances: boolean;
  isUpdatingAttendance: boolean;

  bulkPresent: () => void;
  bulkAbsent: () => void;

  markPresent: (id: number) => void;
  markAbsent: (id: number) => void;
  markJustified: (id: number) => void;
};

export const ManagePanel = React.memo(function ManagePanel({
  compact,
  titleRef,
  selectedLesson,
  selectedLessonId,
  isLoadingAttendances,
  isErrorAttendances,
  attendanceSearch,
  setAttendanceSearch,
  filteredAttendances,
  stats,
  canEditAttendances,
  isUpdatingAttendance,
  bulkPresent,
  bulkAbsent,
  markPresent,
  markAbsent,
  markJustified,
}: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col min-h-0 overflow-hidden",
        compact && "border-0 shadow-none rounded-none",
      )}
    >
      <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-gray-600" aria-hidden="true" />
          <h2
            id="attendances-manage-title"
            ref={titleRef}
            tabIndex={0}
            className="text-sm font-semibold text-gray-800 outline-none"
          >
            Gerenciar Presenças
          </h2>
        </div>

        {selectedLesson && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">
              {formatDateBR(selectedLesson.date)} •{" "}
              {formatTimeBR(selectedLesson.startTime)}–
              {formatTimeBR(selectedLesson.endTime)}
            </span>
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex-1 min-h-0 overflow-y-auto overflow-x-hidden",
          compact && "pb-2",
        )}
      >
        <div className="p-4 space-y-3">
          {!selectedLesson && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
              Selecione uma aula para listar alunos e marcar presença/falta.
            </div>
          )}

          {selectedLesson && (
            <>
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                aria-label="Resumo das presenças"
              >
                <Stat label="Total" value={stats.total} />
                <Stat label="Presentes" value={stats.present} tone="green" />
                <Stat label="Faltas" value={stats.absent} tone="red" />
                <Stat
                  label="Justificadas"
                  value={stats.justified}
                  tone="yellow"
                />
              </div>

              <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-2">
                <input
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                  placeholder="Buscar aluno (nome / matrícula / status)..."
                  aria-label="Buscar aluno por nome, matrícula ou status"
                  disabled={!selectedLessonId}
                  className={cn(
                    "w-full h-9 rounded-md border bg-white px-3 text-sm text-gray-800 outline-none",
                    "placeholder:text-gray-400",
                    "focus:border-gray-400 focus:ring-2 focus:ring-gray-300 focus:ring-offset-0",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    "border-gray-200",
                  )}
                />

                <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2 sm:justify-end">
                  <button
                    type="button"
                    disabled={
                      !canEditAttendances ||
                      isUpdatingAttendance ||
                      filteredAttendances.length === 0
                    }
                    onClick={bulkPresent}
                    aria-label="Marcar todos como presença"
                    className={cn(
                      "h-9 w-full px-3 rounded-md border text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-2",
                      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
                      "disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
                    )}
                  >
                    <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                    Tudo Pres.
                  </button>

                  <button
                    type="button"
                    disabled={
                      !canEditAttendances ||
                      isUpdatingAttendance ||
                      filteredAttendances.length === 0
                    }
                    onClick={bulkAbsent}
                    aria-label="Marcar todos como falta"
                    className={cn(
                      "h-9 w-full px-3 rounded-md border text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-2",
                      "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
                      "disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
                    )}
                  >
                    <BadgeX className="h-4 w-4" aria-hidden="true" />
                    Tudo Falta
                  </button>
                </div>
              </div>

              {isLoadingAttendances && (
                <div className="text-xs text-gray-500">Carregando alunos.</div>
              )}

              {isErrorAttendances && (
                <div className="text-xs text-red-500">
                  Erro ao carregar alunos.
                </div>
              )}

              {!isLoadingAttendances &&
                !isErrorAttendances &&
                filteredAttendances.length > 0 && (
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="hidden sm:grid sm:grid-cols-12 sm:gap-2 bg-gray-50 px-3 py-2 text-[11px] font-semibold text-gray-600 min-w-0">
                      <div className="sm:col-span-5">Aluno</div>
                      <div className="sm:col-span-3">Status</div>
                      <div className="sm:col-span-4 flex justify-end pr-2">
                        <span className="text-[11px] font-semibold text-gray-600">
                          Ações
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {filteredAttendances.map((a) => {
                        const name = a.student?.user?.fullName ?? "—";
                        const reg = a.student?.registrationNumber ?? "—";
                        const course = a.student?.course?.name ?? "—";
                        const busy = isUpdatingAttendance;

                        return (
                          <div
                            key={a.id}
                            className={cn(
                              "px-3 py-3 bg-white min-w-0",
                              "flex flex-col gap-2",
                              "sm:grid sm:grid-cols-12 sm:items-center sm:gap-2",
                            )}
                          >
                            <div className="sm:col-span-5 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {name}
                              </p>
                              <p className="text-[11px] text-gray-500 truncate">
                                {reg} • {course}
                              </p>
                            </div>

                            <div className="sm:col-span-3">
                              <div className="flex flex-col items-start gap-1">
                                {attendanceBadge(a.status)}
                                <div className="text-[10px] text-gray-400">
                                  {a.recordType === "CHECKIN"
                                    ? "Check-in"
                                    : "Manual"}{" "}
                                  • {formatTimeBR(a.recordTime)}
                                </div>
                              </div>
                            </div>

                            <div
                              className={cn(
                                "flex flex-col gap-2 pt-2",
                                "sm:pt-0 sm:col-span-4",
                                "sm:grid sm:grid-cols-3 sm:gap-2 sm:justify-items-end",
                              )}
                            >
                              <button
                                type="button"
                                disabled={!canEditAttendances || busy}
                                onClick={() => markPresent(a.id)}
                                aria-label={`Marcar presença para ${name}`}
                                className="h-10 sm:h-9 w-full px-2 sm:px-3 rounded-md border text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-2
                                bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300
                                disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <BadgeCheck
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                                Pres.
                              </button>

                              <button
                                type="button"
                                disabled={!canEditAttendances || busy}
                                onClick={() => markAbsent(a.id)}
                                aria-label={`Marcar falta para ${name}`}
                                className="h-10 sm:h-9 w-full px-2 sm:px-3 rounded-md border text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-2
                                bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300
                                disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <BadgeX
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                                Falta
                              </button>

                              <button
                                type="button"
                                disabled={!canEditAttendances || busy}
                                onClick={() => markJustified(a.id)}
                                aria-label={`Marcar falta justificada para ${name}`}
                                className="h-10 sm:h-9 w-full px-2 sm:px-3 rounded-md border text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-2
                                bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300
                                disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <AlertCircle
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                                Just.
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {!isLoadingAttendances &&
                !isErrorAttendances &&
                selectedLesson &&
                filteredAttendances.length === 0 && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                    Nenhum aluno encontrado para esta aula (ou nenhum resultado
                    na busca).
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});
