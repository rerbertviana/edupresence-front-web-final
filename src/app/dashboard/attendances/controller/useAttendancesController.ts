"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ToastState } from "@/components/ui/toast";
import type {
  AttendanceDTO,
  AttendanceStatus,
  ClassSubjectDTO,
  LessonDTO,
  Shift,
} from "../domain/types";

import { attendancesKeys } from "../data/queries";
import { attendancesService } from "../data/service";
import {
  compareClassSubjectsBySemesterDesc,
  formatDateBR,
  formatTimeBR,
  isLessonExpired,
  normalizeText,
  parseBackendMessage,
  shiftLabel,
} from "../helpers/helpers";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);
    onChange();
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, [query]);

  return matches;
}

type FocusTarget = "classes" | "lessons" | "manage" | null;

export function useAttendancesController() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const isTeacher = user?.role === "TEACHER";

  const isLg = useMediaQuery("(min-width: 1024px)");

  const [toast, setToast] = useState<ToastState | null>(null);
  const toastIdRef = useRef(1);

  const introStartedRef = useRef(false);

  function showToast(type: ToastState["type"], message: string) {
    setToast({ id: toastIdRef.current++, type, message });
  }

  const [attendanceOpen, setAttendanceOpen] = useState(false);

  const [classSearch, setClassSearch] = useState("");
  const [lessonSearch, setLessonSearch] = useState("");
  const [attendanceSearch, setAttendanceSearch] = useState("");

  const [selectedClassSubjectId, setSelectedClassSubjectId] = useState<
    number | null
  >(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  const [checked, setChecked] = useState(false);

  const [liveMessage, setLiveMessage] = useState("");
  const [focusTarget, setFocusTarget] = useState<FocusTarget>(null);

  const announce = useCallback((message: string) => {
    setLiveMessage("");
    window.setTimeout(() => setLiveMessage(message), 80);
  }, []);

  const clearFocusTarget = useCallback(() => {
    setFocusTarget(null);
  }, []);

  const startPageFocus = useCallback(() => {
    if (introStartedRef.current) return;
    introStartedRef.current = true;

    window.setTimeout(() => {
      setFocusTarget("classes");
    }, 120);
  }, []);

  function openAttendance() {
    if (!selectedLessonId) {
      showToast("info", "Selecione uma aula para ver as presenças.");
      return;
    }

    if (!isLg) setAttendanceOpen(true);
  }

  const {
    data: classSubjects,
    isLoading: isLoadingClasses,
    isError: isErrorClasses,
  } = useQuery<ClassSubjectDTO[]>({
    queryKey: attendancesKeys.classSubjectsTeacher(),
    queryFn: attendancesService.getTeacherClassSubjects,
    enabled: isAuthenticated && isTeacher,
    refetchOnWindowFocus: true,
  });

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
    return classSubjects.find((x) => x.id === selectedClassSubjectId) ?? null;
  }, [selectedClassSubjectId, classSubjects]);

  const selectedShift: Shift = selectedClassSubject?.class?.shift ?? "MORNING";

  const lessonsEndpointEnabled =
    isAuthenticated && isTeacher && !!selectedClassSubjectId;

  const {
    data: lessons,
    isLoading: isLoadingLessons,
    isError: isErrorLessons,
  } = useQuery<LessonDTO[]>({
    queryKey: attendancesKeys.lessonsByClassSubject(
      selectedClassSubjectId,
      checked,
    ),
    queryFn: async () => {
      if (!selectedClassSubjectId) return [];
      return checked
        ? attendancesService.getLessonsByClassSubject(selectedClassSubjectId)
        : attendancesService.getUpcomingLessonsByClassSubject(
            selectedClassSubjectId,
          );
    },
    enabled: lessonsEndpointEnabled,
    refetchOnWindowFocus: true,
  });

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
        ]
          .filter(Boolean)
          .join(" "),
      );
      return hay.includes(q);
    });
  }, [lessons, lessonSearch]);

  const selectedLesson = useMemo(() => {
    if (!selectedLessonId || !lessons?.length) return null;
    return lessons.find((l) => l.id === selectedLessonId) ?? null;
  }, [selectedLessonId, lessons]);

  const attendancesEnabled = isAuthenticated && isTeacher && !!selectedLessonId;

  const {
    data: attendances,
    isLoading: isLoadingAttendances,
    isError: isErrorAttendances,
  } = useQuery<AttendanceDTO[]>({
    queryKey: attendancesKeys.attendancesByLesson(selectedLessonId),
    queryFn: async () => {
      if (!selectedLessonId) return [];
      return attendancesService.getAttendancesByLesson(selectedLessonId);
    },
    enabled: attendancesEnabled,
    refetchOnWindowFocus: true,
  });

  const filteredAttendances = useMemo(() => {
    const base = attendances ?? [];
    const q = normalizeText(attendanceSearch);

    if (!q) return base;

    return base.filter((a) => {
      const name = a.student?.user?.fullName ?? "";
      const reg = a.student?.registrationNumber ?? "";
      const course = a.student?.course?.name ?? "";
      const status = a.status ?? "";
      const hay = normalizeText([name, reg, course, status].join(" "));
      return hay.includes(q);
    });
  }, [attendances, attendanceSearch]);

  const stats = useMemo(() => {
    const base = attendances ?? [];
    const count = (s: string) => base.filter((a) => a.status === s).length;

    return {
      total: base.length,
      present: count("PRESENT"),
      absent: count("ABSENT"),
      justified: count("JUSTIFIED"),
    };
  }, [attendances]);

  useEffect(() => {
    setSelectedLessonId(null);
    setLessonSearch("");
    setAttendanceSearch("");
    setAttendanceOpen(false);
  }, [selectedClassSubjectId]);

  const statusMutation = useMutation({
    mutationFn: attendancesService.updateLessonStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendancesKeys.lessonsByClassSubject(
          selectedClassSubjectId,
          checked,
        ),
      });
    },
    onError: (err: any) => showToast("error", parseBackendMessage(err)),
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: attendancesService.updateAttendanceStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendancesKeys.attendancesByLesson(selectedLessonId),
      });
    },
    onError: (err: any) => showToast("error", parseBackendMessage(err)),
  });

  const bulkMutation = useMutation({
    mutationFn: async (status: AttendanceStatus) => {
      const ids = (filteredAttendances ?? []).map((a) => a.id);
      await attendancesService.bulkUpdateAttendancesStatus({ ids, status });
    },
    onSuccess: (_data, status) => {
      showToast(
        "success",
        status === "PRESENT" ? "Todos presentes." : "Todos em falta.",
      );
      queryClient.invalidateQueries({
        queryKey: attendancesKeys.attendancesByLesson(selectedLessonId),
      });
    },
    onError: (err: any) => showToast("error", parseBackendMessage(err)),
  });

  const isUpdatingAttendance =
    updateAttendanceMutation.isPending || bulkMutation.isPending;

  const canEditAttendances = !!selectedLesson;

  function markPresent(id: number, studentName?: string) {
    announce(
      studentName
        ? `Presença acionada para ${studentName}.`
        : "Presença acionada.",
    );
    updateAttendanceMutation.mutate({ id, status: "PRESENT" });
  }

  function markAbsent(id: number, studentName?: string) {
    announce(
      studentName ? `Falta acionada para ${studentName}.` : "Falta acionada.",
    );
    updateAttendanceMutation.mutate({ id, status: "ABSENT" });
  }

  function markJustified(id: number, studentName?: string) {
    announce(
      studentName
        ? `Justificada acionada para ${studentName}.`
        : "Justificada acionada.",
    );
    updateAttendanceMutation.mutate({ id, status: "JUSTIFIED" });
  }

  function bulkPresent() {
    announce("Todos os alunos foram marcados como presença.");
    bulkMutation.mutate("PRESENT");
  }

  function bulkAbsent() {
    announce("Todos os alunos foram marcados como falta.");
    bulkMutation.mutate("ABSENT");
  }

  function toggleLessonStatus(lesson: LessonDTO, nextChecked: boolean) {
    if (statusMutation.isPending) return;

    const expired = isLessonExpired(lesson);
    const nextStatus = nextChecked ? "OPEN" : "CLOSED";

    if (nextStatus === "OPEN" && expired) {
      showToast("info", "A aula já passou. Não é possível reabrir.");
      return;
    }

    statusMutation.mutate({ lesson, nextStatus });

    const dateLabel = formatDateBR(lesson.date);
    announce(
      `Status da aula de ${dateLabel} alterado para ${
        nextChecked ? "aberta" : "fechada"
      }.`,
    );
  }

  function handleSelectClassSubject(cs: ClassSubjectDTO) {
    setSelectedClassSubjectId(cs.id);

    window.setTimeout(() => {
      setFocusTarget("lessons");
    }, 180);
  }

  function handleSelectLesson(lesson: LessonDTO) {
    setSelectedLessonId(lesson.id);

    if (isLg) {
      window.setTimeout(() => {
        setFocusTarget("manage");
      }, 180);

      return;
    }
  }

  return {
    isLg,
    isTeacher,
    enabledBase: isAuthenticated && isTeacher,

    toast,
    setToast,
    showToast,

    attendanceOpen,
    setAttendanceOpen,
    openAttendance,

    classSearch,
    setClassSearch,
    lessonSearch,
    setLessonSearch,
    attendanceSearch,
    setAttendanceSearch,

    selectedClassSubjectId,
    setSelectedClassSubjectId,
    selectedLessonId,
    setSelectedLessonId,

    checked,
    setChecked,

    classSubjects,
    lessons,
    attendances,

    isLoadingClasses,
    isErrorClasses,
    isLoadingLessons,
    isErrorLessons,
    isLoadingAttendances,
    isErrorAttendances,

    filteredClassSubjects,
    selectedClassSubject,
    selectedShift,
    filteredLessons,
    selectedLesson,
    filteredAttendances,
    stats,

    canEditAttendances,
    isUpdatingAttendance,
    toggleLessonStatus,
    bulkPresent,
    bulkAbsent,
    markPresent,
    markAbsent,
    markJustified,

    liveMessage,
    focusTarget,
    clearFocusTarget,
    startPageFocus,
    handleSelectClassSubject,
    handleSelectLesson,
  };
}
