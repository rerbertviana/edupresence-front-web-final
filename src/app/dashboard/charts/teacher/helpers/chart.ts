import { BAR_COLORS, PIE_COLORS } from "./constants";
import type {
  TeacherAttendanceSummaryItemDTO,
  TeacherTopAbsentStudentDTO,
  TeacherAttendanceTimeSeriesDTO,
  AttendanceChartItem,
  AbsentRankingItem,
  AttendanceTimeSeriesChartItem,
} from "../domain/types";
import { buildDisplayName, formatShortDate, safeNumber } from "./format";

export function getAttendanceChartHeight(count: number) {
  if (count <= 1) return 180;
  if (count === 2) return 220;
  if (count === 3) return 250;
  if (count === 4) return 280;
  if (count === 5) return 315;
  return 350;
}

export function buildAttendanceChartData(
  items: TeacherAttendanceSummaryItemDTO[] = [],
): AttendanceChartItem[] {
  return items
    .map((item, index) => ({
      id: item.classSubjectId,
      name: buildDisplayName(item.subjectName, item.className),
      rate: Math.round(safeNumber(item.attendanceRate) * 100),
      color: BAR_COLORS[index % BAR_COLORS.length],
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 6);
}

export function buildAbsentRankingData(
  items: TeacherTopAbsentStudentDTO[] = [],
): AbsentRankingItem[] {
  return items
    .map((item, index) => ({
      id: item.studentId,
      name: item.studentName,
      absent: safeNumber(item.absent),
      color: PIE_COLORS[index % PIE_COLORS.length],
    }))
    .filter((item) => item.absent > 0)
    .sort((a, b) => b.absent - a.absent)
    .slice(0, 5);
}

export function buildAttendanceTimeSeriesData(
  items: TeacherAttendanceTimeSeriesDTO[] = [],
): AttendanceTimeSeriesChartItem[] {
  const normalized = items.map((item) => {
    const present = safeNumber(item.present);
    const absent = safeNumber(item.absent);
    const justified = safeNumber(item.justified);
    const total = present + absent + justified;

    return {
      date: item.date,
      present,
      absent,
      justified,
      total,
    };
  });

  const shouldGroupByMonth = normalized.length > 12;

  if (!shouldGroupByMonth) {
    return normalized.map((item) => ({
      label: formatShortDate(item.date),
      fullLabel: item.date,
      rate: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0,
    }));
  }

  const grouped = new Map<
    string,
    { present: number; absent: number; justified: number; total: number }
  >();

  for (const item of normalized) {
    const monthKey = item.date.slice(0, 7);

    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, {
        present: 0,
        absent: 0,
        justified: 0,
        total: 0,
      });
    }

    const current = grouped.get(monthKey)!;
    current.present += item.present;
    current.absent += item.absent;
    current.justified += item.justified;
    current.total += item.total;
  }

  return Array.from(grouped.entries()).map(([monthKey, value]) => {
    const [year, month] = monthKey.split("-");
    const label = `${month}/${year.slice(2)}`;

    return {
      label,
      fullLabel: monthKey,
      rate:
        value.total > 0 ? Math.round((value.present / value.total) * 100) : 0,
    };
  });
}
