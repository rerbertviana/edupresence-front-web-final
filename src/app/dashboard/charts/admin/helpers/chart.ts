import { BAR_COLORS } from "./constants";
import { safeNumber } from "./format";
import type {
  AdminCourseAttendanceSummaryDTO,
  AdminLowestAttendanceClassDTO,
  AdminOverviewCardData,
  AdminOverviewDTO,
  CourseAttendanceChartItem,
  LowestAttendanceClassChartItem,
} from "../domain/types";

export function getBarChartHeight(count: number) {
  if (count <= 1) return 180;
  if (count === 2) return 220;
  if (count === 3) return 250;
  if (count === 4) return 285;
  if (count === 5) return 320;
  return 355;
}

export function buildOverviewData(
  overview?: AdminOverviewDTO,
): AdminOverviewCardData {
  return {
    totalRecords: safeNumber(overview?.totalRecords),
    attendanceRate: Math.round(safeNumber(overview?.attendanceRate) * 100),
    absent: safeNumber(overview?.absent),
    justified: safeNumber(overview?.justified),
  };
}

export function buildCoursesChartData(
  items: AdminCourseAttendanceSummaryDTO[] = [],
): CourseAttendanceChartItem[] {
  return items
    .map((item, index) => {
      const rate = Math.round(safeNumber(item.attendanceRate) * 100);

      return {
        id: item.courseId,
        name: item.courseName,
        fullName: item.courseName,
        rate,
        color: BAR_COLORS[index % BAR_COLORS.length],
      };
    })
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 6);
}

export function buildLowestClassesChartData(
  items: AdminLowestAttendanceClassDTO[] = [],
): LowestAttendanceClassChartItem[] {
  return items
    .map((item, index) => {
      const rate = Math.round(safeNumber(item.attendanceRate) * 100);
      const fullName = `${item.subjectName ?? "Sem disciplina"} • ${item.className} • ${item.courseName ?? "Sem curso"}`;

      return {
        id: item.classSubjectId,
        name: fullName,
        fullName,
        rate,
        color: BAR_COLORS[index % BAR_COLORS.length],
      };
    })
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 5);
}
