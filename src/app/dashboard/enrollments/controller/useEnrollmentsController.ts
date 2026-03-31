"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/useToast";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { parseBackendMessage } from "@/lib/httpErrors";

import type {
  ClassSubjectDTO,
  CourseDTO,
  EnrollmentDTO,
  FormMode,
  StudentDTO,
} from "../domain/types";

import { translateEnrollmentMessage } from "../domain/messages";
import { enrollmentsQueries } from "../data/queries";
import {
  createEnrollment,
  deleteEnrollment,
  updateEnrollment,
} from "../data/service";

import { getShiftLabel, shiftLabels } from "../helpers/helpers";

export type EnrollmentFormValues = {
  courseId: string;
  studentId: string;
  classSubjectId: string;
};

export function useEnrollmentsController() {
  const queryClient = useQueryClient();
  const { toast, showToast, closeToast, setToast } = useToast();
  const isLg = useMediaQuery("(min-width: 1024px)");

  const [manageOpen, setManageOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<
    number | null
  >(null);

  const [formMode, setFormMode] = useState<FormMode>("create");
  const [formValues, setFormValues] = useState<EnrollmentFormValues>({
    courseId: "",
    studentId: "",
    classSubjectId: "",
  });

  const [enrollmentToDelete, setEnrollmentToDelete] =
    useState<EnrollmentDTO | null>(null);

  function openManageIfMobile() {
    if (!isLg) setManageOpen(true);
  }

  const courseIdNumber = useMemo(() => {
    const n = Number(formValues.courseId);
    if (!formValues.courseId.trim() || Number.isNaN(n)) return null;
    return n;
  }, [formValues.courseId]);

  const coursesQuery = useQuery(enrollmentsQueries.courses());
  const studentsQuery = useQuery(enrollmentsQueries.students(courseIdNumber));
  const classSubjectsQuery = useQuery(
    enrollmentsQueries.classSubjects(courseIdNumber),
  );
  const enrollmentsQuery = useQuery(enrollmentsQueries.enrollments());

  const courses = useMemo<CourseDTO[]>(
    () => coursesQuery.data ?? [],
    [coursesQuery.data],
  );

  const students = useMemo<StudentDTO[]>(
    () => studentsQuery.data ?? [],
    [studentsQuery.data],
  );

  const classSubjects = useMemo<ClassSubjectDTO[]>(
    () => classSubjectsQuery.data ?? [],
    [classSubjectsQuery.data],
  );

  const enrollments = useMemo<EnrollmentDTO[]>(
    () => enrollmentsQuery.data ?? [],
    [enrollmentsQuery.data],
  );

  const selectedEnrollment = useMemo(() => {
    if (!selectedEnrollmentId) return null;
    return enrollments.find((e) => e.id === selectedEnrollmentId) ?? null;
  }, [selectedEnrollmentId, enrollments]);

  useEffect(() => {
    if (!selectedEnrollment) return;

    const courseId =
      selectedEnrollment.student?.courseId ??
      selectedEnrollment.classSubject?.class?.courseId ??
      selectedEnrollment.classSubject?.class?.course?.id ??
      "";

    setFormValues({
      courseId: courseId ? String(courseId) : "",
      studentId: String(selectedEnrollment.studentId),
      classSubjectId: String(selectedEnrollment.classSubjectId),
    });

    setFormMode("view");
  }, [selectedEnrollment]);

  const selectedStudent = useMemo(() => {
    const sid = Number(formValues.studentId);
    if (!formValues.studentId || Number.isNaN(sid)) return null;
    return students.find((s) => s.id === sid) ?? null;
  }, [formValues.studentId, students]);

  const selectedClassSubject = useMemo(() => {
    const csid = Number(formValues.classSubjectId);
    if (!formValues.classSubjectId || Number.isNaN(csid)) return null;
    return classSubjects.find((cs) => cs.id === csid) ?? null;
  }, [formValues.classSubjectId, classSubjects]);

  const filteredClassSubjects = useMemo(() => {
    if (!courseIdNumber) return [];
    return classSubjects.filter((cs) => {
      const classCourseId = cs.class?.courseId ?? cs.class?.course?.id;
      return classCourseId === courseIdNumber;
    });
  }, [classSubjects, courseIdNumber]);

  const normalizeText = useCallback((v: string) => {
    return v
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }, []);

  const getEnrollmentText = useCallback((e: EnrollmentDTO) => {
    const studentName = e.student?.user?.fullName ?? "";
    const registration = e.student?.registrationNumber ?? "";
    const semester = e.classSubject?.class?.semester ?? "";
    const shift =
      (e.classSubject?.class?.shift &&
        (shiftLabels[e.classSubject.class.shift] ??
          e.classSubject.class.shift)) ??
      "";
    const courseName = e.classSubject?.class?.course?.name ?? "";
    const subjectName = e.classSubject?.subject?.name ?? "";
    const teacherName = e.classSubject?.teacher?.user?.fullName ?? "";

    return `${studentName} ${registration} ${courseName} ${semester} ${shift} ${subjectName} ${teacherName}`;
  }, []);

  const filteredEnrollments = useMemo(() => {
    const q = normalizeText(search);

    const filtered = !q
      ? enrollments
      : enrollments.filter((e) =>
          normalizeText(getEnrollmentText(e)).includes(q),
        );

    return [...filtered].sort((a, b) => {
      const na = normalizeText(a.student?.user?.fullName ?? "");
      const nb = normalizeText(b.student?.user?.fullName ?? "");
      return na.localeCompare(nb, "pt-BR");
    });
  }, [enrollments, search, normalizeText, getEnrollmentText]);

  function handleNew() {
    setSelectedEnrollmentId(null);
    setFormMode("create");
    setFormValues({ courseId: "", studentId: "", classSubjectId: "" });
    setEnrollmentToDelete(null);
    if (!isLg) setManageOpen(true);
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const courseId = Number(formValues.courseId);
      const studentIdNumber = Number(formValues.studentId);
      const classSubjectIdNumber = Number(formValues.classSubjectId);

      if (!formValues.courseId.trim() || Number.isNaN(courseId)) {
        throw new Error("Selecione o curso.");
      }

      if (!formValues.studentId.trim() || Number.isNaN(studentIdNumber)) {
        throw new Error("Selecione o estudante para matricular.");
      }

      if (
        !formValues.classSubjectId.trim() ||
        Number.isNaN(classSubjectIdNumber)
      ) {
        throw new Error("Selecione a turma/matéria para matricular.");
      }

      await createEnrollment(studentIdNumber, classSubjectIdNumber);
    },
    onSuccess: () => {
      showToast("success", "Matrícula criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });

      setFormValues({ courseId: "", studentId: "", classSubjectId: "" });
      setFormMode("create");
      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateEnrollmentMessage(raw) ?? parseBackendMessage(err),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEnrollmentId) throw new Error("Selecione uma matrícula.");

      const courseId = Number(formValues.courseId);
      const studentIdNumber = Number(formValues.studentId);
      const classSubjectIdNumber = Number(formValues.classSubjectId);

      if (!formValues.courseId.trim() || Number.isNaN(courseId)) {
        throw new Error("Selecione o curso.");
      }

      if (!formValues.studentId.trim() || Number.isNaN(studentIdNumber)) {
        throw new Error("Selecione o estudante para matricular.");
      }

      if (
        !formValues.classSubjectId.trim() ||
        Number.isNaN(classSubjectIdNumber)
      ) {
        throw new Error("Selecione a turma/matéria para matricular.");
      }

      await updateEnrollment(
        selectedEnrollmentId,
        studentIdNumber,
        classSubjectIdNumber,
      );
    },
    onSuccess: () => {
      showToast("success", "Matrícula atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });

      setFormMode("view");
      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateEnrollmentMessage(raw) ?? parseBackendMessage(err),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!enrollmentToDelete) return;
      await deleteEnrollment(enrollmentToDelete.id);
    },
    onSuccess: () => {
      showToast("success", "Matrícula excluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });

      setEnrollmentToDelete(null);
      setSelectedEnrollmentId(null);
      setFormMode("create");
      setFormValues({ courseId: "", studentId: "", classSubjectId: "" });
      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateEnrollmentMessage(raw) ?? parseBackendMessage(err),
      );
      setEnrollmentToDelete(null);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const mobileHasSelected = !!selectedEnrollmentId;

  function openSmartSheet() {
    if (mobileHasSelected) {
      setFormMode("view");
    } else {
      setFormMode("create");
      setFormValues({ courseId: "", studentId: "", classSubjectId: "" });
    }
    setManageOpen(true);
  }

  return {
    coursesQuery,
    studentsQuery,
    classSubjectsQuery,
    enrollmentsQuery,

    isLg,
    courses,
    students,
    classSubjects,
    enrollments,

    filteredEnrollments,
    selectedEnrollment,
    selectedStudent,
    selectedClassSubject,
    filteredClassSubjects,

    toast,
    closeToast,
    setToast,
    showToast,

    manageOpen,
    setManageOpen,
    search,
    setSearch,

    selectedEnrollmentId,
    setSelectedEnrollmentId,
    formMode,
    setFormMode,
    formValues,
    setFormValues,

    enrollmentToDelete,
    setEnrollmentToDelete,

    openManageIfMobile,
    openSmartSheet,
    handleNew,

    create: () => createMutation.mutate(),
    update: () => updateMutation.mutate(),
    confirmDelete: () => deleteMutation.mutate(),

    isSaving,
    isDeleting,
    mobileHasSelected,

    getShiftLabel,
  };
}
