import { api } from "@/lib/api";
import type { ClassSubjectDTO, LessonDTO, LessonStatus } from "../domain/types";

export async function fetchTeacherClassSubjects(): Promise<ClassSubjectDTO[]> {
  const res = await api.get<ClassSubjectDTO[]>(
    "/class-subjects/filters/teacher",
  );
  return res.data;
}

export async function fetchLessonsByClassSubject(args: {
  classSubjectId: number;
  all: boolean;
}): Promise<LessonDTO[]> {
  const { classSubjectId, all } = args;
  const endpoint = all
    ? `/lessons/filters/by-class-subject/${classSubjectId}`
    : `/lessons/filters/by-class-subject/${classSubjectId}/upcoming`;

  const res = await api.get<LessonDTO[]>(endpoint);
  return res.data;
}

export async function createLesson(payload: {
  classSubjectId: number;
  date: string;
  startTimeISO: string;
  endTimeISO: string;
}) {
  await api.post("/lessons", {
    classSubjectId: payload.classSubjectId,
    date: payload.date,
    startTime: payload.startTimeISO,
    endTime: payload.endTimeISO,
  });
}

export async function updateLesson(payload: {
  lessonId: number;
  classSubjectId: number;
  date: string;
  startTimeISO: string;
  endTimeISO: string;
  status: LessonStatus;
}) {
  await api.put(`/lessons/${payload.lessonId}`, {
    classSubjectId: payload.classSubjectId,
    date: payload.date,
    startTime: payload.startTimeISO,
    endTime: payload.endTimeISO,
    status: payload.status,
  });
}

export async function deleteLesson(lessonId: number) {
  await api.delete(`/lessons/${lessonId}`);
}

export async function updateLessonStatus(payload: {
  lesson: LessonDTO;
  nextStatus: "OPEN" | "CLOSED";
}) {
  const { lesson, nextStatus } = payload;

  await api.put(`/lessons/${lesson.id}`, {
    classSubjectId: lesson.classSubjectId,
    date: lesson.date,
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    status: nextStatus,
  });
}
