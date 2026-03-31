import { api } from "@/lib/api";
import type {
  ClassDTO,
  ClassSubjectDTO,
  CourseDTO,
  SubjectDTO,
  TeacherDTO,
} from "../domain/types";

export async function fetchCourses(): Promise<CourseDTO[]> {
  const res = await api.get<CourseDTO[]>("/courses");
  return res.data;
}

export async function fetchClasses(): Promise<ClassDTO[]> {
  const res = await api.get<ClassDTO[]>("/classes");
  return res.data;
}

export async function fetchSubjects(): Promise<SubjectDTO[]> {
  const res = await api.get<SubjectDTO[]>("/subjects");
  return res.data;
}

export async function fetchTeachers(): Promise<TeacherDTO[]> {
  const res = await api.get<TeacherDTO[]>("/teachers");
  return res.data;
}

export async function fetchClassSubjects(): Promise<ClassSubjectDTO[]> {
  const res = await api.get<ClassSubjectDTO[]>("/class-subjects");
  return res.data;
}

export async function createClassSubject(input: {
  classId: number;
  subjectId: number;
  teacherId: number;
}): Promise<void> {
  await api.post("/class-subjects", input);
}

export async function updateClassSubject(
  id: number,
  input: { classId: number; subjectId: number; teacherId: number },
): Promise<void> {
  await api.put(`/class-subjects/${id}`, input);
}

export async function deleteClassSubject(id: number): Promise<void> {
  await api.delete(`/class-subjects/${id}`);
}
