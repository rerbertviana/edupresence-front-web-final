import { api } from "@/lib/api";
import type { CourseDTO } from "../domain/types";
import { ensureNonEmptyName } from "../helpers/helpers";

export async function fetchCourses(): Promise<CourseDTO[]> {
  const res = await api.get<CourseDTO[]>("/courses");
  return res.data;
}

export async function createCourse(name: string) {
  const safeName = ensureNonEmptyName(name);
  await api.post("/courses", { name: safeName });
}

export async function updateCourse(courseId: number, name: string) {
  const safeName = ensureNonEmptyName(name);
  await api.put(`/courses/${courseId}`, { name: safeName });
}

export async function deleteCourse(courseId: number) {
  await api.delete(`/courses/${courseId}`);
}
