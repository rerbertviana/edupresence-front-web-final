export function translateAdminDashboardMessage(message?: string) {
  if (!message) return "Erro ao carregar dashboard do administrador.";

  const normalized = message.trim().toLowerCase();

  if (normalized.includes("network error")) {
    return "Erro de rede ao carregar o dashboard do administrador.";
  }

  if (normalized.includes("unauthorized")) {
    return "Você não tem autorização para acessar o dashboard do administrador.";
  }

  if (normalized.includes("forbidden")) {
    return "Acesso negado ao dashboard do administrador.";
  }

  if (normalized.includes("not found")) {
    return "Os dados do dashboard do administrador não foram encontrados.";
  }

  return message;
}
