export type Shift = "MORNING" | "AFTERNOON" | "NIGHT" | string;
export type LessonStatus = "OPEN" | "CLOSED" | string;
export type FormMode = "create" | "view" | "edit";

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
    user: { id: number; fullName: string; email: string; role: string };
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
