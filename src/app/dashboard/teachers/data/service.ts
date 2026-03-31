import { api } from "@/lib/api";
import type { TeacherDTO, UserDTO } from "../domain/types";

export async function fetchTeachers(): Promise<TeacherDTO[]> {
  const res = await api.get<TeacherDTO[]>("/teachers");
  return res.data;
}

export async function createTeacherFlow(input: {
  fullName: string;
  email: string;
  password: string;
  siapeCode: string;
  teachingArea: string;
}): Promise<void> {
  await api.post<{ user: UserDTO; teacher: TeacherDTO }>(
    "/teachers/register-with-user",
    {
      fullName: input.fullName,
      email: input.email,
      password: input.password,
      siapeCode: input.siapeCode,
      teachingArea: input.teachingArea,
    },
  );
}

export async function updateTeacherFlow(input: {
  teacherId: number;
  userId: number;
  fullName: string;
  email: string;
  password?: string;
  siapeCode: string;
  teachingArea: string;
}): Promise<void> {
  const userBody: any = {
    fullName: input.fullName,
    email: input.email,
    role: "TEACHER",
  };

  if (input.password && input.password.trim().length > 0) {
    userBody.password = input.password.trim();
  }

  await api.put(`/users/${input.userId}`, userBody);

  await api.put(`/teachers/${input.teacherId}`, {
    siapeCode: input.siapeCode,
    teachingArea: input.teachingArea,
  });
}

export async function deleteTeacher(teacherId: number): Promise<void> {
  await api.delete(`/teachers/${teacherId}`);
}
