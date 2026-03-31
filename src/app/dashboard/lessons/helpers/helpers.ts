import type { ClassSubjectDTO, LessonDTO, Shift } from "../domain/types";
import {
  getShiftLabel as getAcademicShiftLabel,
  normalizeText,
  parseSemester,
  shiftOrder,
} from "@/helpers/academic";

export function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const base = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = base.split("-");
  if (parts.length < 3) return "—";
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

export function formatTimeBR(isoStr: string | null | undefined): string {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return "—";

  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function timeInputValueFromISO(
  isoStr: string | null | undefined,
): string {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return "";

  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function buildDateTimeISO(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split("-").map((p) => Number(p));
  const [hour, minute] = timeStr.split(":").map((p) => Number(p));
  const d = new Date(year, month - 1, day, hour, minute, 0, 0);
  return d.toISOString();
}

export function parseISODateToLocalDate(dateStr: string | null | undefined) {
  if (!dateStr) return undefined;
  const base = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const [y, m, d] = base.split("-").map((p) => Number(p));
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

export function convertToYMD(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

export function isLessonExpired(lesson: LessonDTO) {
  const end = new Date(lesson.endTime);
  if (Number.isNaN(end.getTime())) return false;
  return end.getTime() < Date.now();
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

export { normalizeText };

export function maskHHMM(input: string) {
  let v = input.replace(/\D/g, "");
  if (v.length > 4) v = v.slice(0, 4);

  if (v.length >= 1) {
    if (parseInt(v[0]) > 2) v = "2" + v.slice(1);
  }
  if (v.length >= 2) {
    const h1 = parseInt(v[0]);
    const h2 = parseInt(v[1]);
    if (h1 === 2 && h2 > 3) v = v[0] + "3" + v.slice(2);
  }
  if (v.length >= 3) {
    if (parseInt(v[2]) > 5) v = v.slice(0, 2) + "5" + v.slice(3);
  }

  if (v.length >= 3) v = v.replace(/(\d{2})(\d{1,2})/, "$1:$2");
  return v;
}
