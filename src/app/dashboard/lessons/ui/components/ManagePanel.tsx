"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ManagePanelShell } from "@/components/ui/manage-panel-shell";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";

import {
  CalendarDays,
  Save,
  Ban,
  Pencil,
  Trash2,
} from "lucide-react";

import type { ClassSubjectDTO, FormMode, LessonDTO } from "../../domain/types";
import {
  convertToYMD,
  formatDateBR,
  parseISODateToLocalDate,
  shiftLabel,
  timeInputValueFromISO,
} from "../../helpers/helpers";

type Props = {
  compact?: boolean;

  formMode: FormMode;
  setFormMode: (m: FormMode) => void;

  selectedLessonId: number | null;
  selectedLesson: LessonDTO | null;

  selectedClassSubject: ClassSubjectDTO | null;
  selectedClassSubjectId: number | null;

  date: string;
  setDate: (v: string) => void;

  startTime: string;
  setStartTime: (v: string) => void;

  endTime: string;
  setEndTime: (v: string) => void;

  selectedDate: Date | undefined;
  setSelectedDate: (d: Date | undefined) => void;

  datePopoverOpen: boolean;
  setDatePopoverOpen: (o: boolean) => void;

  isSaving: boolean;
  isDeleting: boolean;

  onNew: () => void;
  onOpenManageIfMobile: () => void;

  onCreate: () => void;
  onUpdate: () => void;

  onAskDelete: () => void;
};

export const ManagePanel = React.memo(function ManagePanel({
  compact,
  formMode,
  setFormMode,
  selectedLessonId,
  selectedLesson,
  selectedClassSubject,
  selectedClassSubjectId,
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
  isDeleting,
  onNew,
  onOpenManageIfMobile,
  onCreate,
  onUpdate,
  onAskDelete,
}: Props) {
  const isFormDisabled = formMode === "view";

  const canSave =
    !isSaving &&
    !!selectedClassSubjectId &&
    date.trim().length > 0 &&
    startTime.trim().length === 5 &&
    endTime.trim().length === 5;

  function headerLabel() {
    if (formMode === "create") return "Nova Aula";
    if (formMode === "edit") return "Editar Aula";
    return "Gerenciar Aula";
  }

  const subtitle = useMemo(() => {
    if (!selectedLessonId || formMode === "create") return "";

    const course = selectedClassSubject?.class?.course?.name ?? "—";
    const sem = selectedClassSubject?.class?.semester ?? "—";
    const shift = shiftLabel(selectedClassSubject?.class?.shift ?? "MORNING");
    const subject = selectedClassSubject?.subject?.name ?? "—";
    return `${course} • ${sem} • ${shift} • ${subject}`;
  }, [selectedClassSubject, selectedLessonId, formMode]);

  return (
    <ManagePanelShell
      compact={compact}
      title={headerLabel()}
      icon={<CalendarDays className="h-4 w-4 text-gray-600" />}
      subtitle={subtitle}
      showNewButton={formMode === "view" || formMode === "edit"}
      onNewClick={() => {
        onNew();
        onOpenManageIfMobile();
      }}
      rootClassName="min-h-0 overflow-hidden"
    >
        {!selectedClassSubjectId && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 mb-3">
            Selecione uma turma para criar aulas.
          </div>
        )}

        {!!selectedClassSubjectId &&
          !selectedLessonId &&
          formMode !== "create" && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 mb-3">
              Selecione uma aula para visualizar/editar.
            </div>
          )}

        <form
          className="grid grid-cols-1 sm:grid-cols-6 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedClassSubjectId) return;
            if (formMode === "create") onCreate();
            if (formMode === "edit") onUpdate();
          }}
        >
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700">Data</label>

            <Popover
              open={datePopoverOpen}
              onOpenChange={(open) => {
                if (isFormDisabled) return;
                setDatePopoverOpen(open);
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isFormDisabled || !selectedClassSubjectId}
                  className={cn(
                    "w-full h-10 bg-white border-gray-200 text-gray-700",
                    "flex items-center justify-between gap-2 min-w-0",
                    !date.trim() && "text-gray-400",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate text-left">
                    {date.trim() ? formatDateBR(date) : "Selecione a data"}
                  </span>
                  <CalendarDays className="h-4 w-4 shrink-0" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-2" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    setSelectedDate(d);
                    if (d) setDate(convertToYMD(d));
                    setDatePopoverOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700">
              Início
            </label>
            <TextInput
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="00:00"
              disabled={isFormDisabled || !selectedClassSubjectId}
              inputMode="numeric"
              className="h-10"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700">
              Término
            </label>
            <TextInput
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="00:00"
              disabled={isFormDisabled || !selectedClassSubjectId}
              inputMode="numeric"
              className="h-10"
            />
          </div>

          <div className="sm:col-span-6 flex flex-col sm:flex-row gap-2 pt-1">
            {formMode === "create" && (
              <button
                type="submit"
                disabled={!canSave}
                className={cn(
                  "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                  !canSave
                    ? "bg-emerald-50 text-emerald-400 border border-emerald-200 cursor-not-allowed"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
                )}
              >
                {isSaving ? "Salvando..." : "Adicionar"}
              </button>
            )}

            {formMode === "view" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setFormMode("edit");
                    onOpenManageIfMobile();
                  }}
                  disabled={!selectedLessonId}
                  className={cn(
                    "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                    !selectedLessonId
                      ? "bg-orange-50 text-orange-400 border border-orange-200 cursor-not-allowed"
                      : "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100",
                  )}
                >
                  <Pencil className="h-4 w-4 inline mr-2" />
                  Editar
                </button>

                <button
                  type="button"
                  onClick={onAskDelete}
                  disabled={!selectedLessonId || isDeleting}
                  className={cn(
                    "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                    !selectedLessonId || isDeleting
                      ? "bg-red-50 text-red-400 border border-red-200 cursor-not-allowed"
                      : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
                  )}
                >
                  <Trash2 className="h-4 w-4 inline mr-2" />
                  Excluir
                </button>
              </>
            )}

            {formMode === "edit" && (
              <>
                <button
                  type="submit"
                  disabled={!canSave}
                  className={cn(
                    "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                    !canSave
                      ? "bg-emerald-50 text-emerald-400 border border-emerald-200 cursor-not-allowed"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
                  )}
                >
                  <Save className="h-4 w-4 inline mr-2" />
                  {isSaving ? "Atualizando..." : "Salvar"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormMode("view");
                    if (!selectedLesson) return;

                    setDate(selectedLesson.date?.slice(0, 10) ?? "");
                    setStartTime(
                      timeInputValueFromISO(selectedLesson.startTime),
                    );
                    setEndTime(timeInputValueFromISO(selectedLesson.endTime));
                    setSelectedDate(
                      parseISODateToLocalDate(selectedLesson.date),
                    );
                  }}
                  disabled={isSaving}
                  className={cn(
                    "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                    isSaving
                      ? "bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100",
                  )}
                >
                  <Ban className="h-4 w-4 inline mr-2" />
                  Cancelar
                </button>
              </>
            )}
          </div>

          <div className="sm:col-span-6 text-[11px] text-gray-500">
            {formMode === "create" && (
              <>
                Dica: selecione uma turma e depois cadastre a aula com data e
                horários.
              </>
            )}
            {formMode === "view" && selectedLesson && (
              <>
                Selecionado: <b>Aula #{selectedLesson.id}</b>
              </>
            )}
            {formMode === "edit" && (
              <>
                Obs: em modo <b>Editar</b>, você ajusta data e horários da aula.
              </>
            )}
          </div>
        </form>
    </ManagePanelShell>
  );
});
