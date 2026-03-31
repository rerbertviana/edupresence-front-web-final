import { api } from "@/lib/api";
import type {
  ClassSubjectDTO,
  CourseDTO,
  StudentDTO,
  EnrollmentDTO,
} from "../domain/types";

export async function fetchCourses(): Promise<CourseDTO[]> {
  return (await api.get("/courses")).data;
}

export async function fetchStudents(
  courseId?: number | null,
): Promise<StudentDTO[]> {
  if (!courseId || Number.isNaN(courseId) || courseId <= 0) return [];
  return (await api.get("/students", { params: { courseId } })).data;
}

export async function fetchClassSubjects(
  courseId?: number | null,
): Promise<ClassSubjectDTO[]> {
  if (!courseId || Number.isNaN(courseId) || courseId <= 0) return [];
  return (await api.get("/class-subjects", { params: { courseId } })).data;
}

export async function fetchEnrollments(): Promise<EnrollmentDTO[]> {
  return (await api.get("/enrollments")).data;
}

export async function createEnrollment(
  studentId: number,
  classSubjectId: number,
) {
  await api.post("/enrollments", { studentId, classSubjectId });
}

export async function updateEnrollment(
  id: number,
  studentId: number,
  classSubjectId: number,
) {
  await api.put(`/enrollments/${id}`, { studentId, classSubjectId });
}

export async function deleteEnrollment(id: number) {
  await api.delete(`/enrollments/${id}`);
}
