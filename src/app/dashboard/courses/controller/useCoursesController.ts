"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CourseDTO, FormMode } from "../domain/types";
import { coursesQueryKey, useCoursesQuery } from "../data/queries";
import { createCourse, deleteCourse, updateCourse } from "../data/service";
import { translateCourseMessage } from "../domain/messages";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useToast } from "@/hooks/useToast";
import { parseBackendMessage } from "@/lib/httpErrors";

import { normalizeText, sortByNamePtBR } from "../helpers/helpers";

export type CoursesController = ReturnType<typeof useCoursesController>;

export function useCoursesController() {
  const queryClient = useQueryClient();
  const isLg = useMediaQuery("(min-width: 1024px)");
  const { toast, showToast, closeToast, setToast } = useToast();

  const [manageOpen, setManageOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const [formMode, setFormMode] = useState<FormMode>("create");
  const [name, setName] = useState("");

  const [courseToDelete, setCourseToDelete] = useState<CourseDTO | null>(null);

  function openManageIfMobile() {
    if (!isLg) setManageOpen(true);
  }

  function handleNew() {
    setSelectedCourseId(null);
    setFormMode("create");
    setName("");
    setCourseToDelete(null);
    if (!isLg) setManageOpen(true);
  }

  const { data, isLoading, isError, error } = useCoursesQuery();

  const filteredCourses = useMemo(() => {
    const base = data ?? [];
    const q = normalizeText(search);

    const filtered = !q
      ? base
      : base.filter((c) => normalizeText(c.name).includes(q));

    return [...filtered].sort(sortByNamePtBR);
  }, [data, search]);

  const selectedCourse = useMemo(() => {
    if (!selectedCourseId || !(data?.length ?? 0)) return null;
    return data!.find((x) => x.id === selectedCourseId) ?? null;
  }, [selectedCourseId, data]);

  useEffect(() => {
    if (!selectedCourse) return;
    setName(selectedCourse.name ?? "");
    setFormMode("view");
  }, [selectedCourse]);

  const createMutation = useMutation({
    mutationFn: async () => {
      await createCourse(name);
    },
    onSuccess: () => {
      showToast("success", "Curso criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: coursesQueryKey });
      setName("");
      setFormMode("create");
      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateCourseMessage(raw) ?? parseBackendMessage(err),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCourseId) throw new Error("Selecione um curso.");
      await updateCourse(selectedCourseId, name);
    },
    onSuccess: () => {
      showToast("success", "Curso atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: coursesQueryKey });
      setFormMode("view");
      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateCourseMessage(raw) ?? parseBackendMessage(err),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!courseToDelete) return;
      await deleteCourse(courseToDelete.id);
    },
    onSuccess: () => {
      showToast("success", "Curso excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: coursesQueryKey });
      setCourseToDelete(null);

      setSelectedCourseId(null);
      setFormMode("create");
      setName("");
      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateCourseMessage(raw) ?? parseBackendMessage(err),
      );
      setCourseToDelete(null);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const mobileHasSelected = !!selectedCourseId;

  function openSmartSheet() {
    if (mobileHasSelected) {
      setFormMode("view");
    } else {
      setFormMode("create");
      setName("");
    }
    setManageOpen(true);
  }

  function confirmDelete() {
    deleteMutation.mutate();
  }

  function cancelDelete() {
    setCourseToDelete(null);
  }

  return {
    isLg,

    data,
    isLoading,
    isError,
    error,

    filteredCourses,
    selectedCourse,

    search,
    setSearch,

    selectedCourseId,
    setSelectedCourseId,

    formMode,
    setFormMode,

    name,
    setName,

    manageOpen,
    setManageOpen,

    toast,
    setToast,
    closeToast,
    showToast,

    courseToDelete,
    setCourseToDelete,

    isSaving,
    isDeleting,

    openManageIfMobile,
    handleNew,
    openSmartSheet,

    create: () => createMutation.mutate(),
    update: () => updateMutation.mutate(),

    confirmDelete,
    cancelDelete,
  };
}
