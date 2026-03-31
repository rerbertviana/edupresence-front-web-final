"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ClassDTO, FormMode, FormValues } from "../domain/types";
import { translateClassMessage } from "../domain/messages";
import {
  buildYears,
  compareClassesBySemesterDesc,
  shiftLabel,
} from "../helpers/helpers";
import {
  classesQueryKey,
  useClassesQuery,
  useCoursesQuery,
} from "../data/queries";
import { createClass, deleteClass, updateClass } from "../data/service";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useToast } from "@/hooks/useToast";
import { normalizeText } from "@/lib/text";
import { parseBackendMessage } from "@/lib/httpErrors";

export type ClassesController = ReturnType<typeof useClassesController>;

const EMPTY_FORM: FormValues = {
  courseId: "",
  year: "",
  period: "",
  semester: "",
  shift: "",
};

function toValidPayload(formValues: FormValues) {
  const courseIdNumber = Number(formValues.courseId);
  const semester = formValues.semester.trim();
  const shift = formValues.shift.trim();

  if (!semester) throw new Error("Selecione ano e período do semestre.");
  if (!courseIdNumber || Number.isNaN(courseIdNumber) || !shift) {
    throw new Error("Preencha todos os campos obrigatórios corretamente.");
  }

  return { courseId: courseIdNumber, semester, shift };
}

export function useClassesController() {
  const queryClient = useQueryClient();
  const isLg = useMediaQuery("(min-width: 1024px)");
  const { toast, showToast, closeToast } = useToast();

  const [manageOpen, setManageOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const [formMode, setFormMode] = useState<FormMode>("create");
  const [formValues, setFormValues] = useState<FormValues>(EMPTY_FORM);

  const [classToDelete, setClassToDelete] = useState<ClassDTO | null>(null);

  function openManageIfMobile() {
    if (!isLg) setManageOpen(true);
  }

  const {
    data: courses,
    isLoading: isLoadingCourses,
    isError: isCoursesError,
    error: coursesError,
  } = useCoursesQuery();

  const {
    data: classes,
    isLoading: isLoadingClasses,
    isError: isClassesError,
    error: classesError,
  } = useClassesQuery();

  const years = useMemo(() => buildYears(10), []);

  const filteredClasses = useMemo(() => {
    const base = classes ?? [];
    const q = normalizeText(search);

    const filtered = !q
      ? base
      : base.filter((c) => {
          const courseName =
            courses?.find((cc) => cc.id === c.courseId)?.name ?? "";
          const hay = normalizeText(
            [courseName, c.semester, shiftLabel(c.shift)]
              .filter(Boolean)
              .join(" "),
          );
          return hay.includes(q);
        });

    return [...filtered].sort(compareClassesBySemesterDesc);
  }, [classes, courses, search]);

  const selectedClass = useMemo(() => {
    if (!selectedClassId || !(classes?.length ?? 0)) return null;
    return classes!.find((x) => x.id === selectedClassId) ?? null;
  }, [selectedClassId, classes]);

  useEffect(() => {
    if (!selectedClass) return;
    const [year, period] = (selectedClass.semester ?? "").split(".");

    setFormValues({
      courseId: String(selectedClass.courseId),
      year: year ?? "",
      period: period ?? "",
      semester: selectedClass.semester ?? "",
      shift: String(selectedClass.shift ?? ""),
    });

    setFormMode("view");
  }, [selectedClass]);

  function handleNew() {
    setSelectedClassId(null);
    setFormMode("create");
    setFormValues(EMPTY_FORM);
    setClassToDelete(null);
    if (!isLg) setManageOpen(true);
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = toValidPayload(formValues);
      await createClass(payload);
    },
    onSuccess: () => {
      showToast("success", "Semestre criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: classesQueryKey });

      setFormMode("create");
      setFormValues(EMPTY_FORM);
      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateClassMessage(raw) ?? parseBackendMessage(err),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClassId) throw new Error("Selecione um semestre.");
      const payload = toValidPayload(formValues);
      await updateClass(selectedClassId, payload);
    },
    onSuccess: () => {
      showToast("success", "Semestre atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: classesQueryKey });

      setFormMode("view");
      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateClassMessage(raw) ?? parseBackendMessage(err),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!classToDelete) return;
      await deleteClass(classToDelete.id);
    },
    onSuccess: () => {
      showToast("success", "Semestre excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: classesQueryKey });

      setClassToDelete(null);
      setSelectedClassId(null);
      setFormMode("create");
      setFormValues(EMPTY_FORM);
      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateClassMessage(raw) ?? parseBackendMessage(err),
      );
      setClassToDelete(null);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const mobileHasSelected = !!selectedClassId;

  function openSmartSheet() {
    if (mobileHasSelected) {
      setFormMode("view");
    } else {
      setFormMode("create");
      setFormValues(EMPTY_FORM);
    }
    setManageOpen(true);
  }

  const totalCount = classes?.length ?? 0;

  return {
    isLg,

    courses,
    classes,
    isLoadingCourses,
    isLoadingClasses,
    isCoursesError,
    isClassesError,
    coursesError,
    classesError,

    years,
    filteredClasses,
    selectedClass,

    totalCount,

    manageOpen,
    setManageOpen,

    search,
    setSearch,

    selectedClassId,
    setSelectedClassId,

    formMode,
    setFormMode,

    formValues,
    setFormValues,

    toast,
    closeToast,

    classToDelete,
    setClassToDelete,

    isSaving,
    isDeleting,

    openManageIfMobile,
    handleNew,
    openSmartSheet,

    create: () => createMutation.mutate(),
    update: () => updateMutation.mutate(),
    confirmDelete: () => deleteMutation.mutate(),
  };
}
