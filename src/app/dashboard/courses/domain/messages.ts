export function translateCourseMessage(raw?: string) {
  if (!raw) return undefined;

  if (raw === "Course already exists") return "Este curso já existe!";
  if (
    raw ===
    "Cannot delete course because there are classes or students linked to it."
  )
    return "Não foi possível excluir: existem turmas ou estudantes vinculados a este curso.";

  return raw;
}
