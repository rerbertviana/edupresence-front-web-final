import {
  fetchTeacherAttendanceSummary,
  fetchTeacherTopAbsentStudents,
  fetchTeacherAttendanceTimeSeries,
} from "./service";

export const teacherDashboardQueries = {
  attendanceSummary: (teacherId: number | null) => ({
    queryKey: ["teacher-dashboard", "attendance-summary", teacherId],
    queryFn: () => fetchTeacherAttendanceSummary(Number(teacherId)),
    enabled: !!teacherId,
  }),

  topAbsentStudents: (teacherId: number | null) => ({
    queryKey: ["teacher-dashboard", "top-absent-students", teacherId],
    queryFn: () => fetchTeacherTopAbsentStudents(Number(teacherId)),
    enabled: !!teacherId,
  }),

  attendanceTimeSeries: (teacherId: number | null) => ({
    queryKey: ["teacher-dashboard", "attendance-timeseries", teacherId],
    queryFn: () => fetchTeacherAttendanceTimeSeries(Number(teacherId)),
    enabled: !!teacherId,
  }),
};
