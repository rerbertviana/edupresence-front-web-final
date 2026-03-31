export type CourseDTO = {
  id: number;
  name: string;
};

export type UserDTO = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

export type StudentDTO = {
  id: number;
  courseId: number;
  registrationNumber: string;
  user?: UserDTO;
  course?: CourseDTO;
};

export type TeacherDTO = {
  id: number;
  user?: UserDTO;
};

export type SubjectDTO = {
  id: number;
  name: string;
  workload: number;
};

export type ClassDTO = {
  id: number;
  courseId?: number;
  semester: string;
  shift: string;
  course?: CourseDTO;
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

export type EnrollmentDTO = {
  id: number;
  studentId: number;
  classSubjectId: number;
  student?: StudentDTO;
  classSubject?: ClassSubjectDTO;
};

export type FormMode = "create" | "view" | "edit";
