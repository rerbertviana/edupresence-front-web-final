export function translateClassMessage(raw?: string) {
  if (!raw) return undefined;

  if (raw === "Class already exists for this course, semester and shift") {
    return "Este semestre já está cadastrado!";
  }

  if (
    raw ===
    "Cannot delete class because there are enrollments, lessons or relations linked to it."
  ) {
    return "O semestre não pode ser excluído porque está vinculado a aulas ou estudantes.";
  }

  return raw;
}
