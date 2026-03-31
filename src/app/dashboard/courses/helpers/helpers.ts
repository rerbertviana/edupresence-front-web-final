export function normalizeText(v: string) {
  return (v ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function sortByNamePtBR<T extends { name?: string }>(a: T, b: T) {
  return (a.name ?? "").localeCompare(b.name ?? "", "pt-BR", {
    sensitivity: "base",
    numeric: true,
  });
}

export function ensureNonEmptyName(name: string) {
  const n = (name ?? "").trim();
  if (!n) throw new Error("Informe o nome do curso.");
  return n;
}
