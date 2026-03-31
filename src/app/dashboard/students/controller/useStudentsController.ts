"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/useToast";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import { parseBackendMessage } from "@/lib/httpErrors";

import type { FormMode, StudentDTO } from "../domain/types";
import { translateStudentMessage } from "../domain/messages";
import { normalizeText } from "../helpers/helpers";

import { studentsQueries } from "../data/queries";
import {
  createStudentFlow,
  deleteStudent,
  updateStudentFlow,
} from "../data/service";

export type StudentFormValues = {
  fullName: string;
  email: string;
  password: string;
  registrationNumber: string;
  courseId: string;
  currentSemester: string;
};

export function useStudentsController() {
  const queryClient = useQueryClient();
  const { toast, showToast, closeToast } = useToast();
  const isLg = useMediaQuery("(min-width: 1024px)");

  const [manageOpen, setManageOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [formMode, setFormMode] = useState<FormMode>("create");
  const [formValues, setFormValues] = useState<StudentFormValues>({
    fullName: "",
    email: "",
    password: "",
    registrationNumber: "",
    courseId: "",
    currentSemester: "",
  });

  const [studentToDelete, setStudentToDelete] = useState<StudentDTO | null>(
    null,
  );

  function openManageIfMobile() {
    if (!isLg) setManageOpen(true);
  }

  const coursesQuery = useQuery(studentsQueries.courses());
  const studentsQuery = useQuery(studentsQueries.students());

  const courses = useMemo(() => coursesQuery.data ?? [], [coursesQuery.data]);
  const students = useMemo(
    () => studentsQuery.data ?? [],
    [studentsQuery.data],
  );

  const filteredStudents = useMemo(() => {
    const base = students ?? [];
    const q = normalizeText(search);

    const filtered = !q
      ? base
      : base.filter((s) => {
          const courseName =
            s.course?.name ??
            courses.find((c) => c.id === s.courseId)?.name ??
            "";

          const hay = normalizeText(
            `${s.user?.fullName ?? ""} ${s.user?.email ?? ""} ${
              s.registrationNumber ?? ""
            } ${courseName} ${String(s.currentSemester ?? "")}`,
          );

          return hay.includes(q);
        });

    return [...filtered].sort((a, b) => {
      const na = normalizeText(a.user?.fullName ?? "");
      const nb = normalizeText(b.user?.fullName ?? "");
      return na.localeCompare(nb, "pt-BR");
    });
  }, [students, courses, search]);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find((x) => x.id === selectedStudentId) ?? null;
  }, [selectedStudentId, students]);

  useEffect(() => {
    if (!selectedStudent) return;

    setFormValues({
      fullName: selectedStudent.user?.fullName ?? "",
      email: selectedStudent.user?.email ?? "",
      password: "",
      registrationNumber: selectedStudent.registrationNumber ?? "",
      courseId: String(selectedStudent.courseId ?? ""),
      currentSemester: String(selectedStudent.currentSemester ?? ""),
    });

    setSelectedUserId(selectedStudent.user?.id ?? null);
    setFormMode("view");
  }, [selectedStudent]);

  function handleNew() {
    setSelectedStudentId(null);
    setSelectedUserId(null);
    setFormMode("create");
    setFormValues({
      fullName: "",
      email: "",
      password: "",
      registrationNumber: "",
      courseId: "",
      currentSemester: "",
    });
    setStudentToDelete(null);
    if (!isLg) setManageOpen(true);
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const fullName = formValues.fullName.trim();
      const email = formValues.email.trim();
      const password = formValues.password.trim();
      const registrationNumber = formValues.registrationNumber.trim();
      const courseIdNumber = Number(formValues.courseId);
      const semesterNumber = Number(formValues.currentSemester);

      if (
        !fullName ||
        !email ||
        !password ||
        !registrationNumber ||
        !formValues.courseId ||
        Number.isNaN(courseIdNumber) ||
        !formValues.currentSemester ||
        Number.isNaN(semesterNumber)
      ) {
        throw new Error("Preencha todos os campos obrigatórios corretamente.");
      }

      await createStudentFlow({
        fullName,
        email,
        password,
        registrationNumber,
        courseId: courseIdNumber,
        currentSemester: semesterNumber,
      });
    },
    onSuccess: () => {
      showToast("success", "Estudante criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["students"] });

      setFormMode("create");
      setFormValues({
        fullName: "",
        email: "",
        password: "",
        registrationNumber: "",
        courseId: "",
        currentSemester: "",
      });

      setSelectedStudentId(null);
      setSelectedUserId(null);
      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateStudentMessage(raw) ?? parseBackendMessage(err),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStudentId) throw new Error("Selecione um estudante.");
      if (!selectedUserId || Number.isNaN(selectedUserId))
        throw new Error("ID de usuário inválido para atualização.");

      const fullName = formValues.fullName.trim();
      const email = formValues.email.trim();
      const password = formValues.password.trim();
      const registrationNumber = formValues.registrationNumber.trim();
      const courseIdNumber = Number(formValues.courseId);
      const semesterNumber = Number(formValues.currentSemester);

      if (
        !fullName ||
        !email ||
        !registrationNumber ||
        !formValues.courseId ||
        Number.isNaN(courseIdNumber) ||
        !formValues.currentSemester ||
        Number.isNaN(semesterNumber)
      ) {
        throw new Error("Preencha todos os campos obrigatórios corretamente.");
      }

      await updateStudentFlow({
        studentId: selectedStudentId,
        userId: selectedUserId,
        fullName,
        email,
        password: password.length ? password : undefined,
        registrationNumber,
        courseId: courseIdNumber,
        currentSemester: semesterNumber,
      });
    },
    onSuccess: () => {
      showToast("success", "Estudante atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["students"] });

      setFormMode("view");
      setManageOpen(false);
      setFormValues((p) => ({ ...p, password: "" }));
    },
    onError: (err: any) => {
      const raw =
        (err?.response?.data?.message as string | undefined) ??
        (err?.message as string | undefined);

      showToast(
        "error",
        translateStudentMessage(raw) ?? parseBackendMessage(err),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!studentToDelete) return;
      await deleteStudent(studentToDelete.id);
    },
    onSuccess: () => {
      showToast("success", "Estudante excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["students"] });

      setStudentToDelete(null);
      setSelectedStudentId(null);
      setSelectedUserId(null);

      setFormMode("create");
      setFormValues({
        fullName: "",
        email: "",
        password: "",
        registrationNumber: "",
        courseId: "",
        currentSemester: "",
      });

      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateStudentMessage(raw) ?? parseBackendMessage(err),
      );
      setStudentToDelete(null);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const mobileHasSelected = !!selectedStudentId;

  function openSmartSheet() {
    if (mobileHasSelected) {
      setFormMode("view");
    } else {
      setFormMode("create");
      setFormValues({
        fullName: "",
        email: "",
        password: "",
        registrationNumber: "",
        courseId: "",
        currentSemester: "",
      });
      setSelectedUserId(null);
    }
    setManageOpen(true);
  }

  return {
    coursesQuery,
    studentsQuery,

    courses,
    students,
    filteredStudents,
    selectedStudent,

    isLg,
    manageOpen,
    setManageOpen,
    search,
    setSearch,

    selectedStudentId,
    setSelectedStudentId,
    formMode,
    setFormMode,
    formValues,
    setFormValues,

    studentToDelete,
    setStudentToDelete,

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
