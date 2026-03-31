"use client";

import React, { useEffect, useRef } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { cn } from "@/lib/utils";

import { Switch } from "@/components/ui/switch";
import { Toast } from "@/components/ui/toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import {
  CalendarDays,
  ClipboardList,
  Clock3,
  GraduationCap,
  CloudSun,
  Sun,
  Moon,
  DoorOpen,
  DoorClosed,
} from "lucide-react";

import { ManagePanel } from "./components/ManagePanel";
import { useAttendancesController } from "../controller/useAttendancesController";
import {
  formatDateBR,
  formatTimeBR,
  isLessonExpired,
  shiftLabel,
  shiftPillClass,
} from "../helpers/helpers";

function ShiftIcon({ shift }: { shift: string }) {
  if (shift === "MORNING") {
    return <CloudSun className="h-4 w-4" aria-hidden="true" />;
  }
  if (shift === "AFTERNOON") {
    return <Sun className="h-4 w-4" aria-hidden="true" />;
  }
  if (shift === "NIGHT") {
    return <Moon className="h-4 w-4" aria-hidden="true" />;
  }
  return <CloudSun className="h-4 w-4" aria-hidden="true" />;
}

function lessonStatusBadge(status: string) {
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
        <DoorOpen className="h-3.5 w-3.5" aria-hidden="true" />
        Aberta
      </span>
    );
  }

  if (status === "CLOSED") {
    return (
      <span className={cn(base, "bg-slate-50 text-slate-700 border-slate-200")}>
        <DoorClosed className="h-3.5 w-3.5" aria-hidden="true" />
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

export function AttendancesView() {
  const c = useAttendancesController();

  const classesTitleRef = useRef<HTMLHeadingElement | null>(null);
  const lessonsTitleRef = useRef<HTMLHeadingElement | null>(null);
  const manageTitleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    c.startPageFocus();
  }, [c, c.startPageFocus]);

  useEffect(() => {
    if (c.focusTarget === "classes") {
      classesTitleRef.current?.focus();
      c.clearFocusTarget();
    }
  }, [c.focusTarget, c.clearFocusTarget, c]);

  useEffect(() => {
    if (c.focusTarget === "lessons") {
      lessonsTitleRef.current?.focus();
      c.clearFocusTarget();
    }
  }, [c.focusTarget, c.clearFocusTarget, c]);

  useEffect(() => {
    if (c.focusTarget === "manage") {
      manageTitleRef.current?.focus();
      c.clearFocusTarget();
    }
  }, [c.focusTarget, c.clearFocusTarget, c]);

  if (!c.enabledBase) {
    return (
      <DashboardShell autoFocusMain={false}>
        <div className="w-full h-full min-h-0 overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100 flex items-center justify-center p-6">
          <div className="text-sm text-gray-600">
            Você precisa estar logado como <b>Professor</b> para acessar esta
            página.
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell autoFocusMain={false}>
      <div
        className="sr-only"
        role="status"
        aria-live="assertive"
        aria-atomic="true"
      >
        {c.liveMessage}
      </div>

      <div className="w-full h-full min-h-0 overflow-hidden">
        <div className="w-full h-full min-h-0 overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100 flex flex-col">
          {c.toast && (
            <Toast
              message={c.toast.message}
              type={c.toast.type}
              onClose={() => c.setToast(null)}
            />
          )}

          {!c.isLg && (
            <Sheet open={c.attendanceOpen} onOpenChange={c.setAttendanceOpen}>
              <SheetContent
                side="bottom"
                className="p-0"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <SheetHeader className="px-4 py-3 border-b border-gray-100">
                  <SheetTitle
                    className="text-sm font-semibold text-gray-800"
                    tabIndex={0}
                  >
                    Gerenciar Presenças
                  </SheetTitle>
                  <SheetDescription className="text-xs text-gray-500">
                    Marcar presença/falta (mesmo com aula fechada).
                  </SheetDescription>
                </SheetHeader>

                <div className="max-h-[80vh] overflow-y-auto">
                  <ManagePanel
                    compact
                    titleRef={manageTitleRef}
                    selectedLesson={c.selectedLesson}
                    selectedLessonId={c.selectedLessonId}
                    isLoadingAttendances={c.isLoadingAttendances}
                    isErrorAttendances={c.isErrorAttendances}
                    attendanceSearch={c.attendanceSearch}
                    setAttendanceSearch={c.setAttendanceSearch}
                    filteredAttendances={c.filteredAttendances}
                    stats={c.stats}
                    canEditAttendances={c.canEditAttendances}
                    isUpdatingAttendance={c.isUpdatingAttendance}
                    bulkPresent={c.bulkPresent}
                    bulkAbsent={c.bulkAbsent}
                    markPresent={c.markPresent}
                    markAbsent={c.markAbsent}
                    markJustified={c.markJustified}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}

          <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Presenças</h1>
              <p className="text-xs text-gray-500">
                Turma → Aula → Marcar presença/falta
              </p>
            </div>

            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold",
                shiftPillClass(c.selectedShift),
              )}
              aria-label={`Turno ${shiftLabel(c.selectedShift)}`}
            >
              <ShiftIcon shift={c.selectedShift} />
              {shiftLabel(c.selectedShift)}
            </span>
          </div>

          <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
            <div
              className="lg:col-span-3 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col min-h-0 overflow-hidden"
              aria-labelledby="attendances-classes-title"
            >
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <GraduationCap
                    className="h-4 w-4 text-gray-600"
                    aria-hidden="true"
                  />
                  <h2
                    id="attendances-classes-title"
                    ref={classesTitleRef}
                    tabIndex={-1}
                    className="text-sm font-semibold text-gray-800 outline-none"
                  >
                    Turmas
                  </h2>
                </div>
                <span className="text-xs text-gray-500">
                  {c.filteredClassSubjects.length} itens
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 min-h-0 overflow-y-auto">
                <input
                  value={c.classSearch}
                  onChange={(e) => c.setClassSearch(e.target.value)}
                  placeholder="Buscar turma..."
                  aria-label="Buscar turma"
                  className={cn(
                    "w-full h-9 rounded-md border bg-white px-3 text-sm text-gray-800 outline-none",
                    "placeholder:text-gray-400",
                    "focus:border-gray-400 focus:ring-2 focus:ring-gray-300 focus:ring-offset-0",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    "border-gray-200",
                  )}
                />

                {c.isLoadingClasses && (
                  <div className="text-xs text-gray-500">Carregando...</div>
                )}
                {c.isErrorClasses && (
                  <div className="text-xs text-red-500">
                    Erro ao carregar turmas.
                  </div>
                )}

                {!c.isLoadingClasses &&
                  !c.isErrorClasses &&
                  c.filteredClassSubjects.length === 0 && (
                    <div className="text-xs text-gray-500">
                      Nenhuma turma encontrada.
                    </div>
                  )}

                <div className="space-y-2">
                  {c.filteredClassSubjects.map((cs) => {
                    const isActive = cs.id === c.selectedClassSubjectId;
                    const courseName =
                      cs.class?.course?.name ?? "Curso não informado";
                    const subjectName =
                      cs.subject?.name ?? "Disciplina não informada";
                    const semester =
                      cs.class?.semester ?? "Semestre não informado";
                    const shift = shiftLabel(cs.class?.shift ?? "MORNING");

                    return (
                      <button
                        key={cs.id}
                        type="button"
                        onClick={() => c.handleSelectClassSubject(cs)}
                        aria-label={`${courseName}, disciplina ${subjectName}, semestre ${semester}, turno ${shift}`}
                        aria-pressed={isActive}
                        className={cn(
                          "w-full rounded-lg border px-3 py-3 text-left transition outline-none focus:outline-none focus:ring-0",
                          isActive
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold",
                            shiftPillClass(cs.class?.shift ?? "MORNING"),
                          )}
                        >
                          <ShiftIcon shift={cs.class?.shift ?? "MORNING"} />
                          {shift}
                        </span>

                        <div className="mt-2 font-semibold text-gray-800 text-sm truncate">
                          {courseName}
                        </div>

                        <div className="text-xs text-gray-600 truncate mt-1">
                          <span className="font-semibold">Disciplina:</span>{" "}
                          {subjectName}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          Semestre: {semester}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className="lg:col-span-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col min-h-0 overflow-hidden"
              aria-labelledby="attendances-lessons-title"
            >
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    className="h-4 w-4 text-gray-600"
                    aria-hidden="true"
                  />
                  <h2
                    id="attendances-lessons-title"
                    ref={lessonsTitleRef}
                    tabIndex={-1}
                    className="text-sm font-semibold text-gray-800 outline-none"
                  >
                    Aulas agendadas
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Todas</span>
                  <Switch
                    checked={c.checked}
                    onCheckedChange={c.setChecked}
                    aria-label="Mostrar todas as aulas"
                  />
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 min-h-0 overflow-y-auto">
                <input
                  value={c.lessonSearch}
                  onChange={(e) => c.setLessonSearch(e.target.value)}
                  placeholder={
                    !c.selectedClassSubjectId
                      ? "Selecione uma turma..."
                      : "Buscar aula..."
                  }
                  aria-label={
                    !c.selectedClassSubjectId
                      ? "Selecione uma turma para habilitar a busca de aulas"
                      : "Buscar aula"
                  }
                  disabled={!c.selectedClassSubjectId}
                  className={cn(
                    "w-full h-9 rounded-md border bg-white px-3 text-sm text-gray-800 outline-none",
                    "placeholder:text-gray-400",
                    "focus:border-gray-400 focus:ring-2 focus:ring-gray-300 focus:ring-offset-0",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    "border-gray-200",
                  )}
                />

                {!c.selectedClassSubjectId && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                    Selecione uma turma para ver as aulas.
                  </div>
                )}

                {c.selectedClassSubjectId && c.isLoadingLessons && (
                  <div className="text-xs text-gray-500">
                    Carregando aulas...
                  </div>
                )}
                {c.selectedClassSubjectId && c.isErrorLessons && (
                  <div className="text-xs text-red-500">
                    Erro ao carregar aulas.
                  </div>
                )}

                {c.selectedClassSubjectId &&
                  !c.isLoadingLessons &&
                  !c.isErrorLessons &&
                  c.filteredLessons.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                      Nenhuma aula encontrada para esta turma.
                    </div>
                  )}

                <div className="space-y-2">
                  {c.filteredLessons.map((lesson) => {
                    const isActive = lesson.id === c.selectedLessonId;
                    const expired = isLessonExpired(lesson);
                    const isOpen = lesson.status === "OPEN";

                    const disableStatusSwitch =
                      c.isUpdatingAttendance || (expired && !isOpen);

                    const dateLabel = formatDateBR(lesson.date);
                    const timeLabel = `${formatTimeBR(
                      lesson.startTime,
                    )} – ${formatTimeBR(lesson.endTime)}`;

                    return (
                      <div
                        key={lesson.id}
                        className={cn(
                          "w-full rounded-lg border px-3 py-3 transition",
                          isActive
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300",
                          expired && !isActive ? "opacity-60" : "",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => c.handleSelectLesson(lesson)}
                            aria-label={`Selecionar aula em ${dateLabel}, horário ${timeLabel}, status ${isOpen ? "aberta" : "fechada"}${expired ? ", aula já passou" : ""}`}
                            aria-pressed={isActive}
                            className="min-w-0 flex-1 text-left rounded-md outline-none focus:outline-none focus:ring-0"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-gray-800">
                                  {dateLabel}
                                </span>
                                <span className="text-xs text-gray-600 inline-flex items-center gap-1">
                                  <Clock3
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                  {timeLabel}
                                </span>
                              </div>

                              <div className="mt-2 flex items-center gap-2">
                                {lessonStatusBadge(lesson.status)}
                              </div>

                              {expired && (
                                <div className="mt-2 text-[11px] text-gray-500">
                                  Aula já passou • não é possível reabrir
                                </div>
                              )}
                            </div>
                          </button>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-semibold text-gray-600 whitespace-nowrap">
                              {isOpen ? "Aberta" : "Fechada"}
                            </span>

                            <div
                              onClick={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              <Switch
                                checked={isOpen}
                                disabled={disableStatusSwitch}
                                aria-label={`Alterar status da aula de ${dateLabel}`}
                                onCheckedChange={(nextChecked) => {
                                  if (disableStatusSwitch) return;
                                  c.toggleLessonStatus(lesson, nextChecked);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {!c.isLg && (
                <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                  <button
                    type="button"
                    onClick={c.openAttendance}
                    className={cn(
                      "h-10 w-full rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border transition",
                      c.selectedLessonId
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed",
                    )}
                    disabled={!c.selectedLessonId}
                  >
                    <ClipboardList className="h-4 w-4" aria-hidden="true" />
                    Gerenciar Presenças
                  </button>

                  <p className="mt-1 text-[11px] text-gray-500 text-center">
                    Selecione uma aula para habilitar
                  </p>
                </div>
              )}
            </div>

            {c.isLg && (
              <div
                className="lg:col-span-5 flex flex-col min-h-0 overflow-hidden"
                aria-labelledby="attendances-manage-title"
              >
                <ManagePanel
                  titleRef={manageTitleRef}
                  selectedLesson={c.selectedLesson}
                  selectedLessonId={c.selectedLessonId}
                  isLoadingAttendances={c.isLoadingAttendances}
                  isErrorAttendances={c.isErrorAttendances}
                  attendanceSearch={c.attendanceSearch}
                  setAttendanceSearch={c.setAttendanceSearch}
                  filteredAttendances={c.filteredAttendances}
                  stats={c.stats}
                  canEditAttendances={c.canEditAttendances}
                  isUpdatingAttendance={c.isUpdatingAttendance}
                  bulkPresent={c.bulkPresent}
                  bulkAbsent={c.bulkAbsent}
                  markPresent={c.markPresent}
                  markAbsent={c.markAbsent}
                  markJustified={c.markJustified}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
