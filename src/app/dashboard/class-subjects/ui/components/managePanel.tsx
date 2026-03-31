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
  CirclePlus,
  Save,
  Ban,
  Pencil,
  Trash2,
  Check,
  ChevronDown,
  BookOpen,
  UserRound,
  Presentation,
} from "lucide-react";

import type {
  ClassDTO,
  ClassSubjectDTO,
  CourseDTO,
  SubjectDTO,
  TeacherDTO,
  FormMode,
} from "../../domain/types";

import {
  compareClassesBySemesterShiftDesc,
  getShiftBadgeClass,
  getShiftLabel,
} from "../../helpers/helpers";

import { normalizeText } from "@/lib/text";

type Props = {
  compact?: boolean;

  formMode: FormMode;
  setFormMode: (m: FormMode) => void;

  selectedLinkId: number | null;
  selectedLink: ClassSubjectDTO | null;

  classId: string;
  setClassId: (v: string) => void;

  subjectId: string;
  setSubjectId: (v: string) => void;

  teacherId: string;
  setTeacherId: (v: string) => void;

  classes: ClassDTO[] | undefined;
  courses: CourseDTO[] | undefined;
  subjects: SubjectDTO[] | undefined;
  teachers: TeacherDTO[] | undefined;

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
  selectedLinkId,
  selectedLink,
  classId,
  setClassId,
  subjectId,
  setSubjectId,
  teacherId,
  setTeacherId,
  classes,
  courses,
  subjects,
  teachers,
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
    classId.trim().length > 0 &&
    subjectId.trim().length > 0 &&
    teacherId.trim().length > 0;

  const getCourseNameByClass = useCallback(
    (c: ClassDTO) => {
      const direct = c.course?.name;
      if (direct) return direct;
      const cid = c.courseId ?? c.course?.id;
      return courses?.find((x) => x.id === cid)?.name ?? "—";
    },
    [courses],
  );

  const getClassLabelNoShift = useCallback(
    (c: ClassDTO) => {
      const semester = c.semester ?? "—";
      const courseName = getCourseNameByClass(c);
      return `${semester} - ${courseName}`;
    },
    [getCourseNameByClass],
  );

  const getSubjectLabel = useCallback((s: SubjectDTO) => s.name ?? "—", []);
  const getTeacherLabel = useCallback(
    (t: TeacherDTO) => t.user?.fullName ?? "Sem nome",
    [],
  );

  const orderedClasses = useMemo(() => {
    return [...(classes ?? [])].sort(compareClassesBySemesterShiftDesc);
  }, [classes]);

  const [classOpen, setClassOpen] = useState(false);
  const [classQuery, setClassQuery] = useState("");

  const selectedClass = useMemo(() => {
    const cid = Number(classId);
    if (!classId || Number.isNaN(cid) || !(classes?.length ?? 0)) return null;
    return classes!.find((c) => c.id === cid) ?? null;
  }, [classId, classes]);

  const classButtonLabel = useMemo(() => {
    if (!selectedClass) return "Selecione o semestre";
    return getClassLabelNoShift(selectedClass);
  }, [selectedClass, getClassLabelNoShift]);

  const filteredClasses = useMemo(() => {
    const base = orderedClasses;
    const q = normalizeText(classQuery);
    if (!q) return base;

    return base.filter((c) => {
      const hay = `${getClassLabelNoShift(c)} ${getShiftLabel(c.shift)}`;
      return normalizeText(hay).includes(q);
    });
  }, [orderedClasses, classQuery, getClassLabelNoShift]);

  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjectQuery, setSubjectQuery] = useState("");

  const selectedSubject = useMemo(() => {
    const sid = Number(subjectId);
    if (!subjectId || Number.isNaN(sid) || !(subjects?.length ?? 0))
      return null;
    return subjects!.find((s) => s.id === sid) ?? null;
  }, [subjectId, subjects]);

  const subjectButtonLabel = useMemo(() => {
    if (!selectedSubject) return "Selecione a disciplina";
    return getSubjectLabel(selectedSubject);
  }, [selectedSubject, getSubjectLabel]);

  const filteredSubjects = useMemo(() => {
    const base = subjects ?? [];
    const q = normalizeText(subjectQuery);
    if (!q) return base;
    return base.filter((s) => normalizeText(getSubjectLabel(s)).includes(q));
  }, [subjects, subjectQuery, getSubjectLabel]);

  const [teacherOpen, setTeacherOpen] = useState(false);
  const [teacherQuery, setTeacherQuery] = useState("");

  const selectedTeacher = useMemo(() => {
    const tid = Number(teacherId);
    if (!teacherId || Number.isNaN(tid) || !(teachers?.length ?? 0))
      return null;
    return teachers!.find((t) => t.id === tid) ?? null;
  }, [teacherId, teachers]);

  const teacherButtonLabel = useMemo(() => {
    if (!selectedTeacher) return "Selecione o(a) professor(a)";
    return getTeacherLabel(selectedTeacher);
  }, [selectedTeacher, getTeacherLabel]);

  const filteredTeachers = useMemo(() => {
    const base = teachers ?? [];
    const q = normalizeText(teacherQuery);
    if (!q) return base;
    return base.filter((t) => normalizeText(getTeacherLabel(t)).includes(q));
  }, [teachers, teacherQuery, getTeacherLabel]);

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col",
        compact ? "border-0 shadow-none rounded-none" : "shrink-0",
      )}
    >
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Presentation className="h-4 w-4 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-800">
            Gerenciar Turma
          </h2>
        </div>

        {(formMode === "view" || formMode === "edit") && (
          <button
            type="button"
            onClick={() => {
              onNew();
              onOpenManageIfMobile();
            }}
            className="h-8 px-3 rounded-md text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 whitespace-nowrap"
          >
            <CirclePlus className="h-4 w-4 inline mr-2" />
            Novo
          </button>
        )}
      </div>

      <div className={cn("p-4", compact && "pb-28")}>
        {!selectedLinkId && formMode !== "create" && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 mb-3">
            Selecione uma turma para visualizar/editar.
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
            <label className="text-xs font-semibold text-gray-700">
              Semestre
            </label>

            <Popover
              open={classOpen}
              onOpenChange={(open) => {
                if (isFormDisabled) return;
                setClassOpen(open);
                if (!open) setClassQuery("");
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isFormDisabled || !(classes?.length ?? 0)}
                  className={cn(
                    "w-full h-10 bg-white border-gray-200 text-gray-700",
                    "flex items-center justify-between gap-2 min-w-0",
                    !selectedClass && "text-gray-400",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate text-left">
                    {classes?.length ? classButtonLabel : "Sem turmas"}
                  </span>

                  {selectedClass && (
                    <span
                      className={cn(
                        "shrink-0 inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold",
                        getShiftBadgeClass(selectedClass.shift),
                      )}
                    >
                      {getShiftLabel(selectedClass.shift)}
                    </span>
                  )}

                  <ChevronDown className="h-4 w-4 shrink-0" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[--radix-popover-trigger-width] p-3">
                <div className="space-y-2">
                  <TextInput
                    value={classQuery}
                    onChange={(e) => setClassQuery(e.target.value)}
                    placeholder="Buscar semestre..."
                    className="h-9"
                  />

                  <div className="max-h-[260px] overflow-y-auto space-y-1">
                    {filteredClasses.length === 0 && (
                      <div className="text-xs text-gray-500 px-2 py-2">
                        Nenhum semestre encontrado.
                      </div>
                    )}

                    {filteredClasses.map((c) => {
                      const isSelected = String(c.id) === classId;

                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setClassId(String(c.id));
                            setClassOpen(false);
                            setClassQuery("");
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
                            <div className="min-w-0 flex items-center gap-2">
                              <span className="min-w-0 flex-1 truncate text-sm text-gray-800 font-semibold">
                                {getClassLabelNoShift(c)}
                              </span>

                              <span
                                className={cn(
                                  "shrink-0 inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold",
                                  getShiftBadgeClass(c.shift),
                                )}
                              >
                                {getShiftLabel(c.shift)}
                              </span>
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

          <div className="sm:col-span-3">
            <label className="text-xs font-semibold text-gray-700">
              Disciplina
            </label>

            <Popover
              open={subjectOpen}
              onOpenChange={(open) => {
                if (isFormDisabled) return;
                setSubjectOpen(open);
                if (!open) setSubjectQuery("");
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isFormDisabled || !(subjects?.length ?? 0)}
                  className={cn(
                    "w-full h-10 bg-white border-gray-200 text-gray-700",
                    "flex items-center justify-between gap-2 min-w-0",
                    !selectedSubject && "text-gray-400",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate text-left">
                    {subjects?.length ? subjectButtonLabel : "Sem disciplinas"}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[--radix-popover-trigger-width] p-3">
                <div className="space-y-2">
                  <TextInput
                    value={subjectQuery}
                    onChange={(e) => setSubjectQuery(e.target.value)}
                    placeholder="Buscar disciplina..."
                    className="h-9"
                  />

                  <div className="max-h-[260px] overflow-y-auto space-y-1">
                    {filteredSubjects.length === 0 && (
                      <div className="text-xs text-gray-500 px-2 py-2">
                        Nenhuma disciplina encontrada.
                      </div>
                    )}

                    {filteredSubjects.map((s) => {
                      const isSelected = String(s.id) === subjectId;

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSubjectId(String(s.id));
                            setSubjectOpen(false);
                            setSubjectQuery("");
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
                            {getSubjectLabel(s)}
                          </span>

                          <span className="shrink-0 inline-flex items-center gap-1 text-[11px] text-gray-500">
                            <BookOpen className="h-3.5 w-3.5" />
                            {s.workload ?? "—"}h
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
              Professor(a)
            </label>

            <Popover
              open={teacherOpen}
              onOpenChange={(open) => {
                if (isFormDisabled) return;
                setTeacherOpen(open);
                if (!open) setTeacherQuery("");
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isFormDisabled || !(teachers?.length ?? 0)}
                  className={cn(
                    "w-full h-10 bg-white border-gray-200 text-gray-700",
                    "flex items-center justify-between gap-2 min-w-0",
                    !selectedTeacher && "text-gray-400",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate text-left">
                    {teachers?.length ? teacherButtonLabel : "Sem professores"}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[--radix-popover-trigger-width] p-3">
                <div className="space-y-2">
                  <TextInput
                    value={teacherQuery}
                    onChange={(e) => setTeacherQuery(e.target.value)}
                    placeholder="Buscar professor(a)..."
                    className="h-9"
                  />

                  <div className="max-h-[260px] overflow-y-auto space-y-1">
                    {filteredTeachers.length === 0 && (
                      <div className="text-xs text-gray-500 px-2 py-2">
                        Nenhum professor encontrado.
                      </div>
                    )}

                    {filteredTeachers.map((t) => {
                      const isSelected = String(t.id) === teacherId;
                      const label = getTeacherLabel(t);

                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setTeacherId(String(t.id));
                            setTeacherOpen(false);
                            setTeacherQuery("");
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
                            {label}
                          </span>

                          <span className="shrink-0 inline-flex items-center gap-1 text-[11px] text-gray-500">
                            <UserRound className="h-3.5 w-3.5" />
                            prof
                          </span>
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
                  disabled={!selectedLinkId}
                  className={cn(
                    "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                    !selectedLinkId
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
                  disabled={!selectedLinkId || isDeleting}
                  className={cn(
                    "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                    !selectedLinkId || isDeleting
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
                    if (!selectedLink) return;
                    setClassId(String(selectedLink.classId));
                    setSubjectId(String(selectedLink.subjectId));
                    setTeacherId(String(selectedLink.teacherId));
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
              <>Dica: selecione semestre, disciplina e professor para criar.</>
            )}
            {formMode === "view" && selectedLink && (
              <>
                Selecionado: <b>Turma #{selectedLink.id}</b>
              </>
            )}
            {formMode === "edit" && (
              <>
                Obs: em modo <b>Editar</b>, você pode trocar os dados da turma.
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
});
