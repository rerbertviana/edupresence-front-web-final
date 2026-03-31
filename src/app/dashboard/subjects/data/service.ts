import { api } from "@/lib/api";
import type { SubjectDTO } from "../domain/types";

export async function fetchSubjects(): Promise<SubjectDTO[]> {
  return (await api.get<SubjectDTO[]>("/subjects")).data;
}

export async function createSubject(input: { name: string; workload: number }) {
  await api.post("/subjects", input);
}

export async function updateSubject(input: {
  id: number;
  name: string;
  workload: number;
}) {
  await api.put(`/subjects/${input.id}`, {
    name: input.name,
    workload: input.workload,
  });
}

export async function deleteSubject(id: number) {
  await api.delete(`/subjects/${id}`);
}
