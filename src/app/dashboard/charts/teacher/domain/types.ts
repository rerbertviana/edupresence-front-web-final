export type TeacherAttendanceSummaryItemDTO = {
  classSubjectId: number;
  classId: number;
  className: string;
  subjectName: string | null;
  attendanceRate: number;
};

export type TeacherTopAbsentStudentDTO = {
  studentId: number;
  studentName: string;
  absent: number;
};

export type TeacherAttendanceTimeSeriesDTO = {
  date: string;
  present: number;
  absent: number;
  justified: number;
  pending: number;
};

export type AttendanceChartItem = {
  id: number;
  name: string;
  rate: number;
  color: string;
};

export type AbsentRankingItem = {
  id: number;
  name: string;
  absent: number;
  color: string;
};

export type AttendanceTimeSeriesChartItem = {
  label: string;
  fullLabel: string;
  rate: number;
};
