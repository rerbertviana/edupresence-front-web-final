"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ManagePanelShell } from "@/components/ui/manage-panel-shell";

import { TextInput } from "@/components/ui/text-input";

import { GraduationCap, Save, Ban, Pencil, Trash2 } from "lucide-react";

import type { CourseDTO, FormMode } from "../../domain/types";

type ManagePanelProps = {
  compact?: boolean;

  formMode: FormMode;
  setFormMode: (m: FormMode) => void;

  selectedCourseId: number | null;
  selectedCourse: CourseDTO | null;

  name: string;
  setName: (v: string) => void;

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
  selectedCourseId,
  selectedCourse,
  name,
  setName,
  isSaving,
  isDeleting,
  onNew,
  onOpenManageIfMobile,
  onCreate,
  onUpdate,
  onAskDelete,
}: ManagePanelProps) {
  const isFormDisabled = formMode === "view";
  const canSave = name.trim().length > 0 && !isSaving;

  return (
    <ManagePanelShell
      compact={compact}
      title="Gerenciar Curso"
      icon={<GraduationCap className="h-4 w-4 text-gray-600" />}
      showNewButton={formMode === "view" || formMode === "edit"}
      onNewClick={() => {
        onNew();
        onOpenManageIfMobile();
      }}
    >
        {!selectedCourseId && formMode !== "create" && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 mb-3">
            Selecione um curso para visualizar/editar.
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
            <label className="text-xs font-semibold text-gray-700">
              Nome do curso
            </label>

            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sistemas de Informação"
              disabled={isFormDisabled}
            />
          </div>

          <div className="sm:col-span-4 flex flex-col sm:flex-row gap-2 pt-1">
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
                  disabled={!selectedCourseId}
                  className={cn(
                    "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                    !selectedCourseId
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
                  disabled={!selectedCourseId || isDeleting}
                  className={cn(
                    "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                    !selectedCourseId || isDeleting
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
                  disabled={isSaving || name.trim().length === 0}
                  className={cn(
                    "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                    isSaving || name.trim().length === 0
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
                    if (selectedCourse) setName(selectedCourse.name ?? "");
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

          <div className="sm:col-span-4 text-[11px] text-gray-500">
            {formMode === "create" && (
              <>Dica: depois de criar, selecione o curso na lista.</>
            )}
            {formMode === "view" && selectedCourse && (
              <>
                Selecionado: <b>{selectedCourse.name}</b>
              </>
            )}
            {formMode === "edit" && (
              <>
                Obs: em modo <b>Editar</b>, altere apenas o nome do curso.
              </>
            )}
          </div>
        </form>
    </ManagePanelShell>
  );
});
