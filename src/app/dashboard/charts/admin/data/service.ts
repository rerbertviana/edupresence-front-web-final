import { api } from "@/lib/api";
import type {
  AdminCourseAttendanceSummaryDTO,
  AdminLowestAttendanceClassDTO,
  AdminOverviewDTO,
} from "../domain/types";

export async function fetchAdminOverview() {
  const { data } = await api.get<AdminOverviewDTO>("/reports/admin/overview");
  return data;
}

export async function fetchAdminCoursesAttendanceSummary() {
  const { data } = await api.get<AdminCourseAttendanceSummaryDTO[]>(
    "/reports/admin/courses/attendance-summary",
  );

  return data;
}

export async function fetchAdminLowestAttendanceClasses() {
  const { data } = await api.get<AdminLowestAttendanceClassDTO[]>(
    "/reports/admin/classes/lowest-attendance",
  );

  return data;
}
