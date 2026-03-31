import type { ClassSubjectDTO, LessonDTO, Shift } from "../domain/types";
import {
  getShiftLabel as getAcademicShiftLabel,
  normalizeText,
  parseSemester,
  shiftOrder,
} from "@/helpers/academic";

export function parseBackendMessage(err: any): string {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Erro inesperado."
  );
}

export function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const base = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = base.split("-");
  if (parts.length < 3) return "—";
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

export function extractHHMM(v: string | null | undefined): string | null {
  if (!v) return null;

  if (v.includes("T")) {
    const timePart = v.split("T")[1] ?? "";
    const hhmm = timePart.slice(0, 5);
    if (/^\d{2}:\d{2}$/.test(hhmm)) return hhmm;
  }

  const trimmed = v.trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;

  const d = new Date(v);
  if (!Number.isNaN(d.getTime())) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  return null;
}

export function formatTimeBR(v: string | null | undefined): string {
  if (!v) return "—";
  if (v.includes("T")) {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) {
      const hh = String(d.getUTCHours()).padStart(2, "0");
      const mm = String(d.getUTCMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    }
  }
  const hhmm = extractHHMM(v);
  if (hhmm) return hhmm;
  return "—";
}

export function getLessonEndLocal(lesson: LessonDTO): Date | null {
  const ymd = lesson.date?.includes("T")
    ? lesson.date.split("T")[0]
    : lesson.date;

  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;

  const hhmm = extractHHMM(lesson.endTime);
  if (!hhmm) return null;

  const d = new Date(`${ymd}T${hhmm}:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function isLessonExpired(lesson: LessonDTO) {
  const endLocal = getLessonEndLocal(lesson);

  if (!endLocal) {
    const end = new Date(lesson.endTime);
    if (Number.isNaN(end.getTime())) return false;
    return end.getTime() < Date.now();
  }

  return endLocal.getTime() < Date.now();
}

export function compareClassSubjectsBySemesterDesc(
  a: ClassSubjectDTO,
  b: ClassSubjectDTO,
) {
  const sa = parseSemester(a.class?.semester);
  const sb = parseSemester(b.class?.semester);

  if (sa.year !== sb.year) return sb.year - sa.year;
  if (sa.term !== sb.term) return sb.term - sa.term;

  return shiftOrder(a.class?.shift) - shiftOrder(b.class?.shift);
}

export function shiftLabel(shift: Shift) {
  return getAcademicShiftLabel(shift);
}

export function shiftPillClass(shift: Shift) {
  if (shift === "MORNING")
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (shift === "AFTERNOON")
    return "bg-orange-100 text-orange-800 border-orange-200";
  if (shift === "NIGHT") return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export { normalizeText, parseSemester, shiftOrder };
