export function translateEnrollmentMessage(raw?: string) {
  if (!raw) return undefined;

  if (raw === "Student is already enrolled in this class-subject") {
    return "Estudante já está matriculado nesta turma!";
  }

  if (
    raw ===
    "Student cannot be enrolled because the class belongs to a different course"
  ) {
    return "Estudante não pode ser matriculado porque a turma pertence a outro curso.";
  }

  if (
    raw ===
    "Cannot delete enrollment because there are related records linked to it."
  ) {
    return "Não foi possível excluir, matrícula vinculada a registros de presença.";
  }

  return raw;
}
