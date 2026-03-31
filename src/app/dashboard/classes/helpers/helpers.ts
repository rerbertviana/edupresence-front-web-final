import type { ClassDTO, Shift } from "../domain/types";
import {
  compareBySemesterDescAndShift,
  getShiftLabel as getAcademicShiftLabel,
  parseSemester,
  shiftOrder,
} from "@/helpers/academic";

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

export function compareClassesBySemesterDesc(a: ClassDTO, b: ClassDTO) {
  return compareBySemesterDescAndShift(a, b);
}

export { parseSemester, shiftOrder };

export function buildYears(range = 10) {
  const current = new Date().getFullYear();
  return Array.from({ length: range + 1 }, (_, i) => current - i);
}
