export function roleLabel(role?: string) {
  if (!role) return "-";

  const roleMap: Record<string, string> = {
    ADMIN: "Administrador",
    TEACHER: "Professor",
  };

  return roleMap[role] ?? role;
}
