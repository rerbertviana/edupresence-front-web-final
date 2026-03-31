"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Users,
  CirclePlus,
  Pencil,
  Trash2,
  Save,
  Ban,
  ChevronDown,
  Check,
} from "lucide-react";

import type { CourseDTO, FormMode, StudentDTO } from "../../domain/types";
import { normalizeText } from "../../helpers/helpers";

function SelectNative({
  value,
  onChange,
  disabled,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "w-full h-10 rounded-md border bg-white px-3 text-sm text-gray-800 outline-none",
        "focus:border-gray-400 focus:ring-2 focus:ring-gray-300 focus:ring-offset-0",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "border-gray-200",
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

type Props = {
  compact?: boolean;

  formMode: FormMode;
  setFormMode: (m: FormMode) => void;

  selectedStudentId: number | null;
  selectedStudent: StudentDTO | null;

  courses: CourseDTO[];
  isLoadingCourses: boolean;
  isCoursesError: boolean;
  coursesError: any;

  fullName: string;
  setFullName: (v: string) => void;

  email: string;
  setEmail: (v: string) => void;

  password: string;
  setPassword: (v: string) => void;

  registrationNumber: string;
  setRegistrationNumber: (v: string) => void;

  courseId: string;
  setCourseId: (v: string) => void;

  currentSemester: string;
  setCurrentSemester: (v: string) => void;

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
  selectedStudentId,
  selectedStudent,
  courses,
  isLoadingCourses,
  isCoursesError,
  coursesError,
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  registrationNumber,
  setRegistrationNumber,
  courseId,
  setCourseId,
  currentSemester,
  setCurrentSemester,
  isSaving,
  isDeleting,
  onNew,
  onOpenManageIfMobile,
  onCreate,
  onUpdate,
  onAskDelete,
}: Props) {
  const isFormDisabled = formMode === "view";
  const isEditing = formMode === "edit";
  const isCreating = formMode === "create";

  const semesters = useMemo(
    () => Array.from({ length: 10 }, (_, i) => i + 1),
    [],
  );

  const isSubmitDisabled =
    isSaving ||
    !fullName.trim() ||
    !email.trim() ||
    !registrationNumber.trim() ||
    !courseId ||
    !currentSemester.trim() ||
    (!isEditing && !password.trim());

  const [courseOpen, setCourseOpen] = useState(false);
  const [courseQuery, setCourseQuery] = useState("");

  const selectedCourse = useMemo(() => {
    const cid = Number(courseId);
    if (!courseId || Number.isNaN(cid)) return null;
    return courses.find((c) => c.id === cid) ?? null;
  }, [courseId, courses]);

  const courseButtonLabel = useMemo(() => {
    if (!selectedCourse) return "Selecione um curso";
    return selectedCourse.name ?? "—";
  }, [selectedCourse]);

  const filteredCourses = useMemo(() => {
    const q = normalizeText(courseQuery);
    if (!q) return courses;
    return courses.filter((c) => normalizeText(c.name).includes(q));
  }, [courses, courseQuery]);

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col",
        compact ? "border-0 shadow-none rounded-none" : "shrink-0",
      )}
    >
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-800">
            Gerenciar Estudante
          </h2>
        </div>

        {(formMode === "view" || formMode === "edit") && (
          <button
            type="button"
            onClick={() => {
              onNew();
              onOpenManageIfMobile();
            }}
            className="h-8 px-3 rounded-md text-xs font-semibold border
              bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 whitespace-nowrap"
          >
            <CirclePlus className="h-4 w-4 inline mr-2" />
            Novo
          </button>
        )}
      </div>

      <div className={cn("p-4", compact && "pb-28")}>
        {!selectedStudentId && formMode !== "create" && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 mb-3">
            Selecione um estudante para visualizar/editar.
          </div>
        )}

        <form
          className="grid grid-cols-1 sm:grid-cols-6 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (formMode === "create") onCreate();
            if (formMode === "edit") onUpdate();
          }}
        >
          <div className="sm:col-span-3">
            <label className="text-xs font-semibold text-gray-700">
              Nome completo
            </label>
            <TextInput
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Jose Santos Araújo"
              disabled={isFormDisabled}
            />
          </div>

          <div className="sm:col-span-3">
            <label className="text-xs font-semibold text-gray-700">
              E-mail
            </label>
            <TextInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: jose@edupresence.com"
              type="email"
              disabled={isFormDisabled}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700">
              {isEditing ? "Senha (opcional)" : "Senha"}
            </label>
            <TextInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              type="password"
              disabled={isFormDisabled}
            />
            {!isEditing && (
              <div className="text-[11px] text-gray-500 mt-1">
                Obrigatória ao criar.
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700">
              Matrícula
            </label>
            <TextInput
              value={registrationNumber}
              onChange={(e) =>
                setRegistrationNumber(
                  e.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
              placeholder="Ex: 20250001"
              disabled={isFormDisabled}
              inputMode="numeric"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700">
              Semestre atual
            </label>

            <SelectNative
              value={currentSemester}
              onChange={setCurrentSemester}
              disabled={isFormDisabled}
              placeholder="Selecione..."
              options={semesters.map((s) => ({
                value: String(s),
                label: String(s),
              }))}
            />
          </div>

          <div className="sm:col-span-6">
            <label className="text-xs font-semibold text-gray-700">Curso</label>

            <Popover
              open={courseOpen}
              onOpenChange={(open) => {
                if (isFormDisabled) return;
                if (isLoadingCourses || isCoursesError) return;
                setCourseOpen(open);
                if (!open) setCourseQuery("");
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    isFormDisabled || isLoadingCourses || isCoursesError
                  }
                  className={cn(
                    "w-full h-10 bg-white border-gray-200 text-gray-700",
                    "flex items-center justify-between gap-2 min-w-0",
                    !selectedCourse && "text-gray-400",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate text-left">
                    {isLoadingCourses
                      ? "Carregando..."
                      : courses.length
                        ? courseButtonLabel
                        : "Sem cursos"}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[--radix-popover-trigger-width] p-3">
                <div className="space-y-2">
                  <TextInput
                    value={courseQuery}
                    onChange={(e) => setCourseQuery(e.target.value)}
                    placeholder="Buscar curso..."
                    className="h-9"
                  />

                  <div className="max-h-[260px] overflow-y-auto space-y-1">
                    {filteredCourses.length === 0 && (
                      <div className="text-xs text-gray-500 px-2 py-2">
                        Nenhum curso encontrado.
                      </div>
                    )}

                    {filteredCourses.map((c) => {
                      const isSelected = String(c.id) === courseId;

                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setCourseId(String(c.id));
                            setCourseOpen(false);
                            setCourseQuery("");
                          }}
                          className={cn(
                            "w-full px-2 py-2 rounded-md border text-left flex items-center gap-2 transition",
                            isSelected
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex h-5 w-5 items-center justify-center rounded-md border shrink-0",
                              isSelected
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-white border-gray-200 text-gray-400",
                            )}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>

                          <span className="min-w-0 flex-1 truncate text-sm text-gray-800">
                            {c.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {isCoursesError && (
              <p className="mt-1 text-xs text-red-500">
                {(coursesError as any)?.message ?? "Erro ao carregar cursos."}
              </p>
            )}
          </div>

          <div className="sm:col-span-6 flex flex-col sm:flex-row gap-2 pt-1">
            {isCreating && (
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={cn(
                  "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                  isSubmitDisabled
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
                  disabled={!selectedStudentId}
                  className={cn(
                    "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                    !selectedStudentId
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
                  disabled={!selectedStudentId || isDeleting}
                  className={cn(
                    "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                    !selectedStudentId || isDeleting
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
                  disabled={isSaving || isSubmitDisabled}
                  className={cn(
                    "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                    isSaving || isSubmitDisabled
                      ? "bg-emerald-50 text-emerald-400 border border-emerald-200 cursor-not-allowed"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
                  )}
                >
                  <Save className="h-4 w-4 inline mr-2" />
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormMode("view");
                    if (selectedStudent) {
                      setFullName(selectedStudent.user?.fullName ?? "");
                      setEmail(selectedStudent.user?.email ?? "");
                      setPassword("");
                      setRegistrationNumber(
                        selectedStudent.registrationNumber ?? "",
                      );
                      setCourseId(String(selectedStudent.courseId ?? ""));
                      setCurrentSemester(
                        String(selectedStudent.currentSemester ?? ""),
                      );
                    }
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
                Dica: depois de criar, selecione o estudante na lista para
                editar/excluir.
              </>
            )}
            {formMode === "view" && selectedStudent && (
              <>
                Selecionado: <b>{selectedStudent.user?.fullName ?? "—"}</b>
              </>
            )}
            {formMode === "edit" && (
              <>
                Obs: em modo <b>Editar</b>, senha é opcional (se vazio, mantém a
                atual).
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
});
