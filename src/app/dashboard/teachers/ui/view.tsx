"use client";

import React from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { cn } from "@/lib/utils";

import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { MobileManageSheet } from "@/components/ui/mobile-manage-sheet";
import { Toast } from "@/components/ui/toast";

import { FilePen, Settings2, CirclePlus } from "lucide-react";

import { TextInput } from "@/components/ui/text-input";
import { ManagePanel } from "./components/ManagePanel";

import { useTeachersController } from "../controller/useTeachersController";

export function TeachersView() {
  const c = useTeachersController();

  const totalCount = c.teachersQuery.data?.length ?? 0;

  return (
    <DashboardShell>
      <div className="w-full h-full min-h-0 overflow-hidden">
        <div className="w-full h-full min-h-0 overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100 flex flex-col">
          <DeleteConfirmDialog
            open={!!c.teacherToDelete}
            loading={c.isDeleting}
            entityLabel="o(a) professor(a)"
            entityName={c.teacherToDelete?.user?.fullName ?? "Sem nome"}
            onCancel={() => c.setTeacherToDelete(null)}
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
                c.mobileHasSelected ? "Gerenciar Professor" : "Novo Professor"
              }
              description={
                c.mobileHasSelected
                  ? "Editar/excluir."
                  : "Criar um novo professor."
              }
            >
              <ManagePanel
                compact
                formMode={c.formMode}
                setFormMode={c.setFormMode}
                selectedTeacherId={c.selectedTeacherId}
                selectedTeacher={c.selectedTeacher}
                fullName={c.formValues.fullName}
                setFullName={(v) =>
                  c.setFormValues((p) => ({ ...p, fullName: v }))
                }
                email={c.formValues.email}
                setEmail={(v) => c.setFormValues((p) => ({ ...p, email: v }))}
                password={c.formValues.password}
                setPassword={(v) =>
                  c.setFormValues((p) => ({ ...p, password: v }))
                }
                siapeCode={c.formValues.siapeCode}
                setSiapeCode={(v) =>
                  c.setFormValues((p) => ({ ...p, siapeCode: v }))
                }
                teachingArea={c.formValues.teachingArea}
                setTeachingArea={(v) =>
                  c.setFormValues((p) => ({ ...p, teachingArea: v }))
                }
                isSaving={c.isSaving}
                isDeleting={c.isDeleting}
                onNew={c.handleNew}
                onOpenManageIfMobile={() => c.setManageOpen(true)}
                onCreate={c.create}
                onUpdate={c.update}
                onAskDelete={() => {
                  if (!c.selectedTeacher) return;
                  c.setManageOpen(false);
                  setTimeout(() => c.setTeacherToDelete(c.selectedTeacher), 180);
                }}
              />
            </MobileManageSheet>
          )}

          <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                Professores
              </h1>
              <p className="text-xs text-gray-500">
                Listar → Selecionar → Criar/editar/excluir
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold bg-slate-50 text-slate-700 border-slate-200">
              <FilePen className="h-4 w-4" />
              {totalCount} professores
            </span>
          </div>

          <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
            <section className="lg:col-span-5 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col min-h-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <FilePen className="h-4 w-4 text-gray-600" />
                  <h2 className="text-sm font-semibold text-gray-800">
                    Professores
                  </h2>
                </div>

                <span className="text-xs text-gray-500">
                  {c.filteredTeachers.length} itens
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 min-h-0 overflow-y-auto">
                <TextInput
                  value={c.search}
                  onChange={(e) => c.setSearch(e.target.value)}
                  placeholder="Buscar professor..."
                  className="h-9"
                />

                {c.teachersQuery.isLoading && (
                  <div className="text-xs text-gray-500">Carregando...</div>
                )}

                {c.teachersQuery.isError && (
                  <div className="text-xs text-red-500">
                    Erro ao carregar professores.
                    <span className="block text-[11px] text-gray-500 mt-1">
                      {String((c.teachersQuery.error as any)?.message ?? "")}
                    </span>
                  </div>
                )}

                {!c.teachersQuery.isLoading &&
                  !c.teachersQuery.isError &&
                  c.filteredTeachers.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                      Nenhum professor cadastrado.
                    </div>
                  )}

                <div className="space-y-2">
                  {c.filteredTeachers.map((teacher) => {
                    const isActive = teacher.id === c.selectedTeacherId;

                    return (
                      <button
                        key={teacher.id}
                        type="button"
                        onClick={() => c.setSelectedTeacherId(teacher.id)}
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
                              {teacher.user?.fullName ?? "—"}
                            </div>

                            <div className="text-xs text-gray-600 mt-1 truncate">
                              E-mail:{" "}
                              <span className="font-semibold">
                                {teacher.user?.email ?? "—"}
                              </span>
                            </div>

                            <div className="text-xs text-gray-500 mt-1 truncate">
                              SIAPE:{" "}
                              <span className="font-semibold">
                                {teacher.siapeCode ?? "—"}
                              </span>{" "}
                              • Área:{" "}
                              <span className="font-semibold">
                                {teacher.teachingArea ?? "—"}
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
                            {isActive ? "Selecionado" : "Selecionar"}
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
                        Gerenciar professor
                      </>
                    ) : (
                      <>
                        <CirclePlus className="h-4 w-4" />
                        Novo professor
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
                  selectedTeacherId={c.selectedTeacherId}
                  selectedTeacher={c.selectedTeacher}
                  fullName={c.formValues.fullName}
                  setFullName={(v) =>
                    c.setFormValues((p) => ({ ...p, fullName: v }))
                  }
                  email={c.formValues.email}
                  setEmail={(v) => c.setFormValues((p) => ({ ...p, email: v }))}
                  password={c.formValues.password}
                  setPassword={(v) =>
                    c.setFormValues((p) => ({ ...p, password: v }))
                  }
                  siapeCode={c.formValues.siapeCode}
                  setSiapeCode={(v) =>
                    c.setFormValues((p) => ({ ...p, siapeCode: v }))
                  }
                  teachingArea={c.formValues.teachingArea}
                  setTeachingArea={(v) =>
                    c.setFormValues((p) => ({ ...p, teachingArea: v }))
                  }
                  isSaving={c.isSaving}
                  isDeleting={c.isDeleting}
                  onNew={c.handleNew}
                  onOpenManageIfMobile={c.openManageIfMobile}
                  onCreate={c.create}
                  onUpdate={c.update}
                  onAskDelete={() => c.setTeacherToDelete(c.selectedTeacher)}
                />
              </section>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
