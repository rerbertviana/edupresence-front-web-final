"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ManagePanelShell } from "@/components/ui/manage-panel-shell";

import { BookOpen, Pencil, Trash2, Save, Ban } from "lucide-react";

import { TextInput } from "@/components/ui/text-input";

import type { FormMode, SubjectDTO } from "../../domain/types";

type ManagePanelProps = {
  compact?: boolean;

  formMode: FormMode;
  setFormMode: (m: FormMode) => void;

  selectedSubjectId: number | null;
  selectedSubject: SubjectDTO | null;

  name: string;
  setName: (v: string) => void;

  workload: string;
  setWorkload: (v: string) => void;

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
  selectedSubjectId,
  selectedSubject,
  name,
  setName,
  workload,
  setWorkload,
  isSaving,
  isDeleting,
  onNew,
  onOpenManageIfMobile,
  onCreate,
  onUpdate,
  onAskDelete,
}: ManagePanelProps) {
  const isFormDisabled = formMode === "view";

  const workloadNumber = Number(workload);
  const canSave =
    name.trim().length > 0 &&
    workload.trim().length > 0 &&
    !Number.isNaN(workloadNumber) &&
    workloadNumber > 0 &&
    !isSaving;

  return (
    <ManagePanelShell
      compact={compact}
      title={formMode === "create" ? "Nova Disciplina" : "Gerenciar Disciplina"}
      icon={<BookOpen className="h-4 w-4 text-gray-600" />}
      showNewButton={formMode === "view" || formMode === "edit"}
      onNewClick={() => {
        onNew();
        onOpenManageIfMobile();
      }}
    >
        {!selectedSubjectId && formMode !== "create" && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 mb-3">
            Selecione uma disciplina para visualizar/editar.
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
          <div className="sm:col-span-3">
            <label className="text-xs font-semibold text-gray-700">
              Nome da disciplina
            </label>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Estrutura de Dados"
              disabled={isFormDisabled}
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-xs font-semibold text-gray-700">
              Carga (h)
            </label>
            <TextInput
              value={workload}
              onChange={(e) => {
                const next = e.target.value.replace(/[^\d]/g, "");
                setWorkload(next);
              }}
              inputMode="numeric"
              placeholder="Ex: 60"
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
                  disabled={!selectedSubjectId}
                  className={cn(
                    "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                    !selectedSubjectId
                      ? "bg-orange-50 text-orange-400 border border-orange-200 cursor-not-allowed"
                      : "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100",
                  )}
                >
                  <Pencil className="h-4 w-4 inline mr-2" />
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => onAskDelete()}
                  disabled={!selectedSubjectId || isDeleting}
                  className={cn(
                    "h-10 px-4 w-full sm:w-auto rounded-md font-semibold whitespace-nowrap",
                    !selectedSubjectId || isDeleting
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
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormMode("view");
                    if (selectedSubject) {
                      setName(selectedSubject.name ?? "");
                      setWorkload(String(selectedSubject.workload ?? ""));
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

          <div className="sm:col-span-4 text-[11px] text-gray-500">
            {formMode === "create" && (
              <>
                Dica: depois de criar, selecione a disciplina na lista para
                editar/excluir.
              </>
            )}
            {formMode === "view" && selectedSubject && (
              <>
                Selecionada: <b>{selectedSubject.name}</b> •{" "}
                <b>{selectedSubject.workload}h</b>
              </>
            )}
            {formMode === "edit" && (
              <>
                Obs: em modo <b>Editar</b>, altere apenas nome/carga horária.
              </>
            )}
          </div>
        </form>
    </ManagePanelShell>
  );
});
