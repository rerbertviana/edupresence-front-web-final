import { api } from "@/lib/api";
import type {
  AttendanceDTO,
  AttendanceStatus,
  ClassSubjectDTO,
  LessonDTO,
  LessonStatus,
} from "../domain/types";

export const attendancesService = {
  async getTeacherClassSubjects(): Promise<ClassSubjectDTO[]> {
    return (await api.get("/class-subjects/filters/teacher")).data;
  },

  async getLessonsByClassSubject(classSubjectId: number): Promise<LessonDTO[]> {
    return (
      await api.get(`/lessons/filters/by-class-subject/${classSubjectId}`)
    ).data;
  },

  async getUpcomingLessonsByClassSubject(
    classSubjectId: number,
  ): Promise<LessonDTO[]> {
    return (
      await api.get(
        `/lessons/filters/by-class-subject/${classSubjectId}/upcoming`,
      )
    ).data;
  },

  async getAttendancesByLesson(lessonId: number): Promise<AttendanceDTO[]> {
    return (await api.get(`/attendances/filters/by-lesson/${lessonId}`)).data;
  },

  async updateLessonStatus(args: {
    lesson: LessonDTO;
    nextStatus: LessonStatus;
  }) {
    const { lesson, nextStatus } = args;

    await api.put(`/lessons/${lesson.id}`, {
      classSubjectId: lesson.classSubjectId,
      date: lesson.date,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      status: nextStatus,
    });
  },

  async updateAttendanceStatus(args: { id: number; status: AttendanceStatus }) {
    await api.put(`/attendances/${args.id}`, {
      status: args.status,
      recordType: "MANUAL",
    });
  },

  async bulkUpdateAttendancesStatus(args: {
    ids: number[];
    status: AttendanceStatus;
  }) {
    await Promise.all(
      args.ids.map((id) =>
        api.put(`/attendances/${id}`, {
          status: args.status,
          recordType: "MANUAL",
        }),
      ),
    );
  },
};
