"use client";

import React from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { cn } from "@/lib/utils";

import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { MobileManageSheet } from "@/components/ui/mobile-manage-sheet";
import { Toast } from "@/components/ui/toast";

import { IdCard, Settings2, CirclePlus } from "lucide-react";

import { TextInput } from "@/components/ui/text-input";
import { ManagePanel } from "./components/managePanel";

import {
  useEnrollmentsController,
  type EnrollmentFormValues,
} from "../controller/useEnrollmentsController";
import type { EnrollmentDTO } from "../domain/types";

import { getShiftBadgeClass, getShiftLabel } from "../helpers/helpers";

export function EnrollmentsView() {
  const c = useEnrollmentsController();

  const totalCount = c.enrollmentsQuery.data?.length ?? 0;

  return (
    <DashboardShell>
      <div className="w-full h-full min-h-0 overflow-hidden">
        <div className="w-full h-full min-h-0 overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100 flex flex-col">
          <DeleteConfirmDialog
            open={!!c.enrollmentToDelete}
            loading={c.isDeleting}
            entityLabel="esta matrícula"
            onCancel={() => c.setEnrollmentToDelete(null)}
            onConfirm={c.confirmDelete}
          />

          {c.toast && (
            <Toast
              message={c.toast.message}
              type={c.toast.type}
              onClose={c.closeToast}
            />
          )}

          {!c.isLg && (
            <MobileManageSheet
              open={c.manageOpen}
              onOpenChange={c.setManageOpen}
              title={
                c.mobileHasSelected ? "Gerenciar Matrícula" : "Nova Matrícula"
              }
              description={
                c.mobileHasSelected ? "Editar/excluir." : "Criar matrícula."
              }
            >
              <ManagePanel
                compact
                formMode={c.formMode}
                setFormMode={c.setFormMode}
                selectedEnrollmentId={c.selectedEnrollmentId}
                selectedEnrollment={c.selectedEnrollment}
                courseId={c.formValues.courseId}
                setCourseId={(v) =>
                  c.setFormValues((p: EnrollmentFormValues) => ({
                    ...p,
                    courseId: v,
                  }))
                }
                studentId={c.formValues.studentId}
                setStudentId={(v) =>
                  c.setFormValues((p: EnrollmentFormValues) => ({
                    ...p,
                    studentId: v,
                  }))
                }
                classSubjectId={c.formValues.classSubjectId}
                setClassSubjectId={(v) =>
                  c.setFormValues((p: EnrollmentFormValues) => ({
                    ...p,
                    classSubjectId: v,
                  }))
                }
                students={c.students}
                classSubjects={c.classSubjects}
                courses={c.courses}
                filteredClassSubjects={c.filteredClassSubjects}
                isSaving={c.isSaving}
                isDeleting={c.isDeleting}
                onNew={c.handleNew}
                onOpenManageIfMobile={() => c.setManageOpen(true)}
                onCreate={c.create}
                onUpdate={c.update}
                onAskDelete={() => {
                  if (!c.selectedEnrollment) return;
                  c.setManageOpen(false);
                  setTimeout(() => c.setEnrollmentToDelete(c.selectedEnrollment), 180);
                }}
              />
            </MobileManageSheet>
          )}

          <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                Matrículas
              </h1>
              <p className="text-xs text-gray-500">
                Listar → Selecionar → Criar/editar/excluir
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold bg-slate-50 text-slate-700 border-slate-200">
              <IdCard className="h-4 w-4" />
              {totalCount} matrículas
            </span>
          </div>

          <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
            <section className="lg:col-span-5 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col min-h-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-gray-600" />
                  <h2 className="text-sm font-semibold text-gray-800">
                    Matrículas
                  </h2>
                </div>

                <span className="text-xs text-gray-500">
                  {c.filteredEnrollments.length} itens
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 min-h-0 overflow-y-auto">
                <TextInput
                  value={c.search}
                  onChange={(e) => c.setSearch(e.target.value)}
                  placeholder="Buscar matrícula (aluno, curso, matéria, professor)..."
                  className="h-9"
                />

                {(c.enrollmentsQuery.isLoading ||
                  c.studentsQuery.isLoading ||
                  c.classSubjectsQuery.isLoading ||
                  c.coursesQuery.isLoading) && (
                  <div className="text-xs text-gray-500">Carregando...</div>
                )}

                {(c.enrollmentsQuery.isError ||
                  c.studentsQuery.isError ||
                  c.classSubjectsQuery.isError ||
                  c.coursesQuery.isError) && (
                  <div className="text-xs text-red-500">
                    Erro ao carregar dados.
                    <span className="block text-[11px] text-gray-500 mt-1">
                      {String((c.enrollmentsQuery.error as any)?.message ?? "")}
                      {String((c.studentsQuery.error as any)?.message ?? "")}
                      {String(
                        (c.classSubjectsQuery.error as any)?.message ?? "",
                      )}
                      {String((c.coursesQuery.error as any)?.message ?? "")}
                    </span>
                  </div>
                )}

                {!c.enrollmentsQuery.isLoading &&
                  !c.enrollmentsQuery.isError &&
                  c.filteredEnrollments.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                      Nenhuma matrícula cadastrada.
                    </div>
                  )}

                <div className="space-y-2">
                  {c.filteredEnrollments.map((enrollment: EnrollmentDTO) => {
                    const isActive = enrollment.id === c.selectedEnrollmentId;

                    const student = enrollment.student;
                    const classSubject = enrollment.classSubject;
                    const classEntity = classSubject?.class;
                    const course = classEntity?.course;

                    const studentName = student?.user?.fullName ?? "Sem nome";
                    const registration = student?.registrationNumber ?? "—";
                    const semester = classEntity?.semester ?? "—";
                    const shiftLabel = getShiftLabel(classEntity?.shift);
                    const courseName = course?.name ?? "—";
                    const subjectName = classSubject?.subject?.name ?? "—";
                    const teacherName =
                      classSubject?.teacher?.user?.fullName ?? "—";

                    return (
                      <button
                        key={enrollment.id}
                        type="button"
                        onClick={() => c.setSelectedEnrollmentId(enrollment.id)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-3 text-left transition",
                          isActive
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-800 text-sm truncate">
                              {studentName}
                            </div>

                            <div className="text-xs text-gray-600 mt-1 truncate">
                              Matrícula:{" "}
                              <span className="font-semibold">
                                {registration}
                              </span>
                            </div>

                            <div className="text-xs text-gray-500 mt-1 truncate">
                              {courseName} • {semester} • {subjectName}
                            </div>

                            <div className="text-[11px] text-gray-400 mt-1 truncate">
                              {teacherName}
                            </div>
                          </div>

                          <div className="shrink-0 flex flex-col lg:flex-row lg:items-center items-end gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold",
                                getShiftBadgeClass(classEntity?.shift),
                              )}
                            >
                              {shiftLabel}
                            </span>

                            <span
                              className={cn(
                                "inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold",
                                isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-50 text-slate-700 border-slate-200",
                              )}
                            >
                              {isActive ? "Selecionado" : "Selecionar"}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!c.isLg && <div className="h-2" />}
              </div>

              {!c.isLg && (
                <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                  <button
                    type="button"
                    onClick={c.openSmartSheet}
                    className={cn(
                      "h-10 w-full rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border transition",
                      c.mobileHasSelected
                        ? "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
                    )}
                  >
                    {c.mobileHasSelected ? (
                      <>
                        <Settings2 className="h-4 w-4" />
                        Gerenciar matrícula
                      </>
                    ) : (
                      <>
                        <CirclePlus className="h-4 w-4" />
                        Nova matrícula
                      </>
                    )}
                  </button>
                </div>
              )}
            </section>

            {c.isLg && (
              <section className="lg:col-span-7 flex flex-col min-h-0 overflow-hidden">
                <ManagePanel
                  formMode={c.formMode}
                  setFormMode={c.setFormMode}
                  selectedEnrollmentId={c.selectedEnrollmentId}
                  selectedEnrollment={c.selectedEnrollment}
                  courseId={c.formValues.courseId}
                  setCourseId={(v) =>
                    c.setFormValues((p: EnrollmentFormValues) => ({
                      ...p,
                      courseId: v,
                    }))
                  }
                  studentId={c.formValues.studentId}
                  setStudentId={(v) =>
                    c.setFormValues((p: EnrollmentFormValues) => ({
                      ...p,
                      studentId: v,
                    }))
                  }
                  classSubjectId={c.formValues.classSubjectId}
                  setClassSubjectId={(v) =>
                    c.setFormValues((p: EnrollmentFormValues) => ({
                      ...p,
                      classSubjectId: v,
                    }))
                  }
                  students={c.students}
                  classSubjects={c.classSubjects}
                  courses={c.courses}
                  filteredClassSubjects={c.filteredClassSubjects}
                  isSaving={c.isSaving}
                  isDeleting={c.isDeleting}
                  onNew={c.handleNew}
                  onOpenManageIfMobile={c.openManageIfMobile}
                  onCreate={c.create}
                  onUpdate={c.update}
                  onAskDelete={() =>
                    c.setEnrollmentToDelete(c.selectedEnrollment)
                  }
                />
              </section>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
