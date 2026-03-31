"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/useToast";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import { normalizeText } from "@/lib/text";
import { parseBackendMessage } from "@/lib/httpErrors";

import type {
  ClassDTO,
  ClassSubjectDTO,
  FormMode,
} from "../domain/types";

import { translateClassSubjectMessage } from "../domain/messages";
import { classSubjectsQueries, classSubjectsKeys } from "../data/queries";
import {
  createClassSubject,
  deleteClassSubject,
  updateClassSubject,
} from "../data/service";

import {
  compareClassesBySemesterShiftDesc,
  getShiftLabel,
} from "../helpers/helpers";

export function useClassSubjectsController() {
  const queryClient = useQueryClient();
  const { toast, showToast, closeToast, setToast } = useToast();
  const isLg = useMediaQuery("(min-width: 1024px)");

  const [manageOpen, setManageOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedLinkId, setSelectedLinkId] = useState<number | null>(null);

  const [formMode, setFormMode] = useState<FormMode>("create");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const [linkToDelete, setLinkToDelete] = useState<ClassSubjectDTO | null>(
    null,
  );

  function openManageIfMobile() {
    if (!isLg) setManageOpen(true);
  }

  const coursesQuery = useQuery(classSubjectsQueries.courses());
  const classesQuery = useQuery(classSubjectsQueries.classes());
  const subjectsQuery = useQuery(classSubjectsQueries.subjects());
  const teachersQuery = useQuery(classSubjectsQueries.teachers());
  const linksQuery = useQuery(classSubjectsQueries.classSubjects());

  const { data: courses } = coursesQuery;
  const { data: classes } = classesQuery;
  const { data: subjects } = subjectsQuery;
  const { data: teachers } = teachersQuery;
  const { data: links } = linksQuery;

  const selectedLink = useMemo(() => {
    if (!selectedLinkId || !(links?.length ?? 0)) return null;
    return links!.find((x) => x.id === selectedLinkId) ?? null;
  }, [selectedLinkId, links]);

  useEffect(() => {
    if (!selectedLink) return;

    setClassId(String(selectedLink.classId));
    setSubjectId(String(selectedLink.subjectId));
    setTeacherId(String(selectedLink.teacherId));
    setFormMode("view");
  }, [selectedLink]);

  function handleNew() {
    setSelectedLinkId(null);
    setFormMode("create");
    setClassId("");
    setSubjectId("");
    setTeacherId("");
    setLinkToDelete(null);
    if (!isLg) setManageOpen(true);
  }

  const getCourseName = useCallback(
    (c?: ClassDTO) => {
      if (!c) return "—";
      if (c.course?.name) return c.course.name;
      const cid = c.courseId ?? c.course?.id;
      return courses?.find((x) => x.id === cid)?.name ?? "—";
    },
    [courses],
  );

  const getClassLabelNoShift = useCallback(
    (c?: ClassDTO) => {
      if (!c) return "—";
      return `${c.semester ?? "—"} - ${getCourseName(c)}`;
    },
    [getCourseName],
  );

  const getLinkText = useCallback(
    (e: ClassSubjectDTO) => {
      const c = e.class ?? classes?.find((x) => x.id === e.classId);
      const s = e.subject ?? subjects?.find((x) => x.id === e.subjectId);
      const t = e.teacher ?? teachers?.find((x) => x.id === e.teacherId);

      return `${getClassLabelNoShift(c)} ${getShiftLabel(c?.shift)} ${
        s?.name ?? ""
      } ${t?.user?.fullName ?? ""}`;
    },
    [classes, subjects, teachers, getClassLabelNoShift],
  );

  const filteredLinks = useMemo(() => {
    const base = links ?? [];
    const q = normalizeText(search);

    const filtered = !q
      ? base
      : base.filter((e) => normalizeText(getLinkText(e)).includes(q));

    return [...filtered].sort((a, b) => {
      const ca = a.class ?? classes?.find((x) => x.id === a.classId);
      const cb = b.class ?? classes?.find((x) => x.id === b.classId);

      if (!ca && !cb) return 0;
      if (!ca) return 1;
      if (!cb) return -1;

      return compareClassesBySemesterShiftDesc(ca, cb);
    });
  }, [links, search, getLinkText, classes]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const classIdNumber = Number(classId);
      const subjectIdNumber = Number(subjectId);
      const teacherIdNumber = Number(teacherId);

      if (!classId.trim() || Number.isNaN(classIdNumber))
        throw new Error("Selecione o semestre.");
      if (!subjectId.trim() || Number.isNaN(subjectIdNumber))
        throw new Error("Selecione a disciplina.");
      if (!teacherId.trim() || Number.isNaN(teacherIdNumber))
        throw new Error("Selecione o(a) professor(a).");

      await createClassSubject({
        classId: classIdNumber,
        subjectId: subjectIdNumber,
        teacherId: teacherIdNumber,
      });
    },
    onSuccess: () => {
      showToast("success", "Turma criada com sucesso!");
      queryClient.invalidateQueries({
        queryKey: classSubjectsKeys.classSubjects,
      });

      setFormMode("create");
      setClassId("");
      setSubjectId("");
      setTeacherId("");
      setSelectedLinkId(null);

      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateClassSubjectMessage(raw) ?? parseBackendMessage(err),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedLinkId) throw new Error("Selecione uma turma.");

      const classIdNumber = Number(classId);
      const subjectIdNumber = Number(subjectId);
      const teacherIdNumber = Number(teacherId);

      if (!classId.trim() || Number.isNaN(classIdNumber))
        throw new Error("Selecione o semestre.");
      if (!subjectId.trim() || Number.isNaN(subjectIdNumber))
        throw new Error("Selecione a disciplina.");
      if (!teacherId.trim() || Number.isNaN(teacherIdNumber))
        throw new Error("Selecione o(a) professor(a).");

      await updateClassSubject(selectedLinkId, {
        classId: classIdNumber,
        subjectId: subjectIdNumber,
        teacherId: teacherIdNumber,
      });
    },
    onSuccess: () => {
      showToast("success", "Turma atualizada com sucesso!");
      queryClient.invalidateQueries({
        queryKey: classSubjectsKeys.classSubjects,
      });

      setFormMode("view");
      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw =
        (err?.response?.data?.message as string | undefined) ??
        (err?.message as string | undefined);

      showToast(
        "error",
        translateClassSubjectMessage(raw) ?? parseBackendMessage(err),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!linkToDelete) return;
      await deleteClassSubject(linkToDelete.id);
    },
    onSuccess: () => {
      showToast("success", "Turma excluída com sucesso!");
      queryClient.invalidateQueries({
        queryKey: classSubjectsKeys.classSubjects,
      });

      setLinkToDelete(null);
      setSelectedLinkId(null);

      setFormMode("create");
      setClassId("");
      setSubjectId("");
      setTeacherId("");

      setManageOpen(false);
    },
    onError: (err: any) => {
      const raw = err?.response?.data?.message as string | undefined;
      showToast(
        "error",
        translateClassSubjectMessage(raw) ?? parseBackendMessage(err),
      );
      setLinkToDelete(null);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const mobileHasSelected = !!selectedLinkId;

  function openSmartSheet() {
    if (mobileHasSelected) {
      setFormMode("view");
    } else {
      setFormMode("create");
      setClassId("");
      setSubjectId("");
      setTeacherId("");
    }
    setManageOpen(true);
  }

  return {
    coursesQuery,
    classesQuery,
    subjectsQuery,
    teachersQuery,
    linksQuery,

    courses,
    classes,
    subjects,
    teachers,
    links,

    isLg,
    filteredLinks,
    selectedLink,

    toast,
    closeToast,
    setToast,
    showToast,

    manageOpen,
    setManageOpen,
    search,
    setSearch,

    selectedLinkId,
    setSelectedLinkId,
    formMode,
    setFormMode,
    classId,
    setClassId,
    subjectId,
    setSubjectId,
    teacherId,
    setTeacherId,

    linkToDelete,
    setLinkToDelete,

    openManageIfMobile,
    openSmartSheet,
    handleNew,

    create: () => createMutation.mutate(),
    update: () => updateMutation.mutate(),
    confirmDelete: () => deleteMutation.mutate(),

    isSaving,
    isDeleting,
    mobileHasSelected,

    getClassLabelNoShift,
  };
}
