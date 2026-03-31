export function translateLessonMessage(raw?: string) {
  if (!raw) return undefined;

  if (raw === "Lesson end time must be after start time") {
    return "O horário de término deve ser maior que o horário de início.";
  }

  if (raw === "Invalid time format") {
    return "Horário inválido. Use o formato 00:00.";
  }

  if (raw === "Cannot reopen a lesson whose date has already passed") {
    return "Não é possível reabrir uma aula cujo horário já passou.";
  }

  if (
    raw ===
    "Cannot delete lesson because there are attendance records not marked as ABSENT (or there are justifications) linked to it."
  ) {
    return "A aula não pode ser excluída porque está vinculada a registros de presença.";
  }

  if (
    raw === "A lesson already exists for this class on the same date and time"
  ) {
    return "Já existe uma aula cadastrada para essa turma na mesma data e horário.";
  }

  if (raw === "Cannot reopen a lesson whose date/time has already passed") {
    return "Não é possível reabrir uma aula cujo horário de término já passou.";
  }

  return raw;
}
