import type { ClassDTO } from "../domain/types";
import {
  compareBySemesterDescAndShift,
  getShiftLabel as getAcademicShiftLabel,
} from "@/helpers/academic";

export function getShiftLabel(shift?: string) {
  return getAcademicShiftLabel(shift);
}

export function compareClassesBySemesterShiftDesc(a: ClassDTO, b: ClassDTO) {
  return compareBySemesterDescAndShift(a, b);
}

export function getShiftBadgeClass(shift?: string) {
  if (shift === "MORNING") return "bg-amber-50 text-amber-700 border-amber-200";
  if (shift === "AFTERNOON")
    return "bg-orange-50 text-orange-700 border-orange-200";
  if (shift === "NIGHT")
    return "bg-indigo-50 text-indigo-700 border-indigo-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}
