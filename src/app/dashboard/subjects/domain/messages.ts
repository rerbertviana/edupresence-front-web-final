export function translateSubjectMessage(raw?: string) {
  if (!raw) return undefined;

  if (raw === "Subject name already exists") {
    return "Esta disciplina já está cadastrada!";
  }

  if (
    raw ===
    "Cannot delete subject because there are class-subject relations linked to it."
  ) {
    return "Não foi possível excluir, disciplina vinculada a turmas ou aulas.";
  }

  return raw;
}
