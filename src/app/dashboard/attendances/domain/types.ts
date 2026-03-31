export type Shift = "MORNING" | "AFTERNOON" | "NIGHT" | string;
export type LessonStatus = "OPEN" | "CLOSED" | string;

export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "JUSTIFIED"
  | "PENDING"
  | string;

export type AttendanceRecordType = "CHECKIN" | "MANUAL" | string;

export type ClassSubjectDTO = {
  id: number;
  classId: number;
  subjectId: number;
  teacherId: number;
  class: {
    id: number;
    courseId: number;
    semester: string;
    shift: Shift;
    course: { id: number; name: string };
  };
  subject: { id: number; name: string; workload: number };
  teacher: {
    id: number;
    siapeCode: string;
    teachingArea: string;
    user: {
      id: number;
      fullName: string;
      email: string;
      role: string;
      createdAt: string;
    };
  };
};

export type LessonDTO = {
  id: number;
  classSubjectId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: LessonStatus;
  classSubject?: ClassSubjectDTO;
};

export type AttendanceDTO = {
  id: number;
  studentId: number;
  lessonId: number;
  recordType: AttendanceRecordType;
  recordTime: string;
  status: AttendanceStatus;
  deviceId: number | null;
  student: {
    id: number;
    registrationNumber: string;
    currentSemester: number;
    user: {
      id: number;
      fullName: string;
      email: string;
      role: string;
      createdAt: string;
    };
    course: { id: number; name: string };
  };
  justification: any | null;
};

export type ToastType = "success" | "error" | "info" | undefined;
