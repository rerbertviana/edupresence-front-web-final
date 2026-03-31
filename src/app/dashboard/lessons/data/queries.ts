"use client";

import { useQuery } from "@tanstack/react-query";
import type { ClassSubjectDTO, LessonDTO } from "../domain/types";
import {
  fetchLessonsByClassSubject,
  fetchTeacherClassSubjects,
} from "./service";

export const teacherClassSubjectsQueryKey = [
  "class-subjects",
  "teacher",
] as const;

export function useTeacherClassSubjectsQuery(enabled: boolean) {
  return useQuery<ClassSubjectDTO[]>({
    queryKey: teacherClassSubjectsQueryKey,
    queryFn: fetchTeacherClassSubjects,
    enabled,
    refetchOnWindowFocus: true,
  });
}

export function lessonsByClassSubjectQueryKey(
  classSubjectId: number | null,
  all: boolean,
) {
  return ["lessons", "by-class-subject", classSubjectId, all] as const;
}

export function useLessonsByClassSubjectQuery(args: {
  classSubjectId: number | null;
  all: boolean;
  enabled: boolean;
}) {
  const { classSubjectId, all, enabled } = args;

  return useQuery<LessonDTO[]>({
    queryKey: lessonsByClassSubjectQueryKey(classSubjectId, all),
    queryFn: () =>
      fetchLessonsByClassSubject({ classSubjectId: classSubjectId!, all }),
    enabled: enabled && !!classSubjectId,
    refetchOnWindowFocus: true,
  });
}
