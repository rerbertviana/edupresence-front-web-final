export function translateTeacherDashboardMessage(message?: string) {
  if (!message) return "Erro ao carregar gráficos do dashboard.";

  const normalized = message.trim().toLowerCase();

  if (normalized.includes("network error")) {
    return "Erro de rede ao carregar os gráficos do dashboard.";
  }

  if (normalized.includes("unauthorized")) {
    return "Você não tem autorização para acessar os gráficos do dashboard.";
  }

  if (normalized.includes("forbidden")) {
    return "Acesso negado aos gráficos do dashboard.";
  }

  if (normalized.includes("not found")) {
    return "Os dados do dashboard não foram encontrados.";
  }

  return message;
}
