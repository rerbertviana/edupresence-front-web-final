"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ManagePanelShell } from "@/components/ui/manage-panel-shell";
import { normalizeText } from "@/lib/text";
import { SelectNative } from "@/components/ui/select-native";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Layers,
  Save,
  Ban,
  Pencil,
  Trash2,
  ChevronDown,
  Check,
} from "lucide-react";

import type {
  CourseDTO,
  ClassDTO,
  FormMode,
  FormValues,
} from "../../domain/types";
import { shiftLabel } from "../../helpers/helpers";

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

const TextInput = React.memo(
  React.forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
    { className, error, ...props },
    ref,
  ) {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "w-full h-10 rounded-md border bg-white px-3 text-sm text-gray-800 outline-none",
          "placeholder:text-gray-400",
          "focus:border-gray-400 focus:ring-2 focus:ring-gray-300 focus:ring-offset-0",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-200"
            : "border-gray-200",
          className,
        )}
      />
    );
  }),
);
TextInput.displayName = "TextInput";

type Props = {
  compact?: boolean;

  formMode: FormMode;
  setFormMode: (m: FormMode) => void;

  selectedClassId: number | null;
  selectedClass: ClassDTO | null;

  courses: CourseDTO[];
  years: number[];

  formValues: FormValues;
  setFormValues: React.Dispatch<React.SetStateAction<FormValues>>;

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
  selectedClassId,
  selectedClass,
  courses,
  years,
  formValues,
  setFormValues,
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
    !!formValues.courseId &&
    !!formValues.semester.trim() &&
    !!formValues.shift.trim() &&
    !isSaving;

  function updateSemester(year: string, period: string) {
    if (!year || !period) {
      setFormValues((prev) => ({ ...prev, semester: "" }));
      return;
    }
    setFormValues((prev) => ({ ...prev, semester: `${year}.${period}` }));
  }

  const [courseOpen, setCourseOpen] = useState(false);
  const [courseQuery, setCourseQuery] = useState("");

  const selectedCourse = useMemo(() => {
    const cid = Number(formValues.courseId);
    if (!cid || Number.isNaN(cid)) return null;
    return courses.find((c) => c.id === cid) ?? null;
  }, [formValues.courseId, courses]);

  const filteredCourses = useMemo(() => {
    const q = normalizeText(courseQuery);
    if (!q) return courses;
    return courses.filter((c) => normalizeText(c.name).includes(q));
  }, [courses, courseQuery]);

  return (
    <ManagePanelShell
      compact={compact}
      title={formMode === "create" ? "Novo Semestre" : "Gerenciar Semestre"}
      icon={<Layers className="h-4 w-4 text-gray-600" />}
      showNewButton={formMode === "view" || formMode === "edit"}
      onNewClick={() => {
        onNew();
        onOpenManageIfMobile();
      }}
    >
        {!selectedClassId && formMode !== "create" && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 mb-3">
            Selecione um semestre para visualizar ou editar.
          </div>
        )}

        <form
          className="grid grid-cols-1 sm:grid-cols-4 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (formMode === "create") onCreate();
            if (formMode === "edit") onUpdate();
          }}
        >
          <div className="sm:col-span-4">
            <label className="text-xs font-semibold text-gray-700">Curso</label>

            <Popover
              open={courseOpen}
              onOpenChange={(open) => {
                if (isFormDisabled) return;
                setCourseOpen(open);
                if (!open) setCourseQuery("");
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isFormDisabled || courses.length === 0}
                  className={cn(
                    "w-full h-10 bg-white border-gray-200 text-gray-700",
                    "flex items-center justify-between gap-2",
                    !selectedCourse && "text-gray-400",
                  )}
                >
                  <span className="truncate text-left">
                    {selectedCourse?.name ?? "Selecione um curso"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[--radix-popover-trigger-width] p-3">
                <TextInput
                  value={courseQuery}
                  onChange={(e) => setCourseQuery(e.target.value)}
                  placeholder="Buscar curso..."
                  className="h-9 mb-2"
                />

                <div className="max-h-[260px] overflow-y-auto space-y-1">
                  {filteredCourses.map((c) => {
                    const isSelected = String(c.id) === formValues.courseId;

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setFormValues((prev) => ({
                            ...prev,
                            courseId: String(c.id),
                          }));
                          setCourseOpen(false);
                          setCourseQuery("");
                        }}
                        className={cn(
                          "w-full px-2 py-2 rounded-md border text-left flex items-center gap-2",
                          isSelected
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-white border-gray-200 hover:bg-gray-50",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex h-5 w-5 items-center justify-center rounded-md border",
                            isSelected
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "border-gray-200 text-gray-400",
                          )}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="truncate text-sm">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700">Ano</label>
            <SelectNative
              value={formValues.year}
              onChange={(year) => {
                setFormValues((p) => ({ ...p, year }));
                updateSemester(year, formValues.period);
              }}
              disabled={isFormDisabled}
              placeholder="Selecione"
              options={years.map((y) => ({
                value: String(y),
                label: String(y),
              }))}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700">
              Período
            </label>
            <SelectNative
              value={formValues.period}
              onChange={(period) => {
                setFormValues((p) => ({ ...p, period }));
                updateSemester(formValues.year, period);
              }}
              disabled={isFormDisabled}
              placeholder="Selecione"
              options={[
                { value: "1", label: "1" },
                { value: "2", label: "2" },
              ]}
            />
          </div>

          <div className="sm:col-span-4">
            <label className="text-xs font-semibold text-gray-700">Turno</label>
            <SelectNative
              value={formValues.shift}
              onChange={(shift) => setFormValues((p) => ({ ...p, shift }))}
              disabled={isFormDisabled}
              placeholder="Selecione o turno"
              options={[
                { value: "MORNING", label: "Matutino" },
                { value: "AFTERNOON", label: "Vespertino" },
                { value: "NIGHT", label: "Noturno" },
              ]}
            />
          </div>

          <div className="sm:col-span-4 flex flex-col sm:flex-row gap-2 pt-1">
            {formMode === "create" && (
              <button
                type="submit"
                disabled={!canSave}
                className={cn(
                  "h-10 px-4 rounded-md font-semibold",
                  !canSave
                    ? "bg-emerald-50 text-emerald-400 border border-emerald-200"
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
                  disabled={!selectedClassId}
                  className="h-10 px-4 rounded-md bg-orange-50 border border-orange-200 text-orange-700"
                >
                  <Pencil className="h-4 w-4 inline mr-2" />
                  Editar
                </button>

                <button
                  type="button"
                  onClick={onAskDelete}
                  disabled={!selectedClassId || isDeleting}
                  className="h-10 px-4 rounded-md bg-red-50 border border-red-200 text-red-700"
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
                  className="h-10 px-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700"
                >
                  <Save className="h-4 w-4 inline mr-2" />
                  Salvar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormMode("view");
                    if (!selectedClass) return;
                    const [y, p] = selectedClass.semester.split(".");
                    setFormValues({
                      courseId: String(selectedClass.courseId),
                      year: y ?? "",
                      period: p ?? "",
                      semester: selectedClass.semester,
                      shift: String(selectedClass.shift),
                    });
                  }}
                  className="h-10 px-4 rounded-md bg-gray-50 border border-gray-200 text-gray-700"
                >
                  <Ban className="h-4 w-4 inline mr-2" />
                  Cancelar
                </button>
              </>
            )}
          </div>

          <div className="sm:col-span-4 text-[11px] text-gray-500">
            {formMode === "create" && (
              <>Dica: selecione curso, ano, período e turno.</>
            )}
            {formMode === "view" && selectedClass && (
              <>
                Selecionado:{" "}
                <b>
                  {selectedClass.semester} • {shiftLabel(selectedClass.shift)}
                </b>
              </>
            )}
            {formMode === "edit" && (
              <>
                Obs: em modo <b>Editar</b>, você pode alterar tudo.
              </>
            )}
          </div>
        </form>
    </ManagePanelShell>
  );
});
