export function translateStudentMessage(raw?: string) {
  if (!raw) return undefined;

  if (raw === "Invalid full name") return "Nome inválido.";
  if (raw === "Invalid email") return "E-mail inválido.";
  if (raw === "Invalid password") return "Senha inválida.";
  if (raw === "Invalid registration number") return "Matrícula inválida.";
  if (raw === "Invalid course id") return "Curso inválido.";
  if (raw === "Invalid current semester") return "Semestre inválido.";
  if (raw === "Course not found") return "Curso não encontrado.";

  if (raw === "Email is already in use")
    return "Este e-mail já está cadastrado.";

  if (raw === "Student registration number already exists")
    return "Esta matrícula já está cadastrada.";

  if (
    raw ===
    "Student cannot change course because they are already enrolled in a class"
  )
    return "O estudante não pode trocar de curso porque já está matriculado em uma turma.";

  if (
    raw ===
    "Cannot delete student because there are enrollments, attendance records or devices linked to it."
  )
    return "Não foi possível excluir, estudante vinculado a matrículas ou presenças.";

  return raw;
}
