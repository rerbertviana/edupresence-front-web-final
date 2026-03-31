"use client";

import React from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { cn } from "@/lib/utils";

import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { MobileManageSheet } from "@/components/ui/mobile-manage-sheet";
import { Toast } from "@/components/ui/toast";

import { BookOpen, Settings2, CirclePlus, Clock3 } from "lucide-react";

import { TextInput } from "@/components/ui/text-input";
import { ManagePanel } from "./components/ManagePanel";

import { useSubjectsController } from "../controller/useSubjectsController";

export function SubjectsView() {
  const c = useSubjectsController();

  return (
    <DashboardShell>
      <div className="w-full h-full min-h-0 overflow-hidden">
        <div className="w-full h-full min-h-0 overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100 flex flex-col">
          <DeleteConfirmDialog
            open={!!c.subjectToDelete}
            loading={c.isDeleting}
            entityLabel="a disciplina"
            entityName={c.subjectToDelete?.name}
            onCancel={() => c.setSubjectToDelete(null)}
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
                c.mobileHasSelected ? "Gerenciar Disciplina" : "Nova Disciplina"
              }
              description={
                c.mobileHasSelected
                  ? "Editar/excluir."
                  : "Criar uma nova disciplina."
              }
            >
              <ManagePanel
                compact
                formMode={c.formMode}
                setFormMode={c.setFormMode}
                selectedSubjectId={c.selectedSubjectId}
                selectedSubject={c.selectedSubject}
                name={c.formValues.name}
                setName={(v) => c.setFormValues((p) => ({ ...p, name: v }))}
                workload={c.formValues.workload}
                setWorkload={(v) => c.setFormValues((p) => ({ ...p, workload: v }))}
                isSaving={c.isSaving}
                isDeleting={c.isDeleting}
                onNew={c.handleNew}
                onOpenManageIfMobile={() => c.setManageOpen(true)}
                onCreate={c.create}
                onUpdate={c.update}
                onAskDelete={() => {
                  if (!c.selectedSubject) return;
                  c.setManageOpen(false);
                  setTimeout(() => c.setSubjectToDelete(c.selectedSubject), 180);
                }}
              />
            </MobileManageSheet>
          )}

          <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                Disciplinas
              </h1>
              <p className="text-xs text-gray-500">
                Listar → Selecionar → Criar/editar/excluir
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold bg-slate-50 text-slate-700 border-slate-200">
              <BookOpen className="h-4 w-4" />
              {c.subjectsQuery.data?.length ?? 0} disciplinas
            </span>
          </div>

          <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
            <section className="lg:col-span-5 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col min-h-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-600" />
                  <h2 className="text-sm font-semibold text-gray-800">
                    Disciplinas
                  </h2>
                </div>

                <span className="text-xs text-gray-500">
                  {c.filteredSubjects.length} itens
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 min-h-0 overflow-y-auto">
                <TextInput
                  value={c.search}
                  onChange={(e) => c.setSearch(e.target.value)}
                  placeholder="Buscar disciplina..."
                  className="h-9"
                />

                {c.subjectsQuery.isLoading && (
                  <div className="text-xs text-gray-500">Carregando...</div>
                )}

                {c.subjectsQuery.isError && (
                  <div className="text-xs text-red-500">
                    Erro ao carregar disciplinas.
                    <span className="block text-[11px] text-gray-500 mt-1">
                      {String((c.subjectsQuery.error as any)?.message ?? "")}
                    </span>
                  </div>
                )}

                {!c.subjectsQuery.isLoading &&
                  !c.subjectsQuery.isError &&
                  c.filteredSubjects.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                      Nenhuma disciplina cadastrada.
                    </div>
                  )}

                <div className="space-y-2">
                  {c.filteredSubjects.map((subject) => {
                    const isActive = subject.id === c.selectedSubjectId;

                    return (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => c.setSelectedSubjectId(subject.id)}
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
                              {subject.name}
                            </div>

                            <div className="text-xs text-gray-600 mt-1 inline-flex items-center gap-2">
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="h-3.5 w-3.5 text-gray-500" />
                                <span className="font-semibold">
                                  {subject.workload}h
                                </span>
                              </span>
                            </div>
                          </div>

                          <span
                            className={cn(
                              "inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold shrink-0",
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-50 text-slate-700 border-slate-200",
                            )}
                          >
                            {isActive ? "Selecionada" : "Selecionar"}
                          </span>
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
                        Gerenciar disciplina
                      </>
                    ) : (
                      <>
                        <CirclePlus className="h-4 w-4" />
                        Nova disciplina
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
                  selectedSubjectId={c.selectedSubjectId}
                  selectedSubject={c.selectedSubject}
                  name={c.formValues.name}
                  setName={(v) => c.setFormValues((p) => ({ ...p, name: v }))}
                  workload={c.formValues.workload}
                  setWorkload={(v) =>
                    c.setFormValues((p) => ({ ...p, workload: v }))
                  }
                  isSaving={c.isSaving}
                  isDeleting={c.isDeleting}
                  onNew={c.handleNew}
                  onOpenManageIfMobile={c.openManageIfMobile}
                  onCreate={c.create}
                  onUpdate={c.update}
                  onAskDelete={() => c.setSubjectToDelete(c.selectedSubject)}
                />
              </section>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
