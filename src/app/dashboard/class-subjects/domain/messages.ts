export function translateClassSubjectMessage(raw?: string) {
  if (!raw) return undefined;

  if (raw === "This combination of class, subject and teacher already exists") {
    return "Esta turma já existe!";
  }

  if (
    raw ===
    "Cannot delete class-subject because there are lessons linked to it."
  ) {
    return "Não foi possível excluir: existem aulas vinculadas a esta turma.";
  }

  return raw;
}
