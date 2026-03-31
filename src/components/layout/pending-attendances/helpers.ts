export function formatDateBR(dateStr?: string | null) {
  if (!dateStr) return "—";

  const base = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = base.split("-");

  if (parts.length < 3) return "—";

  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

export function formatTimeBR(value?: string | null) {
  if (!value) return "—";

  const isoMatch = value.match(/T(\d{2}):(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}:${isoMatch[2]}`;
  }

  const timeOnlyMatch = value.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
  if (timeOnlyMatch) {
    return `${timeOnlyMatch[1]}:${timeOnlyMatch[2]}`;
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTimeBR(value?: string | null) {
  if (!value) return "—";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString("pt-BR");
}
