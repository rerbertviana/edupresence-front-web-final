import {
  fetchAdminCoursesAttendanceSummary,
  fetchAdminLowestAttendanceClasses,
  fetchAdminOverview,
} from "./service";

export const adminDashboardQueries = {
  overview: () => ({
    queryKey: ["admin-dashboard", "overview"],
    queryFn: fetchAdminOverview,
  }),

  coursesAttendanceSummary: () => ({
    queryKey: ["admin-dashboard", "courses-attendance-summary"],
    queryFn: fetchAdminCoursesAttendanceSummary,
  }),

  lowestAttendanceClasses: () => ({
    queryKey: ["admin-dashboard", "lowest-attendance-classes"],
    queryFn: fetchAdminLowestAttendanceClasses,
  }),
};
