export type FormMode = "create" | "view" | "edit";

export type CourseDTO = { id: number; name: string };

export type UserDTO = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

export type StudentDTO = {
  id: number;
  userId: number;
  registrationNumber: string;
  courseId: number;
  currentSemester: number;
  user?: UserDTO;
  course?: CourseDTO;
};
