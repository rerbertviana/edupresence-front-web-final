import { api } from "@/lib/api";
import type {
  TeacherAttendanceSummaryItemDTO,
  TeacherTopAbsentStudentDTO,
  TeacherAttendanceTimeSeriesDTO,
} from "../domain/types";

export async function fetchTeacherAttendanceSummary(teacherId: number) {
  const { data } = await api.get<TeacherAttendanceSummaryItemDTO[]>(
    `/reports/teacher/${teacherId}/attendance-summary`,
  );

  return data;
}

export async function fetchTeacherTopAbsentStudents(teacherId: number) {
  const { data } = await api.get<TeacherTopAbsentStudentDTO[]>(
    `/reports/teacher/${teacherId}/top-absent-students`,
  );

  return data;
}

export async function fetchTeacherAttendanceTimeSeries(teacherId: number) {
  const { data } = await api.get<TeacherAttendanceTimeSeriesDTO[]>(
    `/reports/teacher/${teacherId}/attendance-timeseries`,
  );

  return data;
}
