"use client";

import React, { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { TextInput } from "@/components/ui/text-input";

import {
  IdCard,
  CirclePlus,
  Pencil,
  Trash2,
  Save,
  Ban,
  Check,
  ChevronDown,
} from "lucide-react";

import type {
  ClassSubjectDTO,
  CourseDTO,
  EnrollmentDTO,
  FormMode,
  StudentDTO,
} from "../../domain/types";

import { getShiftBadgeClass, getShiftLabel } from "../../helpers/helpers";

function normalizeText(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

type Props = {
  compact?: boolean;

  formMode: FormMode;
  setFormMode: (m: FormMode) => void;

  selectedEnrollmentId: number | null;
  selectedEnrollment: EnrollmentDTO | null;

  courseId: string;
  setCourseId: (v: string) => void;

  studentId: string;
  setStudentId: (v: string) => void;

  classSubjectId: string;
  setClassSubjectId: (v: string) => void;

  students: StudentDTO[];
  classSubjects: ClassSubjectDTO[];
  courses: CourseDTO[];

  filteredClassSubjects: ClassSubjectDTO[];

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
  selectedEnrollmentId,
  selectedEnrollment,

  courseId,
  setCourseId,

  studentId,
  setStudentId,

  classSubjectId,
  setClassSubjectId,

  students,
  classSubjects,
  courses,
  filteredClassSubjects,

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
    courseId.trim().length > 0 &&
    studentId.trim().length > 0 &&
    classSubjectId.trim().length > 0;

  const selectedCourse = useMemo(() => {
    const cid = Number(courseId);
    if (!courseId.trim() || Number.isNaN(cid)) return null;
    return courses.find((c) => c.id === cid) ?? null;
  }, [courseId, courses]);

  const selectedStudent = useMemo(() => {
    const sid = Number(studentId);
    if (!studentId.trim() || Number.isNaN(sid) || !(students?.length ?? 0))
      return null;
    return students.find((s) => s.id === sid) ?? null;
  }, [studentId, students]);

  const selectedClassSubject = useMemo(() => {
    const csid = Number(classSubjectId);
    if (
      !classSubjectId.trim() ||
      Number.isNaN(csid) ||
      !(classSubjects?.length ?? 0)
    )
      return null;
    return classSubjects.find((cs) => cs.id === csid) ?? null;
  }, [classSubjectId, classSubjects]);

  const getStudentLabel = useCallback((s: StudentDTO) => {
    const name = s.user?.fullName ?? "Sem nome";
    const reg = s.registrationNumber ?? "—";
    return `${name} - ${reg}`;
  }, []);

  const getClassSubjectMainLabel = useCallback((cs: ClassSubjectDTO) => {
    const semester = cs.class?.semester ?? "—";
    const subjectName = cs.subject?.name ?? "Sem disciplina";
    return `${semester} - ${subjectName}`;
  }, []);

  const getClassSubjectExtraLabel = useCallback((cs: ClassSubjectDTO) => {
    const teacherName = cs.teacher?.user?.fullName ?? "Sem professor";
    const courseName = cs.class?.course?.name ?? "—";
    return `${teacherName} - ${courseName}`;
  }, []);

  const courseButtonLabel = useMemo(() => {
    if (!selectedCourse) return "Selecione o curso";
    return selectedCourse.name;
  }, [selectedCourse]);

  const studentButtonLabel = useMemo(() => {
    if (!selectedStudent) return "Selecione o estudante";
    return getStudentLabel(selectedStudent);
  }, [selectedStudent, getStudentLabel]);

  const classSubjectButtonLabel = useMemo(() => {
    if (!selectedClassSubject) return "Selecione a turma";
    return getClassSubjectMainLabel(selectedClassSubject);
  }, [selectedClassSubject, getClassSubjectMainLabel]);

  const [courseOpen, setCourseOpen] = useState(false);
  const [courseQuery, setCourseQuery] = useState("");

  const filteredCourses = useMemo(() => {
    const base = courses ?? [];
    const q = normalizeText(courseQuery);
    if (!q) return base;
    return base.filter((c) => normalizeText(c.name ?? "").includes(q));
  }, [courses, courseQuery]);

  const [studentOpen, setStudentOpen] = useState(false);
  const [studentQuery, setStudentQuery] = useState("");

  const filteredStudents = useMemo(() => {
    const base = students ?? [];
    const q = normalizeText(studentQuery);
    if (!q) return base;
    return base.filter((s) => normalizeText(getStudentLabel(s)).includes(q));
  }, [students, studentQuery, getStudentLabel]);

  const [classSubjectOpen, setClassSubjectOpen] = useState(false);
  const [classSubjectQuery, setClassSubjectQuery] = useState("");

  const filteredClassSubjectsForStudent = useMemo(() => {
    const base = filteredClassSubjects ?? [];
    const q = normalizeText(classSubjectQuery);
    if (!q) return base;

    return base.filter((cs) => {
      const hay = `${getClassSubjectMainLabel(cs)} ${getClassSubjectExtraLabel(
        cs,
      )} ${getShiftLabel(cs.class?.shift)}`;
      return normalizeText(hay).includes(q);
    });
  }, [
    filteredClassSubjects,
    classSubjectQuery,
    getClassSubjectMainLabel,
    getClassSubjectExtraLabel,
  ]);

  const disableStudentCombobox =
    isFormDisabled || !courseId.trim() || !(students?.length ?? 0);

  const disableClassSubjectCombobox =
    isFormDisabled ||
    !courseId.trim() ||
    !studentId.trim() ||
    !(filteredClassSubjects?.length ?? 0);

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col",
        compact ? "border-0 shadow-none rounded-none" : "shrink-0",
      )}
    >
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <IdCard className="h-4 w-4 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-800">
            Gerenciar Matrícula
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
            Nova
          </button>
        )}
      </div>

      <div className={cn("p-4", compact && "pb-28")}>
        {!selectedEnrollmentId && formMode !== "create" && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 mb-3">
            Selecione uma matrícula para visualizar/editar.
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
          <div className="sm:col-span-6">
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
                  disabled={isFormDisabled || !(courses?.length ?? 0)}
                  className={cn(
                    "w-full h-10 bg-white border-gray-200 text-gray-700 flex items-center justify-between gap-2 min-w-0",
                    !selectedCourse && "text-gray-400",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate text-left">
                    {courses?.length ? courseButtonLabel : "Sem cursos"}
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

                    {filteredCourses.map((course) => {
                      const isSelected = String(course.id) === courseId;

                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => {
                            setCourseId(String(course.id));
                            setStudentId("");
                            setClassSubjectId("");
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
                            {course.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="sm:col-span-3">
            <label className="text-xs font-semibold text-gray-700">
              Estudante
            </label>

            <Popover
              open={studentOpen}
              onOpenChange={(open) => {
                if (disableStudentCombobox) return;
                setStudentOpen(open);
                if (!open) setStudentQuery("");
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={disableStudentCombobox}
                  className={cn(
                    "w-full h-10 bg-white border-gray-200 text-gray-700 flex items-center justify-between gap-2 min-w-0",
                    !selectedStudent && "text-gray-400",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate text-left">
                    {!courseId.trim()
                      ? "Selecione um curso primeiro"
                      : students?.length
                        ? studentButtonLabel
                        : "Sem estudantes nesse curso"}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[--radix-popover-trigger-width] p-3">
                <div className="space-y-2">
                  <TextInput
                    value={studentQuery}
                    onChange={(e) => setStudentQuery(e.target.value)}
                    placeholder="Buscar estudante..."
                    className="h-9"
                  />

                  <div className="max-h-[260px] overflow-y-auto space-y-1">
                    {filteredStudents.length === 0 && (
                      <div className="text-xs text-gray-500 px-2 py-2">
                        Nenhum estudante encontrado.
                      </div>
                    )}

                    {filteredStudents.map((student) => {
                      const isSelected = String(student.id) === studentId;

                      return (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => {
                            setStudentId(String(student.id));
                            setClassSubjectId("");
                            setStudentOpen(false);
                            setStudentQuery("");
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
                            {getStudentLabel(student)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="sm:col-span-3">
            <label className="text-xs font-semibold text-gray-700">Turma</label>

            <Popover
              open={classSubjectOpen}
              onOpenChange={(open) => {
                if (disableClassSubjectCombobox) return;
                setClassSubjectOpen(open);
                if (!open) setClassSubjectQuery("");
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={disableClassSubjectCombobox}
                  className={cn(
                    "w-full h-10 bg-white border-gray-200 text-gray-700 flex items-center justify-between gap-2 min-w-0",
                    !classSubjectId.trim() && "text-gray-400",
                  )}
                >
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block truncate">
                      {!courseId.trim()
                        ? "Selecione um curso primeiro"
                        : !studentId.trim()
                          ? "Selecione um estudante primeiro"
                          : filteredClassSubjects.length === 0
                            ? "Sem oferta de matérias"
                            : classSubjectButtonLabel}
                    </span>

                    {selectedClassSubject && (
                      <span className="block text-[11px] text-gray-500 truncate">
                        {getClassSubjectExtraLabel(selectedClassSubject)}
                      </span>
                    )}
                  </span>

                  {selectedClassSubject?.class?.shift && (
                    <span
                      className={cn(
                        "shrink-0 inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold",
                        getShiftBadgeClass(selectedClassSubject.class.shift),
                      )}
                    >
                      {getShiftLabel(selectedClassSubject.class.shift)}
                    </span>
                  )}

                  <ChevronDown className="h-4 w-4 shrink-0" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[--radix-popover-trigger-width] p-3">
                <div className="space-y-2">
                  <TextInput
                    value={classSubjectQuery}
                    onChange={(e) => setClassSubjectQuery(e.target.value)}
                    placeholder="Buscar semestre, curso, matéria ou professor..."
                    className="h-9"
                  />

                  <div className="max-h-[260px] overflow-y-auto space-y-1">
                    {filteredClassSubjectsForStudent.length === 0 && (
                      <div className="text-xs text-gray-500 px-2 py-2">
                        Nenhuma opção encontrada.
                      </div>
                    )}

                    {filteredClassSubjectsForStudent.map((cs) => {
                      const isSelected = String(cs.id) === classSubjectId;

                      return (
                        <button
                          key={cs.id}
                          type="button"
                          onClick={() => {
                            setClassSubjectId(String(cs.id));
                            setClassSubjectOpen(false);
                            setClassSubjectQuery("");
                          }}
                          className={cn(
                            "w-full px-2 py-2 rounded-md border text-left flex items-start gap-2 transition",
                            isSelected
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex h-5 w-5 items-center justify-center rounded-md border shrink-0 mt-[2px]",
                              isSelected
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-white border-gray-200 text-gray-400",
                            )}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="min-w-0 flex items-start justify-between gap-2">
                              <span className="min-w-0 flex-1 truncate text-sm text-gray-800 font-semibold">
                                {getClassSubjectMainLabel(cs)}
                              </span>

                              {cs.class?.shift && (
                                <span
                                  className={cn(
                                    "shrink-0 inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold",
                                    getShiftBadgeClass(cs.class.shift),
                                  )}
                                >
                                  {getShiftLabel(cs.class.shift)}
                                </span>
                              )}
                            </div>

                            <div className="mt-0.5 text-[11px] text-gray-500 truncate">
                              {getClassSubjectExtraLabel(cs)}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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
                  disabled={!selectedEnrollmentId}
                  className={cn(
                    "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                    !selectedEnrollmentId
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
                  disabled={!selectedEnrollmentId || isDeleting}
                  className={cn(
                    "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                    !selectedEnrollmentId || isDeleting
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
                    if (selectedEnrollment) {
                      const selectedCourseId =
                        selectedEnrollment.student?.courseId ??
                        selectedEnrollment.classSubject?.class?.courseId ??
                        selectedEnrollment.classSubject?.class?.course?.id ??
                        "";

                      setCourseId(
                        selectedCourseId ? String(selectedCourseId) : "",
                      );
                      setStudentId(String(selectedEnrollment.studentId));
                      setClassSubjectId(
                        String(selectedEnrollment.classSubjectId),
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
                Fluxo: <b>Curso</b> → <b>Estudante</b> → <b>Turma</b>.
              </>
            )}
            {formMode === "view" && selectedEnrollment && (
              <>
                Selecionado: <b>Matrícula #{selectedEnrollment.id}</b>
              </>
            )}
            {formMode === "edit" && (
              <>
                Obs: em modo <b>Editar</b>, você pode trocar curso, estudante e
                turma.
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
});
