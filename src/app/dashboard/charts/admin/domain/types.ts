export type AdminOverviewDTO = {
  totalRecords: number;
  present: number;
  absent: number;
  justified: number;
  pending: number;
  attendanceRate: number;
};

export type AdminCourseAttendanceSummaryDTO = {
  courseId: number;
  courseName: string;
  totalRecords: number;
  present: number;
  absent: number;
  justified: number;
  pending: number;
  attendanceRate: number;
};

export type AdminLowestAttendanceClassDTO = {
  classSubjectId: number;
  classId: number;
  className: string;
  subjectName: string | null;
  courseName: string | null;
  totalRecords: number;
  present: number;
  absent: number;
  justified: number;
  pending: number;
  attendanceRate: number;
};

export type AdminOverviewCardData = {
  totalRecords: number;
  attendanceRate: number;
  absent: number;
  justified: number;
};

export type CourseAttendanceChartItem = {
  id: number;
  name: string;
  fullName: string;
  rate: number;
  color: string;
};

export type LowestAttendanceClassChartItem = {
  id: number;
  name: string;
  fullName: string;
  rate: number;
  color: string;
};
