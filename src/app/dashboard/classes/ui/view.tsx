"use client";

import React from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { cn } from "@/lib/utils";

import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { MobileManageSheet } from "@/components/ui/mobile-manage-sheet";
import { Toast } from "@/components/ui/toast";

import { Layers, Settings2, CirclePlus, Clock3 } from "lucide-react";

import type { ClassesController } from "../controller/useClassesController";
import { ManagePanel } from "./components/ManagePanel";
import { shiftLabel, shiftPillClass } from "../helpers/helpers";

type Props = { controller: ClassesController };

export function ClassesView({ controller }: Props) {
  const {
    isLg,

    courses,
    filteredClasses,
    selectedClass,
    selectedClassId,
    setSelectedClassId,

    totalCount,

    isLoadingCourses,
    isLoadingClasses,
    isCoursesError,
    isClassesError,
    coursesError,
    classesError,

    manageOpen,
    setManageOpen,

    search,
    setSearch,

    formMode,
    setFormMode,

    years,
    formValues,
    setFormValues,

    toast,
    closeToast,

    classToDelete,
    setClassToDelete,

    isSaving,
    isDeleting,

    handleNew,
    openManageIfMobile,
    openSmartSheet,

    create,
    update,
    confirmDelete,
  } = controller;

  const mobileHasSelected = !!selectedClassId;

  return (
    <DashboardShell>
      <div className="w-full h-full min-h-0 overflow-hidden">
        <div className="w-full h-full min-h-0 overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100 flex flex-col">
          <DeleteConfirmDialog
            open={!!classToDelete}
            loading={isDeleting}
            entityLabel="o semestre"
            entityName={classToDelete?.semester}
            onCancel={() => setClassToDelete(null)}
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
              title={mobileHasSelected ? "Gerenciar Semestre" : "Novo Semestre"}
              description={
                mobileHasSelected
                  ? "Editar/excluir."
                  : "Criar um novo semestre."
              }
            >
              <ManagePanel
                compact
                formMode={formMode}
                setFormMode={setFormMode}
                selectedClassId={selectedClassId}
                selectedClass={selectedClass}
                courses={courses ?? []}
                years={years}
                formValues={formValues}
                setFormValues={setFormValues}
                isSaving={isSaving}
                isDeleting={isDeleting}
                onNew={handleNew}
                onOpenManageIfMobile={() => setManageOpen(true)}
                onCreate={create}
                onUpdate={update}
                onAskDelete={() => {
                  if (!selectedClass) return;
                  setManageOpen(false);
                  setTimeout(() => setClassToDelete(selectedClass), 180);
                }}
              />
            </MobileManageSheet>
          )}

          <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Semestres</h1>
              <p className="text-xs text-gray-500">
                Listar → Selecionar → Criar/editar/excluir
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold bg-slate-50 text-slate-700 border-slate-200">
              <Layers className="h-4 w-4" />
              {totalCount} semestres
            </span>
          </div>

          <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
            <section className="lg:col-span-5 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col min-h-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-gray-600" />
                  <h2 className="text-sm font-semibold text-gray-800">
                    Semestres
                  </h2>
                </div>

                <span className="text-xs text-gray-500">
                  {filteredClasses.length} itens
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 min-h-0 overflow-y-auto">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar semestre..."
                  className={cn(
                    "w-full h-9 rounded-md border bg-white px-3 text-sm text-gray-800 outline-none",
                    "placeholder:text-gray-400",
                    "focus:border-gray-400 focus:ring-2 focus:ring-gray-300 focus:ring-offset-0",
                    "border-gray-200",
                  )}
                />

                {(isLoadingCourses || isLoadingClasses) && (
                  <div className="text-xs text-gray-500">Carregando...</div>
                )}

                {(isCoursesError || isClassesError) && (
                  <div className="text-xs text-red-500">
                    Erro ao carregar.
                    <span className="block text-[11px] text-gray-500 mt-1">
                      {String(
                        (isClassesError
                          ? (classesError as any)?.message
                          : (coursesError as any)?.message) ?? "",
                      )}
                    </span>
                  </div>
                )}

                {!isLoadingCourses &&
                  !isLoadingClasses &&
                  !isCoursesError &&
                  !isClassesError &&
                  filteredClasses.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                      Nenhum semestre cadastrado.
                    </div>
                  )}

                <div className="space-y-2">
                  {filteredClasses.map((classEntity) => {
                    const isActive = classEntity.id === selectedClassId;
                    const courseName =
                      courses?.find((c) => c.id === classEntity.courseId)
                        ?.name ?? "—";

                    return (
                      <button
                        key={classEntity.id}
                        type="button"
                        onClick={() => setSelectedClassId(classEntity.id)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-3 text-left transition",
                          isActive
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span
                              className={cn(
                                "inline-flex items-center gap-2 rounded-md border px-2 py-1 text-[11px] font-semibold",
                                shiftPillClass(classEntity.shift),
                              )}
                            >
                              <Clock3 className="h-3.5 w-3.5" />
                              {shiftLabel(classEntity.shift)}
                            </span>

                            <div className="mt-2 font-semibold text-gray-800 text-sm truncate">
                              {courseName}
                            </div>

                            <div className="text-xs text-gray-600 mt-1">
                              Semestre:{" "}
                              <span className="font-semibold">
                                {classEntity.semester}
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
                        Gerenciar semestre
                      </>
                    ) : (
                      <>
                        <CirclePlus className="h-4 w-4" />
                        Novo semestre
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
                  selectedClassId={selectedClassId}
                  selectedClass={selectedClass}
                  courses={courses ?? []}
                  years={years}
                  formValues={formValues}
                  setFormValues={setFormValues}
                  isSaving={isSaving}
                  isDeleting={isDeleting}
                  onNew={handleNew}
                  onOpenManageIfMobile={openManageIfMobile}
                  onCreate={create}
                  onUpdate={update}
                  onAskDelete={() => setClassToDelete(selectedClass)}
                />
              </section>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
