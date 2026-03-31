export type FormMode = "create" | "view" | "edit";

export type UserDTO = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

export type TeacherDTO = {
  id: number;
  userId: number;
  siapeCode: string;
  teachingArea: string;
  user?: UserDTO;
};

export type TeacherFormValues = {
  fullName: string;
  email: string;
  password: string;
  siapeCode: string;
  teachingArea: string;
};
