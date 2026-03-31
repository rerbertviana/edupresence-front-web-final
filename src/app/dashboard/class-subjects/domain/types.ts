export type FormMode = "create" | "view" | "edit";

export type CourseDTO = {
  id: number;
  name: string;
};

export type ClassDTO = {
  id: number;
  courseId?: number;
  semester: string;
  shift: string;
  course?: CourseDTO;
};

export type SubjectDTO = {
  id: number;
  name: string;
  workload?: number;
};

export type UserDTO = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

export type TeacherDTO = {
  id: number;
  user?: UserDTO;
};

export type ClassSubjectDTO = {
  id: number;
  classId: number;
  subjectId: number;
  teacherId: number;
  class?: ClassDTO;
  subject?: SubjectDTO;
  teacher?: TeacherDTO;
};
