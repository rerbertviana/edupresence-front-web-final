export type FormMode = "create" | "view" | "edit";

export type Shift = "MORNING" | "AFTERNOON" | "NIGHT" | string;

export type CourseDTO = {
  id: number;
  name: string;
};

export type ClassDTO = {
  id: number;
  courseId: number;
  semester: string;
  shift: Shift;
};

export type FormValues = {
  courseId: string;
  year: string;
  period: string;
  semester: string;
  shift: string;
};
