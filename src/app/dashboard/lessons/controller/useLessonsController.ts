"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useToast } from "@/hooks/useToast";
import { parseBackendMessage } from "@/lib/httpErrors";

import type { FormMode, LessonDTO, LessonStatus } from "../domain/types";
import { translateLessonMessage } from "../domain/messages";
import {
  compareClassSubjectsBySemesterDesc,
  formatDateBR,
  formatTimeBR,
  maskHHMM,
  normalizeText,
  parseISODateToLocalDate,
  timeInputValueFromISO,
} from "../helpers/helpers";
import {
  lessonsByClassSubjectQueryKey,
  useLessonsByClassSubjectQuery,
  useTeacherClassSubjectsQuery,
} from "../data/queries";
import {
  createLesson,
  deleteLesson,
  updateLesson,
  updateLessonStatus,
} from "../data/service";

export type LessonsController = ReturnType<typeof useLessonsController>;

export function useLessonsController() {
  const queryClient = useQueryClient();
  const isLg = useMediaQuery("(min-width: 1024px)");

  const { user, isAuthenticated } = useAuth();
  const isTeacher = user?.role === "TEACHER";
  const enabledBase = isAuthenticated && isTeacher;

  const { toast, showToast, closeToast, setToast } = useToast();

  const [manageOpen, setManageOpen] = useState(false);

  const [classSearch, setClassSearch] = useState("");
  const [lessonSearch, setLessonSearch] = useState("");

  const [selectedClassSubjectId, setSelectedClassSubjectId] = useState<
    number | null
  >(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  const [checked, setChecked] = useState(false);

  const [formMode, setFormMode] = useState<FormMode>("create");
  const [date, setDate] = useState("");
  const [startTime, setStartTimeState] = useState("");
  const [endTime, setEndTimeState] = useState("");

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const [lessonToDelete, setLessonToDelete] = useState<LessonDTO | null>(null);

  const {
    data: classSubjects,
    isLoading: isLoadingClasses,
    isError: isErrorClasses,
    error: errorClasses,
  } = useTeacherClassSubjectsQuery(enabledBase);

  const {
    data: lessons,
    isLoading: isLoadingLessons,
    isError: isErrorLessons,
    error: errorLessons,
  } = useLessonsByClassSubjectQuery({
    classSubjectId: selectedClassSubjectId,
    all: checked,
    enabled: enabledBase,
  });

  const currentLessonsQueryKey = useMemo(
    () => lessonsByClassSubjectQueryKey(selectedClassSubjectId, checked),
    [selectedClassSubjectId, checked],
  );

  const filteredClassSubjects = useMemo(() => {
    const base = classSubjects ?? [];
    const q = normalizeText(classSearch);

    const filtered = !q
      ? base
      : base.filter((cs) => {
          const hay = normalizeText(
            [
              cs.class?.semester,
              cs.subject?.name,
              cs.class?.course?.name,
              cs.class?.shift,
              cs.teacher?.user?.fullName,
            ]
              .filter(Boolean)
              .join(" "),
          );

          return hay.includes(q);
        });

    return [...filtered].sort(compareClassSubjectsBySemesterDesc);
  }, [classSubjects, classSearch]);

  const selectedClassSubject = useMemo(() => {
    if (!selectedClassSubjectId || !classSubjects?.length) return null;
    return (
      classSubjects.find((item) => item.id === selectedClassSubjectId) ?? null
    );
  }, [selectedClassSubjectId, classSubjects]);

  const filteredLessons = useMemo(() => {
    const base = lessons ?? [];
    const q = normalizeText(lessonSearch);

    if (!q) return base;

    return base.filter((lesson) => {
      const hay = normalizeText(
        [
          formatDateBR(lesson.date),
          formatTimeBR(lesson.startTime),
          formatTimeBR(lesson.endTime),
          lesson.status,
          lesson.classSubject?.subject?.name,
          lesson.classSubject?.class?.course?.name,
          lesson.classSubject?.class?.semester,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return hay.includes(q);
    });
  }, [lessons, lessonSearch]);

  const selectedLesson = useMemo(() => {
    if (!selectedLessonId || !lessons?.length) return null;
    return lessons.find((lesson) => lesson.id === selectedLessonId) ?? null;
  }, [selectedLessonId, lessons]);

  useEffect(() => {
    if (!selectedLesson) return;

    setFormMode("view");
    setDate(selectedLesson.date?.slice(0, 10) ?? "");
    setStartTimeState(timeInputValueFromISO(selectedLesson.startTime));
    setEndTimeState(timeInputValueFromISO(selectedLesson.endTime));
    setSelectedDate(parseISODateToLocalDate(selectedLesson.date));
  }, [selectedLesson]);

  useEffect(() => {
    setSelectedLessonId(null);
    setLessonSearch("");
    setFormMode("create");
    setDate("");
    setStartTimeState("");
    setEndTimeState("");
    setSelectedDate(undefined);
    setLessonToDelete(null);
    setManageOpen(false);
  }, [selectedClassSubjectId]);

  function handleMutationError(err: any) {
    const raw = err?.response?.data?.message as string | undefined;
    const fallback =
      err instanceof Error ? err.message : parseBackendMessage(err);

    showToast("error", translateLessonMessage(raw) ?? fallback);
  }

  const statusMutation = useMutation({
    mutationFn: updateLessonStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currentLessonsQueryKey });
    },
    onError: handleMutationError,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClassSubjectId) {
        throw new Error("Selecione uma turma.");
      }

      if (!date.trim()) {
        throw new Error("Selecione a data.");
      }

      if (startTime.trim().length !== 5) {
        throw new Error("Preencha o horário de início.");
      }

      if (endTime.trim().length !== 5) {
        throw new Error("Preencha o horário de término.");
      }

      await createLesson({
        classSubjectId: selectedClassSubjectId,
        date: date.trim(),
        startTimeISO: startTime.trim(),
        endTimeISO: endTime.trim(),
      });
    },
    onSuccess: () => {
      showToast("success", "Aula criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: currentLessonsQueryKey });

      setFormMode("create");
      setSelectedLessonId(null);
      setDate("");
      setStartTimeState("");
      setEndTimeState("");
      setSelectedDate(undefined);
      setManageOpen(false);
    },
    onError: handleMutationError,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedLessonId) {
        throw new Error("Selecione uma aula.");
      }

      if (!selectedClassSubjectId) {
        throw new Error("Selecione uma turma.");
      }

      if (!date.trim()) {
        throw new Error("Selecione a data.");
      }

      if (startTime.trim().length !== 5) {
        throw new Error("Preencha o horário de início.");
      }

      if (endTime.trim().length !== 5) {
        throw new Error("Preencha o horário de término.");
      }

      const currentStatus: LessonStatus = selectedLesson?.status ?? "OPEN";

      await updateLesson({
        lessonId: selectedLessonId,
        classSubjectId: selectedClassSubjectId,
        date: date.trim(),
        startTimeISO: startTime.trim(),
        endTimeISO: endTime.trim(),
        status: currentStatus,
      });
    },
    onSuccess: () => {
      showToast("success", "Aula atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: currentLessonsQueryKey });
      setFormMode("view");
      setManageOpen(false);
    },
    onError: handleMutationError,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!lessonToDelete) {
        throw new Error("Selecione uma aula.");
      }

      await deleteLesson(lessonToDelete.id);
    },
    onSuccess: () => {
      showToast("success", "Aula excluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: currentLessonsQueryKey });

      setLessonToDelete(null);
      setSelectedLessonId(null);
      setFormMode("create");
      setDate("");
      setStartTimeState("");
      setEndTimeState("");
      setSelectedDate(undefined);
      setManageOpen(false);
    },
    onError: (err) => {
      handleMutationError(err);
      setLessonToDelete(null);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const isTogglingStatus = statusMutation.isPending;

  const mobileHasSelected = !!selectedLessonId;

  function openManageIfMobile() {
    if (!isLg) {
      setManageOpen(true);
    }
  }

  function handleNew() {
    setSelectedLessonId(null);
    setFormMode("create");
    setDate("");
    setStartTimeState("");
    setEndTimeState("");
    setSelectedDate(undefined);
    setLessonToDelete(null);

    if (!isLg) {
      setManageOpen(true);
    }
  }

  function openSmartSheet() {
    if (!selectedClassSubjectId) {
      showToast("info", "Selecione uma turma primeiro.");
      return;
    }

    if (mobileHasSelected) {
      setFormMode("view");
    } else {
      setFormMode("create");
      setDate("");
      setStartTimeState("");
      setEndTimeState("");
      setSelectedDate(undefined);
    }

    setManageOpen(true);
  }

  function toggleLessonStatus(lesson: LessonDTO, nextChecked: boolean) {
    if (isTogglingStatus) return;

    statusMutation.mutate({
      lesson,
      nextStatus: nextChecked ? "OPEN" : "CLOSED",
    });
  }

  function askDeleteFromSelected() {
    if (!selectedLesson) return;
    setLessonToDelete(selectedLesson);
  }

  function confirmDelete() {
    deleteMutation.mutate();
  }

  function cancelDelete() {
    setLessonToDelete(null);
  }

  function setStartTime(value: string) {
    setStartTimeState(maskHHMM(value));
  }

  function setEndTime(value: string) {
    setEndTimeState(maskHHMM(value));
  }

  return {
    isLg,
    isTeacher,
    enabledBase,

    toast,
    showToast,
    closeToast,
    setToast,

    manageOpen,
    setManageOpen,

    classSearch,
    setClassSearch,
    lessonSearch,
    setLessonSearch,

    selectedClassSubjectId,
    setSelectedClassSubjectId,
    selectedLessonId,
    setSelectedLessonId,

    selectedClassSubject,
    filteredClassSubjects,

    lessons,
    filteredLessons,
    selectedLesson,

    checked,
    setChecked,

    formMode,
    setFormMode,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,

    selectedDate,
    setSelectedDate,
    datePopoverOpen,
    setDatePopoverOpen,

    isLoadingClasses,
    isErrorClasses,
    errorClasses,

    isLoadingLessons,
    isErrorLessons,
    errorLessons,

    isSaving,
    isDeleting,
    isTogglingStatus,

    lessonToDelete,
    setLessonToDelete,

    openManageIfMobile,
    handleNew,
    openSmartSheet,

    create: () => createMutation.mutate(),
    update: () => updateMutation.mutate(),

    toggleLessonStatus,

    askDeleteFromSelected,
    confirmDelete,
    cancelDelete,
  };
}
