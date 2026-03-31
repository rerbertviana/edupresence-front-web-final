export type SemesterInfo = {
  year: number;
  term: number;
};

export const SHIFT_LABELS: Record<string, string> = {
  MORNING: "Matutino",
  AFTERNOON: "Vespertino",
  NIGHT: "Noturno",
};

export function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function getShiftLabel(shift?: string | null) {
  if (!shift) return "—";
  return SHIFT_LABELS[shift] ?? shift;
}

export function shiftOrder(shift?: string | null) {
  if (shift === "MORNING") return 1;
  if (shift === "AFTERNOON") return 2;
  if (shift === "NIGHT") return 3;
  return 9;
}

export function parseSemester(semester?: string | null): SemesterInfo {
  if (!semester) return { year: 0, term: 0 };

  const [rawYear, rawTerm] = semester.trim().split(".");
  const year = Number(rawYear);
  const term = Number(rawTerm);

  return {
    year: Number.isFinite(year) ? year : 0,
    term: Number.isFinite(term) ? term : 0,
  };
}

export function compareBySemesterDescAndShift(
  a: { semester?: string | null; shift?: string | null },
  b: { semester?: string | null; shift?: string | null },
) {
  const sa = parseSemester(a.semester);
  const sb = parseSemester(b.semester);

  if (sa.year !== sb.year) return sb.year - sa.year;
  if (sa.term !== sb.term) return sb.term - sa.term;

  return shiftOrder(a.shift) - shiftOrder(b.shift);
}
