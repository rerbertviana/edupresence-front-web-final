"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/useToast";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import { normalizeText } from "@/lib/text";
import { parseBackendMessage } from "@/lib/httpErrors";

import type { FormMode, TeacherDTO, TeacherFormValues } from "../domain/types";
import { translateTeacherMessage } from "../domain/messages";

import { teachersKeys, teachersQueries } from "../data/queries";
import {
  createTeacherFlow,
  deleteTeacher,
  updateTeacherFlow,
} from "../data/service";

export function useTeachersController() {
  const queryClient = useQueryClient();
  const { toast, showToast, closeToast, setToast } = useToast();
  const isLg = useMediaQuery("(min-width: 1024px)");

  const [manageOpen, setManageOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(
    null,
  );
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [formMode, setFormMode] = useState<FormMode>("create");
  const [formValues, setFormValues] = useState<TeacherFormValues>({
    fullName: "",
    email: "",
    password: "",
    siapeCode: "",
    teachingArea: "",
  });

  const [teacherToDelete, setTeacherToDelete] = useState<TeacherDTO | null>(
    null,
  );

  function openManageIfMobile() {
    if (!isLg) setManageOpen(true);
  }

  const teachersQuery = useQuery(teachersQueries.teachers());
  const { data: teachers } = teachersQuery;

  const filteredTeachers = useMemo(() => {
    const base = teachers ?? [];
    const q = normalizeText(search);

    const filtered = !q
      ? base
      : base.filter((t) => {
          const hay = normalizeText(
            `${t.user?.fullName ?? ""} ${t.user?.email ?? ""} ${
              t.siapeCode ?? ""
            } ${t.teachingArea ?? ""}`,
          );
          return hay.includes(q);
        });

    return [...filtered].sort((a, b) => {
      const na = normalizeText(a.user?.fullName ?? "");
      const nb = normalizeText(b.user?.fullName ?? "");
      return na.localeCompare(nb, "pt-BR");
    });
  }, [teachers, search]);

  const selectedTeacher = useMemo(() => {
    if (!selectedTeacherId || !(teachers?.length ?? 0)) return null;
    return teachers!.find((x) => x.id === selectedTeacherId) ?? null;
  }, [selectedTeacherId, teachers]);

  useEffect(() => {
    if (!selectedTeacher) return;

    setFormValues({
      fullName: selectedTeacher.user?.fullName ?? "",
      email: selectedTeacher.user?.email ?? "",
      password: "",
      siapeCode: selectedTeacher.siapeCode ?? "",
      teachingArea: selectedTeacher.teachingArea ?? "",
    });

    setSelectedUserId(selectedTeacher.user?.id ?? null);
    setFormMode("view");
  }, [selectedTeacher]);

  function handleNew() {
    setSelectedTeacherId(null);
    setSelectedUserId(null);
    setFormMode("create");
    setFormValues({
      fullName: "",
      email: "",
      password: "",
      siapeCode: "",
      teachingArea: "",
    });
    setTeacherToDelete(null);
    if (!isLg) setManageOpen(true);
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const fullName = formValues.fullName.trim();
      const email = formValues.email.trim();
      const password = formValues.password.trim();
      const siapeCode = formValues.siapeCode.trim();
      const teachingArea = formValues.teachingArea.trim();

      if (!fullName || !email || !password || !siapeCode || !teachingArea) {
        throw new Error("Preencha todos os campos obrigatórios corretamente.");
      }

      await createTeacherFlow({
        fullName,
        email,
        password,
        siapeCode,
        teachingArea,
      });
    },
    onSuccess: () => {
      showToast("success", "Professor(a) criado(a) com sucesso!");
      queryClient.invalidateQueries({ queryKey: teachersKeys.teachers });

      setFormMode("create");
      setFormValues({
        fullName: "",
        email: "",
        password: "",
        siapeCode: "",
        teachingArea: "",
      });

      setSelectedTeacherId(null);
      setSelectedUserId(null);
      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateTeacherMessage(raw) ?? parseBackendMessage(err),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTeacherId) throw new Error("Selecione um professor.");
      if (!selectedUserId || Number.isNaN(selectedUserId))
        throw new Error("ID de usuário inválido para atualização.");

      const fullName = formValues.fullName.trim();
      const email = formValues.email.trim();
      const password = formValues.password.trim();
      const siapeCode = formValues.siapeCode.trim();
      const teachingArea = formValues.teachingArea.trim();

      if (!fullName || !email || !siapeCode || !teachingArea) {
        throw new Error("Preencha todos os campos obrigatórios corretamente.");
      }

      await updateTeacherFlow({
        teacherId: selectedTeacherId,
        userId: selectedUserId,
        fullName,
        email,
        password: password.length ? password : undefined,
        siapeCode,
        teachingArea,
      });
    },
    onSuccess: () => {
      showToast("success", "Professor(a) atualizado(a) com sucesso!");
      queryClient.invalidateQueries({ queryKey: teachersKeys.teachers });

      setFormMode("view");
      setManageOpen(false);
      setFormValues((prev) => ({ ...prev, password: "" }));
    },
    onError: (err: any) => {
      const raw =
        (err?.response?.data?.message as string | undefined) ??
        (err?.message as string | undefined);

      showToast(
        "error",
        translateTeacherMessage(raw) ?? parseBackendMessage(err),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!teacherToDelete) return;
      await deleteTeacher(teacherToDelete.id);
    },
    onSuccess: () => {
      showToast("success", "Professor(a) excluído(a) com sucesso!");
      queryClient.invalidateQueries({ queryKey: teachersKeys.teachers });

      setTeacherToDelete(null);
      setSelectedTeacherId(null);
      setSelectedUserId(null);

      setFormMode("create");
      setFormValues({
        fullName: "",
        email: "",
        password: "",
        siapeCode: "",
        teachingArea: "",
      });

      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateTeacherMessage(raw) ?? parseBackendMessage(err),
      );
      setTeacherToDelete(null);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const mobileHasSelected = !!selectedTeacherId;

  function openSmartSheet() {
    if (mobileHasSelected) {
      setFormMode("view");
    } else {
      setFormMode("create");
      setFormValues({
        fullName: "",
        email: "",
        password: "",
        siapeCode: "",
        teachingArea: "",
      });
      setSelectedUserId(null);
    }
    setManageOpen(true);
  }

  return {
    teachersQuery,

    isLg,
    filteredTeachers,
    selectedTeacher,

    toast,
    closeToast,
    setToast,
    showToast,

    manageOpen,
    setManageOpen,
    search,
    setSearch,

    selectedTeacherId,
    setSelectedTeacherId,
    formMode,
    setFormMode,
    formValues,
    setFormValues,

    teacherToDelete,
    setTeacherToDelete,

    openManageIfMobile,
    openSmartSheet,
    handleNew,

    create: () => createMutation.mutate(),
    update: () => updateMutation.mutate(),
    confirmDelete: () => deleteMutation.mutate(),

    isSaving,
    isDeleting,
    mobileHasSelected,
  };
}
