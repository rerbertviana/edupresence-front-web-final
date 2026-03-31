import { api } from "@/lib/api";
import type { CourseDTO, StudentDTO, UserDTO } from "../domain/types";

export async function fetchCourses(): Promise<CourseDTO[]> {
  return (await api.get<CourseDTO[]>("/courses")).data;
}

export async function fetchStudents(): Promise<StudentDTO[]> {
  return (await api.get<StudentDTO[]>("/students")).data;
}

export async function createStudentFlow(input: {
  fullName: string;
  email: string;
  password: string;
  registrationNumber: string;
  courseId: number;
  currentSemester: number;
}) {
  const res = await api.post<{
    user: UserDTO;
    student: StudentDTO;
  }>("/students/register-with-user", {
    fullName: input.fullName,
    email: input.email,
    password: input.password,
    registrationNumber: input.registrationNumber,
    courseId: input.courseId,
    currentSemester: input.currentSemester,
  });

  return res.data.user.id;
}

export async function updateStudentFlow(input: {
  studentId: number;
  userId: number;
  fullName: string;
  email: string;
  password?: string;
  registrationNumber: string;
  courseId: number;
  currentSemester: number;
}) {
  const userBody: any = {
    fullName: input.fullName,
    email: input.email,
    role: "STUDENT",
  };

  if (input.password && input.password.trim().length > 0) {
    userBody.password = input.password.trim();
  }

  await api.put(`/users/${input.userId}`, userBody);

  await api.put(`/students/${input.studentId}`, {
    registrationNumber: input.registrationNumber,
    courseId: input.courseId,
    currentSemester: input.currentSemester,
  });
}

export async function deleteStudent(studentId: number) {
  await api.delete(`/students/${studentId}`);
}
