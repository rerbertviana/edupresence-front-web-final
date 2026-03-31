export function translateTeacherMessage(raw?: string) {
  if (!raw) return undefined;

  if (raw === "Invalid full name") return "Nome inválido.";
  if (raw === "Invalid email") return "E-mail inválido.";
  if (raw === "Invalid password") return "Senha inválida.";
  if (raw === "Invalid SIAPE code") return "Código SIAPE inválido.";
  if (raw === "Invalid teaching area") return "Área de atuação inválida.";

  if (raw === "Email is already in use")
    return "Este e-mail já está cadastrado.";

  if (raw === "SIAPE code already exists")
    return "Este código SIAPE já está cadastrado.";

  if (
    raw ===
    "Cannot delete teacher because there are class subjects or justifications linked to it."
  ) {
    return "Não foi possível excluir, professor vinculado a turmas ou justificativas.";
  }

  return raw;
}
