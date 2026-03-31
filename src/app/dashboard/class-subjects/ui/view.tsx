"use client";

import React from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { cn } from "@/lib/utils";

import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { MobileManageSheet } from "@/components/ui/mobile-manage-sheet";
import { Toast } from "@/components/ui/toast";

import { Presentation, Settings2, CirclePlus } from "lucide-react";

import { TextInput } from "@/components/ui/text-input";
import { ManagePanel } from "./components/managePanel";

import { useClassSubjectsController } from "../controller/useClassSubjectsController";
import { getShiftBadgeClass, getShiftLabel } from "../helpers/helpers";

export function ClassSubjectsView() {
  const c = useClassSubjectsController();

  const totalCount = c.linksQuery.data?.length ?? 0;

  return (
    <DashboardShell>
      <div className="w-full h-full min-h-0 overflow-hidden">
        <div className="w-full h-full min-h-0 overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100 flex flex-col">
          <DeleteConfirmDialog
            open={!!c.linkToDelete}
            loading={c.isDeleting}
            entityLabel="esta turma"
            onCancel={() => c.setLinkToDelete(null)}
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
              title={c.mobileHasSelected ? "Gerenciar Turma" : "Nova Turma"}
              description={
                c.mobileHasSelected ? "Editar/excluir." : "Criar uma nova turma."
              }
            >
              <ManagePanel
                compact
                formMode={c.formMode}
                setFormMode={c.setFormMode}
                selectedLinkId={c.selectedLinkId}
                selectedLink={c.selectedLink}
                classes={c.classes}
                courses={c.courses}
                subjects={c.subjects}
                teachers={c.teachers}
                classId={c.classId}
                setClassId={c.setClassId}
                subjectId={c.subjectId}
                setSubjectId={c.setSubjectId}
                teacherId={c.teacherId}
                setTeacherId={c.setTeacherId}
                isSaving={c.isSaving}
                isDeleting={c.isDeleting}
                onNew={c.handleNew}
                onOpenManageIfMobile={() => c.setManageOpen(true)}
                onCreate={c.create}
                onUpdate={c.update}
                onAskDelete={() => {
                  if (!c.selectedLink) return;
                  c.setManageOpen(false);
                  setTimeout(() => c.setLinkToDelete(c.selectedLink), 180);
                }}
              />
            </MobileManageSheet>
          )}

          <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Turmas</h1>
              <p className="text-xs text-gray-500">
                Listar → Selecionar → Criar/editar/excluir
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold bg-slate-50 text-slate-700 border-slate-200">
              <Presentation className="h-4 w-4" />
              {totalCount} turmas
            </span>
          </div>

          <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
            <section className="lg:col-span-5 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col min-h-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Presentation className="h-4 w-4 text-gray-600" />
                  <h2 className="text-sm font-semibold text-gray-800">
                    Turmas
                  </h2>
                </div>

                <span className="text-xs text-gray-500">
                  {c.filteredLinks.length} itens
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 min-h-0 overflow-y-auto">
                <TextInput
                  value={c.search}
                  onChange={(e) => c.setSearch(e.target.value)}
                  placeholder="Buscar (turma, disciplina, professor)..."
                  className="h-9"
                />

                {(c.linksQuery.isLoading ||
                  c.coursesQuery.isLoading ||
                  c.classesQuery.isLoading ||
                  c.subjectsQuery.isLoading ||
                  c.teachersQuery.isLoading) && (
                  <div className="text-xs text-gray-500">Carregando...</div>
                )}

                {(c.linksQuery.isError ||
                  c.coursesQuery.isError ||
                  c.classesQuery.isError ||
                  c.subjectsQuery.isError ||
                  c.teachersQuery.isError) && (
                  <div className="text-xs text-red-500">
                    Erro ao carregar dados.
                    <span className="block text-[11px] text-gray-500 mt-1">
                      {String((c.linksQuery.error as any)?.message ?? "")}
                      {String((c.coursesQuery.error as any)?.message ?? "")}
                      {String((c.classesQuery.error as any)?.message ?? "")}
                      {String((c.subjectsQuery.error as any)?.message ?? "")}
                      {String((c.teachersQuery.error as any)?.message ?? "")}
                    </span>
                  </div>
                )}

                {!c.linksQuery.isLoading &&
                  !c.linksQuery.isError &&
                  c.filteredLinks.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                      Nenhuma turma cadastrada.
                    </div>
                  )}

                <div className="space-y-2">
                  {c.filteredLinks.map((item) => {
                    const isActive = item.id === c.selectedLinkId;

                    const cl =
                      item.class ??
                      (c.classes ?? []).find((x) => x.id === item.classId);

                    const sb =
                      item.subject ??
                      (c.subjects ?? []).find((x) => x.id === item.subjectId);

                    const tc =
                      item.teacher ??
                      (c.teachers ?? []).find((x) => x.id === item.teacherId);

                    const classLabel = c.getClassLabelNoShift(cl);
                    const shiftLabel = getShiftLabel(cl?.shift);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => c.setSelectedLinkId(item.id)}
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
                              {sb?.name ?? "Disciplina —"}
                            </div>

                            <div className="text-xs text-gray-600 mt-1 truncate">
                              {tc?.user?.fullName ?? "Professor —"}
                            </div>

                            <div className="text-xs text-gray-500 mt-1 truncate">
                              {classLabel}
                            </div>
                          </div>

                          <div className="shrink-0 flex flex-col lg:flex-row lg:items-center items-end gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold",
                                getShiftBadgeClass(cl?.shift),
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
                        Gerenciar turma
                      </>
                    ) : (
                      <>
                        <CirclePlus className="h-4 w-4" />
                        Nova turma
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
                  selectedLinkId={c.selectedLinkId}
                  selectedLink={c.selectedLink}
                  classes={c.classes}
                  courses={c.courses}
                  subjects={c.subjects}
                  teachers={c.teachers}
                  classId={c.classId}
                  setClassId={c.setClassId}
                  subjectId={c.subjectId}
                  setSubjectId={c.setSubjectId}
                  teacherId={c.teacherId}
                  setTeacherId={c.setTeacherId}
                  isSaving={c.isSaving}
                  isDeleting={c.isDeleting}
                  onNew={c.handleNew}
                  onOpenManageIfMobile={c.openManageIfMobile}
                  onCreate={c.create}
                  onUpdate={c.update}
                  onAskDelete={() => c.setLinkToDelete(c.selectedLink)}
                />
              </section>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
