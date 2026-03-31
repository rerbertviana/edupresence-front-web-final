"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DashboardShell } from "@/components/layout/DashboardShell";

import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { MobileManageSheet } from "@/components/ui/mobile-manage-sheet";
import { Toast } from "@/components/ui/toast";
import { TextInput } from "@/components/ui/text-input";

import { GraduationCap, Settings2, CirclePlus } from "lucide-react";
import { ManagePanel } from "./components/ManagePanel";
import type { CoursesController } from "../controller/useCoursesController";

type Props = { controller: CoursesController };

export function CoursesView({ controller }: Props) {
  const {
    isLg,
    data,
    isLoading,
    isError,
    error,

    filteredCourses,
    selectedCourse,
    selectedCourseId,
    setSelectedCourseId,

    search,
    setSearch,

    formMode,
    setFormMode,

    name,
    setName,

    manageOpen,
    setManageOpen,

    toast,
    closeToast,

    courseToDelete,
    setCourseToDelete,

    isSaving,
    isDeleting,

    handleNew,
    openManageIfMobile,
    openSmartSheet,

    create,
    update,

    confirmDelete,
    cancelDelete,
  } = controller;

  const mobileHasSelected = !!selectedCourseId;

  return (
    <DashboardShell>
      <div className="w-full h-full min-h-0 overflow-hidden">
        <div className="w-full h-full min-h-0 overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100 flex flex-col">
          <DeleteConfirmDialog
            open={!!courseToDelete}
            loading={isDeleting}
            entityLabel="o curso"
            entityName={courseToDelete?.name}
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

          {!isLg && (
            <MobileManageSheet
              open={manageOpen}
              onOpenChange={setManageOpen}
              title={mobileHasSelected ? "Gerenciar Curso" : "Novo Curso"}
              description={
                mobileHasSelected ? "Editar/excluir." : "Criar um novo curso."
              }
            >
              <ManagePanel
                compact
                formMode={formMode}
                setFormMode={setFormMode}
                selectedCourseId={selectedCourseId}
                selectedCourse={selectedCourse}
                name={name}
                setName={setName}
                isSaving={isSaving}
                isDeleting={isDeleting}
                onNew={handleNew}
                onOpenManageIfMobile={() => setManageOpen(true)}
                onCreate={create}
                onUpdate={update}
                onAskDelete={() => {
                  if (!selectedCourse) return;
                  setManageOpen(false);
                  setTimeout(() => setCourseToDelete(selectedCourse), 180);
                }}
              />
            </MobileManageSheet>
          )}

          <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Cursos</h1>
              <p className="text-xs text-gray-500">
                Listar → Selecionar → Criar/editar/excluir
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold bg-slate-50 text-slate-700 border-slate-200">
              <GraduationCap className="h-4 w-4" />
              {data?.length ?? 0} cursos
            </span>
          </div>

          <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
            <section className="lg:col-span-5 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col min-h-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-gray-600" />
                  <h2 className="text-sm font-semibold text-gray-800">
                    Cursos
                  </h2>
                </div>

                <span className="text-xs text-gray-500">
                  {filteredCourses.length} itens
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 min-h-0 overflow-y-auto">
                <TextInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar curso..."
                  className={cn("h-9")}
                />

                {isLoading && (
                  <div className="text-xs text-gray-500">Carregando...</div>
                )}

                {isError && (
                  <div className="text-xs text-red-500">
                    Erro ao carregar cursos.
                    <span className="block text-[11px] text-gray-500 mt-1">
                      {String((error as any)?.message ?? "")}
                    </span>
                  </div>
                )}

                {!isLoading && !isError && filteredCourses.length === 0 && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                    Nenhum curso encontrado.
                  </div>
                )}

                <div className="space-y-2">
                  {filteredCourses.map((course) => {
                    const isActive = course.id === selectedCourseId;

                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => setSelectedCourseId(course.id)}
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
                              {course.name}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
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

                {!isLg && <div className="h-2" />}
              </div>

              {!isLg && (
                <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                  <button
                    type="button"
                    onClick={openSmartSheet}
                    className={cn(
                      "h-10 w-full rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border transition",
                      mobileHasSelected
                        ? "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
                    )}
                  >
                    {mobileHasSelected ? (
                      <>
                        <Settings2 className="h-4 w-4" />
                        Gerenciar curso
                      </>
                    ) : (
                      <>
                        <CirclePlus className="h-4 w-4" />
                        Novo curso
                      </>
                    )}
                  </button>
                </div>
              )}
            </section>

            {isLg && (
              <section className="lg:col-span-7 flex flex-col min-h-0 overflow-hidden">
                <ManagePanel
                  formMode={formMode}
                  setFormMode={setFormMode}
                  selectedCourseId={selectedCourseId}
                  selectedCourse={selectedCourse}
                  name={name}
                  setName={setName}
                  isSaving={isSaving}
                  isDeleting={isDeleting}
                  onNew={handleNew}
                  onOpenManageIfMobile={openManageIfMobile}
                  onCreate={create}
                  onUpdate={update}
                  onAskDelete={() => setCourseToDelete(selectedCourse)}
                />
              </section>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
