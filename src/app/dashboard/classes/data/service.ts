import { api } from "@/lib/api";
import type { ClassDTO, CourseDTO } from "../domain/types";

export async function fetchCourses(): Promise<CourseDTO[]> {
  const response = await api.get<CourseDTO[]>("/courses");
  return response.data;
}

export async function fetchClasses(): Promise<ClassDTO[]> {
  const response = await api.get<ClassDTO[]>("/classes");
  return response.data;
}

export async function createClass(input: {
  courseId: number;
  semester: string;
  shift: string;
}) {
  await api.post("/classes", input);
}

export async function updateClass(
  classId: number,
  input: { courseId: number; semester: string; shift: string },
) {
  await api.put(`/classes/${classId}`, input);
}

export async function deleteClass(classId: number) {
  await api.delete(`/classes/${classId}`);
}
