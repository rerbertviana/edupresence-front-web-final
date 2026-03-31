"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DashboardShell } from "@/components/layout/DashboardShell";

import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { MobileManageSheet } from "@/components/ui/mobile-manage-sheet";
import { Toast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";

import { ManagePanel } from "./components/ManagePanel";
import type {
  LessonsController,
  LessonDTO,
} from "../controller/useLessonsController";

import {
  GraduationCap,
  CalendarDays,
  Clock3,
  Settings2,
  CirclePlus,
  DoorOpen,
  DoorClosed,
} from "lucide-react";

type Shift = "MORNING" | "AFTERNOON" | "NIGHT" | string;
type LessonStatus = "OPEN" | "CLOSED" | string;

function shiftLabel(shift: Shift) {
  if (shift === "MORNING") return "Matutino";
  if (shift === "AFTERNOON") return "Vespertino";
  if (shift === "NIGHT") return "Noturno";
  return "—";
}

function shiftPillClass(shift: Shift) {
  if (shift === "MORNING")
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (shift === "AFTERNOON")
    return "bg-orange-100 text-orange-800 border-orange-200";
  if (shift === "NIGHT") return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const base = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = base.split("-");
  if (parts.length < 3) return "—";
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

function formatTimeBR(isoStr: string | null | undefined): string {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return "—";
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function buildLessonBoundary(lesson: LessonDTO, kind: "start" | "end") {
  if (!lesson?.date) return null;

  const baseDate = lesson.date.includes("T")
    ? lesson.date.split("T")[0]
    : lesson.date;

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(baseDate);
  if (!dateMatch) return null;

  const timeSource = kind === "start" ? lesson.startTime : lesson.endTime;
  const timeDate = new Date(timeSource);
  if (Number.isNaN(timeDate.getTime())) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]) - 1;
  const day = Number(dateMatch[3]);

  const hour = timeDate.getUTCHours();
  const minute = timeDate.getUTCMinutes();
  const second = timeDate.getUTCSeconds();

  return new Date(year, month, day, hour, minute, second, 0);
}

function isLessonExpired(lesson: LessonDTO) {
  const lessonEnd = buildLessonBoundary(lesson, "end");
  if (!lessonEnd) return false;
  return lessonEnd.getTime() < Date.now();
}

function lessonStatusBadge(status: LessonStatus) {
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

type Props = { controller: LessonsController };

export function LessonsView({ controller }: Props) {
  const {
    isLg,

    toast,
    closeToast,

    lessonToDelete,
    cancelDelete,
    confirmDelete,
    isDeleting,

    manageOpen,
    setManageOpen,

    classSearch,
    setClassSearch,
    lessonSearch,
    setLessonSearch,

    selectedClassSubjectId,
    setSelectedClassSubjectId,

    selectedLessonId,
    setSelectedLessonId,

    filteredClassSubjects,
    filteredLessons,
    selectedClassSubject,
    selectedLesson,

    checked,
    setChecked,

    formMode,
    setFormMode,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    selectedDate,
    setSelectedDate,
    datePopoverOpen,
    setDatePopoverOpen,

    isSaving,
    isTogglingStatus,

    isLoadingClasses,
    isErrorClasses,
    isLoadingLessons,
    isErrorLessons,

    handleNew,
    openManageIfMobile,
    openSmartSheet,
    create,
    update,
    toggleLessonStatus,

    setLessonToDelete,
  } = controller;

  const selectedShift: Shift = selectedClassSubject?.class?.shift ?? "MORNING";
  const mobileHasSelected = !!selectedLessonId;

  return (
    <DashboardShell>
      <div className="w-full h-full min-h-0 overflow-hidden">
        <DeleteConfirmDialog
          open={!!lessonToDelete}
          loading={isDeleting}
          entityLabel="esta aula"
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        )}

        <div className="w-full h-full min-h-0 overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Aulas</h1>
              <p className="text-xs text-gray-500">
                Turma → Aulas → Criar/editar/excluir
              </p>
            </div>

            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold",
                shiftPillClass(selectedShift),
              )}
            >
              <Clock3 className="h-4 w-4" />
              {shiftLabel(selectedShift)}
            </span>
          </div>

          {!isLg && (
            <MobileManageSheet
              open={manageOpen}
              onOpenChange={setManageOpen}
              title={mobileHasSelected ? "Gerenciar Aula" : "Nova Aula"}
              description={mobileHasSelected ? "Editar/excluir." : "Criar uma aula."}
            >
              <ManagePanel
                compact
                formMode={formMode}
                setFormMode={setFormMode}
                selectedLessonId={selectedLessonId}
                selectedLesson={selectedLesson}
                selectedClassSubject={selectedClassSubject}
                selectedClassSubjectId={selectedClassSubjectId}
                date={date}
                setDate={setDate}
                startTime={startTime}
                setStartTime={setStartTime}
                endTime={endTime}
                setEndTime={setEndTime}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                datePopoverOpen={datePopoverOpen}
                setDatePopoverOpen={setDatePopoverOpen}
                isSaving={isSaving}
                isDeleting={isDeleting}
                onNew={handleNew}
                onOpenManageIfMobile={() => setManageOpen(true)}
                onCreate={create}
                onUpdate={update}
                onAskDelete={() => {
                  if (!selectedLesson) return;
                  setManageOpen(false);
                  setTimeout(() => setLessonToDelete(selectedLesson), 180);
                }}
              />
            </MobileManageSheet>
          )}

          <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
            <section className="lg:col-span-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col min-h-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-gray-600" />
                  <h2 className="text-sm font-semibold text-gray-800">
                    Turmas
                  </h2>
                </div>
                <span className="text-xs text-gray-500">
                  {filteredClassSubjects.length} itens
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 min-h-0 overflow-y-auto">
                <input
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                  placeholder="Buscar turma..."
                  className={cn(
                    "w-full h-9 rounded-md border bg-white px-3 text-sm text-gray-800 outline-none",
                    "placeholder:text-gray-400",
                    "focus:border-gray-400 focus:ring-2 focus:ring-gray-300 focus:ring-offset-0",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    "border-gray-200",
                  )}
                />

                {isLoadingClasses && (
                  <div className="text-xs text-gray-500">Carregando...</div>
                )}
                {isErrorClasses && (
                  <div className="text-xs text-red-500">
                    Erro ao carregar turmas.
                  </div>
                )}

                {!isLoadingClasses &&
                  !isErrorClasses &&
                  filteredClassSubjects.length === 0 && (
                    <div className="text-xs text-gray-500">
                      Nenhuma turma encontrada.
                    </div>
                  )}

                <div className="space-y-2">
                  {filteredClassSubjects.map((cs) => {
                    const isActive = cs.id === selectedClassSubjectId;

                    return (
                      <button
                        key={cs.id}
                        type="button"
                        onClick={() => setSelectedClassSubjectId(cs.id)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-3 text-left transition",
                          isActive
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold",
                              shiftPillClass(cs.class?.shift ?? "MORNING"),
                            )}
                          >
                            <Clock3 className="h-3.5 w-3.5" />
                            {shiftLabel(cs.class?.shift ?? "MORNING")}
                          </span>

                          <span className="text-[11px] text-gray-500 font-semibold">
                            {cs.class?.semester ?? "—"}
                          </span>
                        </div>

                        <div className="mt-2 font-semibold text-gray-800 text-sm truncate">
                          {cs.class?.course?.name ?? "—"}
                        </div>

                        <div className="text-xs text-gray-600 truncate mt-1">
                          <span className="font-semibold">Disciplina:</span>{" "}
                          {cs.subject?.name ?? "—"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="lg:col-span-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col min-h-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-600" />
                  <h2 className="text-sm font-semibold text-gray-800">
                    Aulas agendadas
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Todas</span>
                  <Switch checked={checked} onCheckedChange={setChecked} />
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 min-h-0 overflow-y-auto">
                <input
                  value={lessonSearch}
                  onChange={(e) => setLessonSearch(e.target.value)}
                  placeholder={
                    !selectedClassSubjectId
                      ? "Selecione uma turma..."
                      : "Buscar aula..."
                  }
                  disabled={!selectedClassSubjectId}
                  className={cn(
                    "w-full h-9 rounded-md border bg-white px-3 text-sm text-gray-800 outline-none",
                    "placeholder:text-gray-400",
                    "focus:border-gray-400 focus:ring-2 focus:ring-gray-300 focus:ring-offset-0",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    "border-gray-200",
                  )}
                />

                {!selectedClassSubjectId && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                    Selecione uma turma para ver as aulas.
                  </div>
                )}

                {selectedClassSubjectId && isLoadingLessons && (
                  <div className="text-xs text-gray-500">
                    Carregando aulas...
                  </div>
                )}
                {selectedClassSubjectId && isErrorLessons && (
                  <div className="text-xs text-red-500">
                    Erro ao carregar aulas.
                  </div>
                )}

                {selectedClassSubjectId &&
                  !isLoadingLessons &&
                  !isErrorLessons &&
                  filteredLessons.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                      Nenhuma aula encontrada para esta turma.
                    </div>
                  )}

                <div className="space-y-2">
                  {filteredLessons.map((lesson) => {
                    const isActive = lesson.id === selectedLessonId;
                    const expired = isLessonExpired(lesson);
                    const isOpen = lesson.status === "OPEN";

                    const disableStatusSwitch = isTogglingStatus;

                    const dateLabel = formatDateBR(lesson.date);
                    const timeLabel = `${formatTimeBR(lesson.startTime)} – ${formatTimeBR(lesson.endTime)}`;

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-3 text-left transition",
                          isActive
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300",
                          expired && !isActive ? "opacity-60" : "",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-gray-800">
                                {dateLabel}
                              </span>
                              <span className="text-xs text-gray-600 inline-flex items-center gap-1">
                                <Clock3 className="h-3.5 w-3.5" />
                                {timeLabel}
                              </span>
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                              {lessonStatusBadge(lesson.status as LessonStatus)}
                              {expired && (
                                <span className="text-[11px] font-semibold text-gray-500">
                                  (Encerrada por horário)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-semibold text-gray-600 whitespace-nowrap">
                              {isOpen ? "Aberta" : "Fechada"}
                            </span>
                            <Switch
                              checked={isOpen}
                              disabled={disableStatusSwitch}
                              onCheckedChange={(nextChecked) => {
                                if (disableStatusSwitch) return;
                                toggleLessonStatus(lesson, nextChecked);
                              }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {!isLg && (
                <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                  <button
                    type="button"
                    onClick={openSmartSheet}
                    className={cn(
                      "h-10 w-full rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border transition",
                      selectedClassSubjectId
                        ? mobileHasSelected
                          ? "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                          : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed",
                    )}
                    disabled={!selectedClassSubjectId}
                  >
                    {mobileHasSelected ? (
                      <>
                        <Settings2 className="h-4 w-4" />
                        Gerenciar aula
                      </>
                    ) : (
                      <>
                        <CirclePlus className="h-4 w-4" />
                        Nova aula
                      </>
                    )}
                  </button>
                </div>
              )}
            </section>

            {isLg && (
              <section className="lg:col-span-4 flex flex-col min-h-0 overflow-hidden">
                <ManagePanel
                  formMode={formMode}
                  setFormMode={setFormMode}
                  selectedLessonId={selectedLessonId}
                  selectedLesson={selectedLesson}
                  selectedClassSubject={selectedClassSubject}
                  selectedClassSubjectId={selectedClassSubjectId}
                  date={date}
                  setDate={setDate}
                  startTime={startTime}
                  setStartTime={setStartTime}
                  endTime={endTime}
                  setEndTime={setEndTime}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  datePopoverOpen={datePopoverOpen}
                  setDatePopoverOpen={setDatePopoverOpen}
                  isSaving={isSaving}
                  isDeleting={isDeleting}
                  onNew={handleNew}
                  onOpenManageIfMobile={openManageIfMobile}
                  onCreate={create}
                  onUpdate={update}
                  onAskDelete={() => setLessonToDelete(selectedLesson)}
                />
              </section>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
