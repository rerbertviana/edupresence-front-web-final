"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/useToast";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import { parseBackendMessage } from "@/lib/httpErrors";

import type { FormMode, SubjectDTO } from "../domain/types";
import { translateSubjectMessage } from "../domain/messages";
import { normalizeText } from "../helpers/helpers";

import { subjectsQueries } from "../data/queries";
import { createSubject, deleteSubject, updateSubject } from "../data/service";

export type SubjectFormValues = {
  name: string;
  workload: string;
};

export function useSubjectsController() {
  const queryClient = useQueryClient();
  const { toast, showToast, closeToast } = useToast();
  const isLg = useMediaQuery("(min-width: 1024px)");

  const [manageOpen, setManageOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null,
  );

  const [formMode, setFormMode] = useState<FormMode>("create");
  const [formValues, setFormValues] = useState<SubjectFormValues>({
    name: "",
    workload: "",
  });

  const [subjectToDelete, setSubjectToDelete] = useState<SubjectDTO | null>(
    null,
  );

  function openManageIfMobile() {
    if (!isLg) setManageOpen(true);
  }

  const subjectsQuery = useQuery(subjectsQueries.subjects());

  const subjects = useMemo(
    () => subjectsQuery.data ?? [],
    [subjectsQuery.data],
  );

  const filteredSubjects = useMemo(() => {
    const base = subjects ?? [];
    const q = normalizeText(search);

    const filtered = !q
      ? base
      : base.filter((s) => {
          const hay = normalizeText(`${s.name} ${s.workload}h`);
          return hay.includes(q);
        });

    return [...filtered].sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? "", "pt-BR", {
        sensitivity: "base",
        numeric: true,
      }),
    );
  }, [subjects, search]);

  const selectedSubject = useMemo(() => {
    if (!selectedSubjectId) return null;
    return subjects.find((x) => x.id === selectedSubjectId) ?? null;
  }, [selectedSubjectId, subjects]);

  useEffect(() => {
    if (!selectedSubject) return;
    setFormValues({
      name: selectedSubject.name ?? "",
      workload: String(selectedSubject.workload ?? ""),
    });
    setFormMode("view");
  }, [selectedSubject]);

  function handleNew() {
    setSelectedSubjectId(null);
    setFormMode("create");
    setFormValues({ name: "", workload: "" });
    setSubjectToDelete(null);
    if (!isLg) setManageOpen(true);
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const name = formValues.name.trim();
      const workloadNumber = Number(formValues.workload);

      if (!name || Number.isNaN(workloadNumber) || workloadNumber <= 0) {
        throw new Error("Preencha todos os campos obrigatórios corretamente.");
      }

      await createSubject({ name, workload: workloadNumber });
    },
    onSuccess: () => {
      showToast("success", "Disciplina criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setFormValues({ name: "", workload: "" });
      setFormMode("create");
      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateSubjectMessage(raw) ?? parseBackendMessage(err),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSubjectId) throw new Error("Selecione uma disciplina.");

      const name = formValues.name.trim();
      const workloadNumber = Number(formValues.workload);

      if (!name || Number.isNaN(workloadNumber) || workloadNumber <= 0) {
        throw new Error("Preencha todos os campos obrigatórios corretamente.");
      }

      await updateSubject({
        id: selectedSubjectId,
        name,
        workload: workloadNumber,
      });
    },
    onSuccess: () => {
      showToast("success", "Disciplina atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setFormMode("view");
      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateSubjectMessage(raw) ?? parseBackendMessage(err),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!subjectToDelete) return;
      await deleteSubject(subjectToDelete.id);
    },
    onSuccess: () => {
      showToast("success", "Disciplina excluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setSubjectToDelete(null);

      setSelectedSubjectId(null);
      setFormMode("create");
      setFormValues({ name: "", workload: "" });
      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateSubjectMessage(raw) ?? parseBackendMessage(err),
      );
      setSubjectToDelete(null);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const mobileHasSelected = !!selectedSubjectId;

  function openSmartSheet() {
    if (mobileHasSelected) {
      setFormMode("view");
    } else {
      setFormMode("create");
      setFormValues({ name: "", workload: "" });
    }
    setManageOpen(true);
  }

  return {
    subjectsQuery,

    subjects,
    filteredSubjects,
    selectedSubject,

    isLg,
    manageOpen,
    setManageOpen,
    search,
    setSearch,

    selectedSubjectId,
    setSelectedSubjectId,
    formMode,
    setFormMode,
    formValues,
    setFormValues,

    subjectToDelete,
    setSubjectToDelete,

    handleNew,
    openManageIfMobile,
    openSmartSheet,
    create: () => createMutation.mutate(),
    update: () => updateMutation.mutate(),
    confirmDelete: () => deleteMutation.mutate(),

    isSaving,
    isDeleting,
    mobileHasSelected,

    toast,
    closeToast,
  };
}
